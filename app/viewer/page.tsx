"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FileViewerContent() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("url");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pdfRef = useRef<any>(null);

  // Determine file type from URL
  const urlLower = fileUrl?.toLowerCase() || '';
  const isPdf = urlLower.includes(".pdf");
  const isTxt = urlLower.includes(".txt");
  const isDoc = urlLower.includes(".doc") && !urlLower.includes(".docx");
  const isDocx = urlLower.includes(".docx");

  // Build the API URL for viewing the file
  const viewApiUrl = fileUrl ? `/api/view-file?url=${encodeURIComponent(fileUrl)}` : '';

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not found");
      }
      
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error("Canvas context not found");
      }
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
    } catch (err: any) {
      console.error(`Error rendering page ${pageNum}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    if (!fileUrl) {
      setError("No file URL provided");
      setLoading(false);
      return;
    }

    if (isPdf) {
      // For PDFs, load and render using PDF.js
      loadPdfWithPdfJs(viewApiUrl);
    } else if (isTxt) {
      // For TXT files, just mark as not loading (will display in iframe)
      setLoading(false);
    } else if (isDoc || isDocx) {
      // Word documents can't be displayed inline
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [fileUrl, isPdf, isTxt, isDoc, isDocx, viewApiUrl]);

  const loadPdfWithPdfJs = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading PDF from:", url);
      
      // Fetch the PDF as a blob - this prevents browser download
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
      }
      
      // Verify content type
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/pdf')) {
        console.warn(`Unexpected content type: ${contentType}`);
      }
      
      // Get the blob - this prevents browser download
      const blob = await response.blob();
      console.log("PDF blob received, size:", blob.size);
      
      // Convert blob to array buffer for PDF.js
      const arrayBuffer = await blob.arrayBuffer();
      
      // Dynamically import PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      console.log("PDF.js version:", pdfjsLib.version);
      
      // Set worker source - use CDN worker
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }
      
      // Load the PDF document
      console.log("Loading PDF document...");
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0,
      });
      
      const pdf = await loadingTask.promise;
      console.log("PDF loaded, pages:", pdf.numPages);
      
      // Store PDF reference
      pdfRef.current = pdf;
      setTotalPages(pdf.numPages);
      
      // Wait for canvas to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Render the first page
      await renderPage(pdf, 1);
      
      setPdfLoaded(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Error loading PDF with PDF.js:", err);
      setError(err.message || "Failed to load PDF. The file may be corrupted or inaccessible.");
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isPdf ? 'Loading PDF...' : 'Loading...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    if (isDoc || isDocx) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Word Document Viewer
            </h1>
            <p className="text-gray-600 mb-6">
              Word documents cannot be displayed inline in the browser.
              Please download the file to view it.
            </p>
            <a
              href={`/api/download?url=${encodeURIComponent(fileUrl || '')}&filename=${encodeURIComponent(fileUrl?.split('/').pop() || 'file')}`}
              download
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download File
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <a
              href={viewApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Opening in New Tab
            </a>
            <a
              href={`/api/download?url=${encodeURIComponent(fileUrl || '')}&filename=${encodeURIComponent(fileUrl?.split('/').pop() || 'file')}`}
              download
              className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Download Instead
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No file URL provided</p>
        </div>
      </div>
    );
  }

  // PDF viewer
  if (isPdf && pdfLoaded) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-800">PDF Viewer</h1>
            {totalPages > 0 && (
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>
        <div className="p-4 overflow-auto">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-4">
            <canvas 
              ref={canvasRef} 
              className="w-full h-auto border border-gray-200 mx-auto block" 
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // TXT viewer
  if (isTxt) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <div className="w-full h-screen bg-white rounded-lg shadow-lg p-4">
            <iframe
              src={viewApiUrl}
              className="w-full h-full border-0"
              title="Text Viewer"
              style={{ minHeight: "calc(100vh - 2rem)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Word documents
  if (isDoc || isDocx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Word Document Viewer
          </h1>
          <p className="text-gray-600 mb-6">
            Word documents cannot be displayed inline in the browser.
            Please download the file to view it.
          </p>
          <a
            href={`/api/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(fileUrl.split('/').pop() || 'file')}`}
            download
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download File
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-gray-600">Unsupported file type</p>
      </div>
    </div>
  );
}

export default function FileViewer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <FileViewerContent />
    </Suspense>
  );
}
