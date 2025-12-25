import { NextRequest, NextResponse } from "next/server";

// Parse PDF directly to count pages (more reliable than pdf.js on server-side)
function getPDFPageCountFromBuffer(buffer: Buffer): number {
  try {
    const pdfText = buffer.toString('binary');
    
    // CRITICAL: We must find the ROOT Pages object, not intermediate Pages objects
    // The root Pages object is the one referenced by /Root in the trailer
    
    // Method 1: Find the root object via trailer (most reliable)
    const trailerMatch = pdfText.match(/trailer\s*<<([\s\S]{0,5000}?)>>/i);
    if (trailerMatch) {
      const trailerContent = trailerMatch[1];
      
      // Find /Root reference in trailer
      const rootMatch = trailerContent.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
      if (rootMatch) {
        const rootObjNum = rootMatch[1];
        const rootGenNum = rootMatch[2];
        
        // Find the Catalog object (referenced by /Root)
        const catalogObjRegex = new RegExp(`${rootObjNum}\\s+${rootGenNum}\\s+obj[\\s\\S]{0,5000}?endobj`, 'i');
        const catalogMatch = pdfText.match(catalogObjRegex);
        
        if (catalogMatch) {
          const catalogContent = catalogMatch[0];
          
          // In the Catalog, find /Pages reference
          const pagesRefMatch = catalogContent.match(/\/Pages\s+(\d+)\s+(\d+)\s+R/);
          if (pagesRefMatch) {
            const pagesObjNum = pagesRefMatch[1];
            const pagesGenNum = pagesRefMatch[2];
            
            // Now find the actual Pages object
            const pagesObjRegex = new RegExp(`${pagesObjNum}\\s+${pagesGenNum}\\s+obj[\\s\\S]{0,5000}?/Type\\s*/Pages[\\s\\S]{0,2000}?/Count\\s+(\\d+)[\\s\\S]{0,1000}?endobj`, 'i');
            const pagesObjMatch = pdfText.match(pagesObjRegex);
            
            if (pagesObjMatch) {
              const count = parseInt(pagesObjMatch[1], 10);
              if (count > 0 && count < 10000) {
                console.log(`Found PDF page count from root Pages object (via Catalog): ${count} pages`);
                return count;
              }
            }
          }
        }
      }
    }
    
    // Method 2: Find all Pages objects and try to identify the root one
    // Look for /Type /Pages followed by /Count, but only in complete object definitions
    const pagesObjectRegex = /(\d+)\s+(\d+)\s+obj[\s\S]{0,5000}?\/Type\s*\/Pages[\s\S]{0,2000}?\/Count\s+(\d+)[\s\S]{0,1000}?endobj/gi;
    const allPagesObjects: Array<{ count: number; objNum: string; position: number }> = [];
    let match;
    
    while ((match = pagesObjectRegex.exec(pdfText)) !== null) {
      const objNum = match[1];
      const count = parseInt(match[3], 10);
      if (count > 0 && count < 10000) {
        allPagesObjects.push({ count, objNum, position: match.index });
      }
    }
    
    // If we found Pages objects, try to identify the root one
    if (allPagesObjects.length > 0) {
      // The root Pages object is typically referenced by the Catalog
      // Look for Catalog object that references a Pages object
      if (trailerMatch) {
        const trailerContent = trailerMatch[1];
        const rootMatch = trailerContent.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
        
        if (rootMatch) {
          const catalogObjNum = rootMatch[1];
          const catalogObjRegex = new RegExp(`${catalogObjNum}\\s+\\d+\\s+obj[\\s\\S]{0,5000}?/Pages\\s+(\\d+)\\s+\\d+\\s+R[\\s\S]{0,1000}?endobj`, 'i');
          const catalogMatch = pdfText.match(catalogObjRegex);
          
          if (catalogMatch) {
            const referencedPagesObjNum = catalogMatch[1];
            
            // Find the Pages object with this number
            const rootPagesObj = allPagesObjects.find(p => p.objNum === referencedPagesObjNum);
            if (rootPagesObj) {
              console.log(`Found PDF page count from referenced root Pages object: ${rootPagesObj.count} pages`);
              return rootPagesObj.count;
            }
          }
        }
      }
      
      // Fallback: Use the Pages object closest to the end of the file (usually root)
      // But filter out obviously wrong counts (too large)
      const reasonableCounts = allPagesObjects.filter(p => p.count < 1000); // Reasonable max
      
      if (reasonableCounts.length > 0) {
        reasonableCounts.sort((a, b) => b.position - a.position);
        const rootCount = reasonableCounts[0].count;
        console.log(`Found PDF page count from Pages object near end: ${rootCount} pages`);
        return rootCount;
      }
      
      // Last resort: Use the smallest reasonable count (root is usually smaller than sum of children)
      if (allPagesObjects.length > 0) {
        const sortedCounts = allPagesObjects.filter(p => p.count < 1000).sort((a, b) => a.count - b.count);
        if (sortedCounts.length > 0) {
          console.log(`Using smallest reasonable page count: ${sortedCounts[0].count} pages`);
          return sortedCounts[0].count;
        }
      }
    }
    
    // Method 4: Try to find /Kids array in root Pages object and count references
    // This is less reliable but sometimes works when /Count is missing
    const kidsMatch = pdfText.match(/\/Type\s*\/Pages[\s\S]{0,1000}?\/Kids\s*\[([^\]]*)\]/);
    if (kidsMatch) {
      const kidsContent = kidsMatch[1];
      // Count object references (format: "X Y R" where X and Y are numbers)
      const refMatches = kidsContent.match(/\d+\s+\d+\s+R/g);
      if (refMatches) {
        const count = refMatches.length;
        if (count > 0 && count < 10000) {
          console.log(`Found PDF page count from Kids array: ${count} pages`);
          return count;
        }
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // Fallback: Try simple regex parsing (improved)
    try {
      const pdfText = buffer.toString('binary');
      
      // Method 1: Look for /Count in Pages object (most reliable)
      // Try to find the root Pages object which has the total count
      // Look backwards from the end of the file (root is usually near the end)
      const rootPagesRegex = /\/Type\s*\/Pages[\s\S]{0,500}?\/Count\s+(\d+)/g;
      const allMatches: Array<{ count: number; position: number }> = [];
      let match;
      
      while ((match = rootPagesRegex.exec(pdfText)) !== null) {
        const count = parseInt(match[1], 10);
        if (count > 0 && count < 10000) { // Sanity check
          allMatches.push({ count, position: match.index });
        }
      }
      
      // If we found matches, use the one closest to the end (likely the root)
      if (allMatches.length > 0) {
        allMatches.sort((a, b) => b.position - a.position); // Sort by position (end to start)
        const rootCount = allMatches[0].count;
        console.log(`Found PDF page count using root Pages object: ${rootCount} pages`);
        return rootCount;
      }
      
      // Method 2: Look for the root Pages object more carefully
      // The root Pages object often appears near "/Root" in the trailer
      const rootSection = pdfText.match(/\/Root\s+\d+\s+\d+\s+R[\s\S]{0,2000}/);
      if (rootSection) {
        const rootPagesMatch = rootSection[0].match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);
        if (rootPagesMatch) {
          const count = parseInt(rootPagesMatch[1], 10);
          if (count > 0 && count < 10000) {
            console.log(`Found PDF page count near /Root: ${count} pages`);
            return count;
          }
        }
      }
    } catch (parseError) {
      console.error('Error in fallback parsing:', parseError);
    }
    
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.pdf')) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Parse PDF to get page count using direct parsing (works reliably on server-side)
      const pageCount = getPDFPageCountFromBuffer(buffer);
      
      if (pageCount > 0) {
        console.log(`PDF ${file.name}: Accurate page count = ${pageCount} pages`);
        return NextResponse.json({
          pageCount: pageCount,
          success: true
        });
      } else {
        // Fallback estimation only if parsing completely fails
        console.warn(`PDF ${file.name}: Could not determine page count from PDF structure, using estimation`);
        // Use a more conservative estimation (smaller files = fewer pages)
        const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
        console.warn(`Estimated page count: ${estimatedPages} pages (file size: ${file.size} bytes)`);
        return NextResponse.json({
          pageCount: estimatedPages,
          success: false,
          estimated: true
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      // Fallback estimation
      const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
      return NextResponse.json({
        pageCount: estimatedPages,
        success: false,
        estimated: true
      });
    }

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({
      error: "Failed to process PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

