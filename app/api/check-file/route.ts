import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    // Test if the file URL is accessible
    const response = await fetch(fileUrl, { method: 'HEAD' });
    
    return NextResponse.json({
      url: fileUrl,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

  } catch (error) {
    console.error("File check error:", error);
    return NextResponse.json({
      error: "Failed to check file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
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

    // Count words from text
    const countWords = (text: string): number => {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    if (fileName.endsWith('.docx')) {
      try {
        // .docx files are ZIP archives containing XML files
        // Try to use jszip if available, otherwise use estimation
        let actualPageCount: number;
        let words: number;
        
        try {
          const JSZip = (await import('jszip')).default;
          const arrayBuffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);
          
          // Extract document.xml which contains the actual content
          const documentXml = await zip.file('word/document.xml')?.async('string');
          
          if (documentXml) {
            // Parse XML to extract text and find page breaks
            // Word documents use <w:br w:type="page"/> or <w:lastRenderedPageBreak/> for page breaks
            const pageBreakRegex = /<w:br\s+w:type="page"\/>|<w:lastRenderedPageBreak\/>|<w:pgBr\/>/gi;
            const pageBreaks = (documentXml.match(pageBreakRegex) || []).length;
            
            // Count actual page count: page breaks + 1 (first page)
            // Also check for section breaks which might indicate pages
            const sectionBreakRegex = /<w:sectPr>/gi;
            const sections = (documentXml.match(sectionBreakRegex) || []).length;
            
            // Actual page count = page breaks + sections (if any) + 1 (first page)
            actualPageCount = Math.max(1, pageBreaks + sections + 1);
            
            // Extract text for word counting (remove XML tags)
            const textContent = documentXml
              .replace(/<[^>]+>/g, ' ') // Remove all XML tags
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\s+/g, ' ')
              .trim();
            
            words = countWords(textContent);
            
            // If no explicit page breaks found, estimate based on document size
            if (pageBreaks === 0 && sections === 0) {
              // A typical Word page is around 2500 bytes in the XML structure
              actualPageCount = Math.max(1, Math.ceil(file.size / 2500));
            }
          } else {
            throw new Error('Could not extract document.xml');
          }
        } catch (zipError) {
          // jszip not available or failed - use file size estimation
          // Word documents: ~2500 bytes per page on average (NOT based on words)
          actualPageCount = Math.max(1, Math.ceil(file.size / 2500));
          // Estimate words separately (NOT used for page count)
          words = Math.round((file.size / 1000) * 2);
        }
        
        return NextResponse.json({
          wordCount: words,
          pageCount: actualPageCount // Use ACTUAL page count, NOT calculated from words
        });
      } catch (error) {
        console.error('Error processing .docx:', error);
        // Fallback: estimate pages based on file size (NOT from words)
        // Word documents: ~2500 bytes per page on average
        const estimatedPages = Math.max(1, Math.ceil(file.size / 2500));
        // Estimate words separately (NOT used for page count)
        const estimatedWords = Math.round((file.size / 1000) * 2);
        
        return NextResponse.json({
          wordCount: estimatedWords,
          pageCount: estimatedPages // Separate from word count
        });
      }
    } else if (fileName.endsWith('.doc')) {
      // For .doc files (older format), use estimation based on file size
      // .doc files are typically ~3500 bytes per page
      const estimatedPages = Math.max(1, Math.ceil(file.size / 3500));
      const estimatedWords = Math.round((file.size / 1000) * 2);
      
      return NextResponse.json({
        wordCount: estimatedWords,
        pageCount: estimatedPages // Separate from word count
      });
    } else if (fileName.endsWith('.txt')) {
      const text = await file.text();
      const words = countWords(text);
      // For TXT files, calculate pages from words (250 words per page)
      const WORDS_PER_PAGE = 250;
      const pageCount = Math.ceil(words / WORDS_PER_PAGE);
      
      return NextResponse.json({
        wordCount: words,
        pageCount: pageCount
      });
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

  } catch (error) {
    console.error("File processing error:", error);
    return NextResponse.json({
      error: "Failed to process file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

