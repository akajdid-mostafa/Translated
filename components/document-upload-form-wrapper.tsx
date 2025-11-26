"use client";

import dynamic from "next/dynamic";

// Dynamically import the form component to avoid SSR issues with PDF.js
const DocumentUploadFormNew = dynamic(
  () => import("@/components/document-upload-form-new").then((mod) => ({ default: mod.DocumentUploadFormNew })),
  { 
    ssr: false,
    loading: () => (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }
);

export function DocumentUploadFormWrapper() {
  return <DocumentUploadFormNew />;
}

