"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  X,
  Calculator,
  CheckCircle2,
  User,
  ArrowLeftRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

// PDF.js will be loaded dynamically when needed

interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "completed" | "error";
  fileUrl?: string;
  pageCount?: number;
}

export function DocumentUploadFormNew() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryPostalCode: "",
    deliveryCountry: "",
    deliveryInstructions: "",
    sourceLanguage: "",
    targetLanguage: "",
    documentType: "STANDARD", // STANDARD or SWORN
    turnaround: "STANDARD", // STANDARD, NEXT_DAY, SAME_DAY
    hardCopy: false,
    hardCopyDelivery: "STANDARD", // STANDARD or EXPRESS
    specialInstructions: "",
  });

  // Calculated values
  const [totalPages, setTotalPages] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Pricing configuration (matching HalaTranslate)
  const PRICING = {
    basePrice: 49,          // SAR per page
    swornFee: 40,           // SAR per page (additional)
    hardCopyBase: 35,       // SAR fixed fee
    shipStd: 25,            // SAR
    shipExpress: 55,        // SAR
    multipliers: { 
      STANDARD: 1, 
      NEXT_DAY: 1.5, 
      SAME_DAY: 2.2 
    }
  };

  // Calculate total price
  useEffect(() => {
    let price = 0;
    
    if (totalPages > 0) {
      // Base price per page
      let unitPrice = PRICING.basePrice;
      
      // Add sworn fee if selected
      if (formData.documentType === "SWORN") {
        unitPrice += PRICING.swornFee;
      }
      
      // Apply turnaround multiplier
      unitPrice *= PRICING.multipliers[formData.turnaround as keyof typeof PRICING.multipliers] || 1;
      
      // Total translation cost
      price = Math.round(totalPages * unitPrice);
      
      // Add hard copy fees
      if (formData.hardCopy) {
        price += PRICING.hardCopyBase;
        
        // Add shipping fee
        if (formData.hardCopyDelivery === "EXPRESS") {
          price += PRICING.shipExpress;
        } else {
          price += PRICING.shipStd;
        }
      }
    }
    
    setTotalPrice(price);
  }, [totalPages, formData.turnaround, formData.documentType, formData.hardCopy, formData.hardCopyDelivery]);

  // Calculate total pages from uploaded files (use ACTUAL page count from files)
  useEffect(() => {
    const completedFiles = uploadedFiles.filter(f => f.status === "completed");
    if (completedFiles.length > 0) {
      // Sum actual page counts from each file
      const totalPagesCount = completedFiles.reduce((sum, file) => {
        const filePages = file.pageCount || 0;
        return sum + filePages;
      }, 0);
      setTotalPages(totalPagesCount);
    } else {
      setTotalPages(0);
    }
  }, [uploadedFiles]);

  // Get ACTUAL page count from PDF via server-side API (avoids webpack bundling issues)
  const getPDFPageCount = async (file: File): Promise<number> => {
    try {
      // Send file to server for processing (server-side has no webpack issues)
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/get-pdf-pages', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.pageCount) {
          console.log(`PDF ${file.name}: Actual page count = ${result.pageCount} (from server)`);
          return result.pageCount;
        }
      }
      
      throw new Error('Failed to get page count from server');
    } catch (error) {
      console.error("Error getting PDF page count:", error);
      // Fallback: estimate from file size (very rough)
      const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
      console.warn(`Using fallback page count: ${estimatedPages} for ${file.name}`);
      return estimatedPages;
    }
  };
  
  // Extract page count from Word documents using server API
  const extractWordDocumentPageCount = async (file: File): Promise<number> => {
    try {
      // Send file to server for processing
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/check-file', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        // Server should return pageCount
        if (result.pageCount) {
          return result.pageCount;
        }
      }
      
      // Fallback: Estimation based on file size
      // For .docx: Average ~2500 bytes per page
      // For .doc: Average ~3500 bytes per page
      const fileName = file.name.toLowerCase();
      const bytesPerPage = fileName.endsWith('.doc') && !fileName.endsWith('.docx') ? 3500 : 2500;
      const estimatedPages = Math.max(1, Math.ceil(file.size / bytesPerPage));
      
      return estimatedPages;
    } catch (error) {
      console.error('Error processing Word document:', error);
      // Fallback estimation
      const fileName = file.name.toLowerCase();
      const bytesPerPage = fileName.endsWith('.doc') && !fileName.endsWith('.docx') ? 3500 : 2500;
      return Math.max(1, Math.ceil(file.size / bytesPerPage));
    }
  };

  // Calculate pages from uploaded files (NO word counting)
  const calculateFileStats = async (files: UploadedFile[]) => {
    setIsCalculating(true);
    
    try {
      for (const uploadedFile of files) {
        if (uploadedFile.status === "completed" && uploadedFile.file) {
          const file = uploadedFile.file;
          const fileName = file.name.toLowerCase();
          
          if (fileName.endsWith(".pdf")) {
            try {
              // Get ACTUAL page count from PDF
              const actualPageCount = await getPDFPageCount(file);
              console.log(`✓ PDF ${file.name}: Page count = ${actualPageCount} pages`);
              
              setUploadedFiles(prev =>
                prev.map(f =>
                  f.id === uploadedFile.id
                    ? { ...f, pageCount: actualPageCount }
                    : f
                )
              );
            } catch (error) {
              console.error(`Error processing PDF ${file.name}:`, error);
              // Fallback estimation
              const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
              setUploadedFiles(prev =>
                prev.map(f =>
                  f.id === uploadedFile.id
                    ? { ...f, pageCount: estimatedPages }
                    : f
                )
              );
            }
          } else if (fileName.endsWith(".txt")) {
            // For TXT files, estimate pages from file size
            const estimatedPages = Math.max(1, Math.ceil(file.size / 2000));
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === uploadedFile.id
                  ? { ...f, pageCount: estimatedPages }
                  : f
              )
            );
          } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
            try {
              // Get page count from server
              const pageCount = await extractWordDocumentPageCount(file);
              setUploadedFiles(prev =>
                prev.map(f =>
                  f.id === uploadedFile.id
                    ? { ...f, pageCount: pageCount }
                    : f
                )
              );
            } catch (error) {
              console.error(`Error processing Word document ${file.name}:`, error);
              // Fallback estimation
              const bytesPerPage = fileName.endsWith('.docx') ? 2500 : 3500;
              const estimatedPages = Math.max(1, Math.ceil(file.size / bytesPerPage));
              setUploadedFiles(prev =>
                prev.map(f =>
                  f.id === uploadedFile.id
                    ? { ...f, pageCount: estimatedPages }
                    : f
                )
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error calculating file stats:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Recalculate when files change
  useEffect(() => {
    const completedFiles = uploadedFiles.filter(f => f.status === "completed");
    if (completedFiles.length > 0 && completedFiles.length === uploadedFiles.length) {
      calculateFileStats(completedFiles);
    } else if (uploadedFiles.length === 0) {
      setTotalPages(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles.map(f => f.id).join(","), uploadedFiles.map(f => f.status).join(",")]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    
    const validFiles = files.filter((file) => {
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
      const isValidType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.includes(fileExtension);
      
      if (!isValidType && !isValidExtension) {
        alert(`File "${file.name}" is not supported. Please upload PDF, DOC, DOCX, or TXT files.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Check total pages limit
    const currentTotalPages = totalPages;
    if (currentTotalPages + validFiles.length * 10 > 10) {
      alert("Maximum 10 pages allowed. Please contact us for more pages.");
      return;
    }
    
    let tempRequestId: string | null = null;
    try {
      const tempIdResponse = await fetch("/api/generate-temp-id");
      if (tempIdResponse.ok) {
        const tempIdData = await tempIdResponse.json();
        tempRequestId = tempIdData.tempRequestId;
      }
    } catch (error) {
      console.warn("Failed to generate temp ID:", error);
    }
    
    for (const file of validFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const uploadedFile: UploadedFile = {
        file,
        id: fileId,
        status: "uploading",
      };
      
      setUploadedFiles((prev) => [...prev, uploadedFile]);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (tempRequestId) {
          formData.append("requestId", tempRequestId);
        }
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: "completed", fileUrl: result.url }
                : f
            )
          );
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "error" } : f
          )
        );
        alert(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    
    if (uploadedFiles.some((f) => f.status !== "completed")) {
      alert("Please wait for all files to finish uploading");
      return;
    }
    
    if (!formData.sourceLanguage || !formData.targetLanguage) {
      alert("Please select source and target languages");
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in all required customer details");
      return;
    }
    
    if (formData.hardCopy && !formData.deliveryAddress) {
      alert("Please provide delivery address for hard copy");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const [firstName, ...lastNameParts] = formData.fullName.split(" ");
      const lastName = lastNameParts.join(" ") || firstName;
      
      // Build full delivery address if hard copy is selected
      let fullDeliveryAddress = '';
      if (formData.hardCopy) {
        const addressParts = [
          formData.deliveryAddress,
          formData.deliveryCity,
          formData.deliveryPostalCode,
          formData.deliveryCountry
        ].filter(part => part.trim() !== '');
        fullDeliveryAddress = addressParts.join(', ');
        if (formData.deliveryInstructions) {
          fullDeliveryAddress += ` (Instructions: ${formData.deliveryInstructions})`;
        }
      }
      
      const reviewData = {
        firstName,
        lastName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: fullDeliveryAddress,
        sourceLanguage: formData.sourceLanguage,
        targetLanguage: formData.targetLanguage,
        documentType: formData.documentType === "SWORN" ? "CERTIFIED" : "LEGAL",
        urgency: formData.turnaround,
        specialization: "",
        additionalNotes: formData.specialInstructions,
        numPages: totalPages.toString(),
        estimatedPrice: totalPrice.toString(),
        originalFileName: uploadedFiles[0]?.file.name || "",
        fileUrl: uploadedFiles[0]?.fileUrl || "",
        fileSize: uploadedFiles[0]?.file.size.toString() || "",
        fileType: uploadedFiles[0]?.file.type || "",
        hardCopy: formData.hardCopy,
        hardCopyDelivery: formData.hardCopyDelivery,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        deliveryPostalCode: formData.deliveryPostalCode,
        deliveryCountry: formData.deliveryCountry,
        deliveryInstructions: formData.deliveryInstructions,
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(reviewData));
      router.push(`/review-order?formData=${encodedData}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while submitting your request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-[#F8FAFC] -mt-24 relative z-20" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8" suppressHydrationWarning>
          {/* Left Column: Document & Translation Details */}
          <div className="lg:col-span-8 space-y-8" suppressHydrationWarning>
          
          {/* Section 1: Upload Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 relative overflow-hidden" suppressHydrationWarning>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4" suppressHydrationWarning>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#076E32] font-bold">1</div>
              <h2 className="text-xl font-bold text-slate-800">Upload Documents</h2>
            </div>
            
            {/* File Upload */}
            <div id="dropZone" 
              className={`drop-zone rounded-xl bg-slate-50 p-10 text-center cursor-pointer relative min-h-[220px] flex flex-col items-center justify-center transition-all ${
                dragActive ? "border-[#076E32] bg-emerald-50 border-2" : "border-2 border-dashed border-slate-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
              suppressHydrationWarning
            >
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                name="file-upload"
                accept=".pdf,.doc,.docx,.txt"
              />
              <div className="text-[#076E32] mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Click to upload or drag files here</h3>
              <p className="text-sm text-slate-500 mb-4">Allowed: PDF, DOCX, TXT (Max 25MB).</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Smart Auto-Count & Virus Scan Active
              </div>
              {uploadedFiles.length > 0 && (
                <p className="text-xs text-amber-600 mt-4 font-medium">
                  <strong>Maximum: 10 pages.</strong> If you have more pages, please contact us on WhatsApp or email.
                </p>
              )}
            </div>
              
              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {uploadedFiles.map((uploadedFile) => (
                    <li key={uploadedFile.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-sm hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-bold text-slate-500 uppercase text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {uploadedFile.file.name.split('.').pop()?.toUpperCase()}
                        </span>
                        <div className="flex flex-col">
                          <span className="truncate max-w-[180px] font-semibold text-slate-700">
                            {uploadedFile.file.name}
                          </span>
                          {uploadedFile.status === "completed" && uploadedFile.pageCount && (
                            <span className="text-xs text-slate-400">
                              {uploadedFile.pageCount} physical page{uploadedFile.pageCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {uploadedFile.status === "uploading" && (
                            <span className="text-xs text-blue-600">Uploading...</span>
                          )}
                          {uploadedFile.status === "error" && (
                            <span className="text-xs text-red-600">Upload failed</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="text-slate-400 hover:text-red-500 transition px-2 py-1 rounded hover:bg-red-50"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          {/* Section 2: Translation Options */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8" suppressHydrationWarning>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4" suppressHydrationWarning>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#076E32] font-bold">2</div>
              <h2 className="text-xl font-bold text-slate-800">Translation Options</h2>
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end mb-8" suppressHydrationWarning>
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">From</label>
                <Select
                  value={formData.sourceLanguage}
                  onValueChange={(value) => {
                    setFormData({ ...formData, sourceLanguage: value });
                    if (value === formData.targetLanguage) {
                      setFormData({ ...formData, sourceLanguage: value, targetLanguage: "" });
                    }
                  }}
                >
                  <SelectTrigger className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 font-medium">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Turkish">Turkish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const temp = formData.sourceLanguage;
                  setFormData({
                    ...formData,
                    sourceLanguage: formData.targetLanguage || "",
                    targetLanguage: temp || "",
                  });
                }}
                className="mb-1.5 p-3 rounded-full bg-slate-100 hover:bg-[#076E32] hover:text-white text-slate-500 transition shadow-sm border border-slate-200"
                title="Swap Languages"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">To</label>
                <Select
                  value={formData.targetLanguage}
                  onValueChange={(value) => setFormData({ ...formData, targetLanguage: value })}
                >
                  <SelectTrigger className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 font-medium">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arabic" disabled={formData.sourceLanguage === "Arabic"}>Arabic</SelectItem>
                    <SelectItem value="English" disabled={formData.sourceLanguage === "English"}>English</SelectItem>
                    <SelectItem value="French" disabled={formData.sourceLanguage === "French"}>French</SelectItem>
                    <SelectItem value="German" disabled={formData.sourceLanguage === "German"}>German</SelectItem>
                    <SelectItem value="Spanish" disabled={formData.sourceLanguage === "Spanish"}>Spanish</SelectItem>
                    <SelectItem value="Turkish" disabled={formData.sourceLanguage === "Turkish"}>Turkish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.sourceLanguage === formData.targetLanguage && formData.sourceLanguage && (
              <p className="text-sm text-red-500 mb-6 bg-red-50 p-2 rounded">⚠️ Source and target languages must be different.</p>
            )}
            
            {/* Service Level and Turnaround */}
            <div className="grid md:grid-cols-2 gap-6 mb-8" suppressHydrationWarning>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Service Level</label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                >
                  <SelectTrigger className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard Certified</SelectItem>
                    <SelectItem value="SWORN">Sworn (Official Court)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Turnaround</label>
                <Select
                  value={formData.turnaround}
                  onValueChange={(value) => setFormData({ ...formData, turnaround: value })}
                >
                  <SelectTrigger className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard (3 Business Days)</SelectItem>
                    <SelectItem value="NEXT_DAY">Next-Day (Before 6PM)</SelectItem>
                    <SelectItem value="SAME_DAY">Same-Day (Urgent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Hard Copy Option */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 transition-all mb-6" suppressHydrationWarning>
              <label className="flex items-start gap-4 cursor-pointer select-none">
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="hardCopy"
                    checked={formData.hardCopy}
                    onChange={(e) => setFormData({ ...formData, hardCopy: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#076E32]"></div>
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800">Add Hard Copy Delivery</span>
                  <span className="block text-xs text-slate-500 mt-1">We will ship the stamped original paper version to your address.</span>
                </div>
              </label>

              {formData.hardCopy && (
                <div className="mt-5 pt-5 border-t border-slate-200" suppressHydrationWarning>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Delivery Address</label>
                  <Textarea
                    id="deliveryAddress"
                    rows={2}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#076E32] mb-4"
                    placeholder="Building No, Street Name, District, City, ZIP Code..."
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    required={formData.hardCopy}
                  />
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Shipping Method</label>
                    <Select
                      value={formData.hardCopyDelivery}
                      onValueChange={(value) => setFormData({ ...formData, hardCopyDelivery: value })}
                    >
                      <SelectTrigger className="w-full md:w-1/2 border border-slate-300 rounded-xl px-3 py-2 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard Shipping</SelectItem>
                        <SelectItem value="EXPRESS">Express Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Special Instructions */}
            <div className="mt-6" suppressHydrationWarning>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Special Instructions (Optional)</label>
              <Textarea
                id="specialInstructions"
                rows={2}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm"
                placeholder="e.g. Spelling of names (Passport style), special terminology..."
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Your Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8" suppressHydrationWarning>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4" suppressHydrationWarning>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#076E32] font-bold">3</div>
              <h2 className="text-xl font-bold text-slate-800">Your Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6" suppressHydrationWarning>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
                <Input
                  type="text"
                  id="fullName"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone Number</label>
                <Input
                  type="tel"
                  id="phone"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
                <Input
                  type="email"
                  id="email"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3" suppressHydrationWarning>
              <input type="checkbox" id="terms" required className="w-5 h-5 text-[#076E32] rounded border-slate-300 focus:ring-[#076E32]" />
              <label htmlFor="terms" className="text-sm text-slate-600">I accept the <a href="#" className="underline">Terms & Conditions</a>.</label>
            </div>
          </div>
          </div>
          
          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4" suppressHydrationWarning>
            <div className="sticky top-28 space-y-6" suppressHydrationWarning>
              
              {/* Order Summary Panel */}
              <div className="bg-[#212A37] text-white rounded-2xl shadow-2xl overflow-hidden relative" suppressHydrationWarning>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#076E32] rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>

                <div className="p-6 md:p-8" suppressHydrationWarning>
                  <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-4">Order Summary</h3>
                  
                  <div className="space-y-4 text-sm text-gray-300 min-h-[80px]" suppressHydrationWarning>
                    {totalPages > 0 ? (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                          <span className="text-gray-300">Volume</span>
                          <span className="font-bold text-white">{totalPages} Page{totalPages > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>Rate ({formData.documentType === 'SWORN' ? 'Sworn (+40 SAR)' : 'Standard'})</span>
                          <span>x {formData.turnaround === 'SAME_DAY' ? '2.2' : formData.turnaround === 'NEXT_DAY' ? '1.5' : '1'} speed</span>
                        </div>
                        <div className="flex justify-between items-center font-mono text-emerald-400">
                          <span>Translation Cost</span>
                          <span>SAR {(() => {
                            if (totalPages === 0) return 0;
                            let unitPrice = PRICING.basePrice;
                            if (formData.documentType === 'SWORN') unitPrice += PRICING.swornFee;
                            unitPrice *= PRICING.multipliers[formData.turnaround as keyof typeof PRICING.multipliers] || 1;
                            return Math.round(totalPages * unitPrice);
                          })()}</span>
                        </div>
                        {formData.hardCopy && (
                          <div className="mt-2 pt-2 border-t border-gray-700 border-dashed space-y-1">
                            <div className="flex justify-between text-emerald-300">
                              <span>Hard Copy Prep</span>
                              <span>+{PRICING.hardCopyBase}</span>
                            </div>
                            <div className="flex justify-between text-emerald-300">
                              <span>Delivery ({formData.hardCopyDelivery === 'EXPRESS' ? 'Express' : 'Standard'})</span>
                              <span>+{formData.hardCopyDelivery === 'EXPRESS' ? PRICING.shipExpress : PRICING.shipStd}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic text-center py-4">Upload a file to see the instant quote...</p>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-600 flex justify-between items-end" suppressHydrationWarning>
                    <span className="text-sm text-gray-400 font-medium">Total (SAR)</span>
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {isCalculating ? '—' : totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 text-right mt-1 uppercase tracking-wide">+ VAT if applicable</p>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isCalculating || totalPages === 0}
                    className="mt-8 w-full bg-[#076E32] hover:bg-[#055628] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span>{isSubmitting ? 'Processing...' : 'Proceed to Payment'}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </Button>
                  
                  <div className="mt-6 flex justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition duration-500" suppressHydrationWarning>
                    <div className="bg-white h-6 w-10 rounded"></div>
                    <div className="bg-white h-6 w-10 rounded"></div>
                    <div className="bg-white h-6 w-10 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" suppressHydrationWarning>
                <div className="flex items-center gap-3 text-sm text-slate-700 mb-3 font-medium">
                  <svg className="w-5 h-5 text-[#076E32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Official & Certified (Seal)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-[#076E32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span>256-bit SSL Secure</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

