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
  MessageCircle,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    specialInstructions: "",
  });

  // Calculated values
  const [totalPages, setTotalPages] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Pricing settings from API
  const [pricingSettings, setPricingSettings] = useState({
    standardCertifiedPricePerPage: 49,
    swornPricePerPage: 75,
    standardMultiplier: 1.0,
    nextDayMultiplier: 1.5,
    sameDayMultiplier: 2.0,
    hardCopyFee: 50,
  });
  const [pricingLoaded, setPricingLoaded] = useState(false);

  // Fetch pricing settings on mount (with cache busting)
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing?t=" + Date.now(), {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setPricingSettings(data);
          setPricingLoaded(true);
        } else {
          setPricingLoaded(true); // Still set to true to prevent infinite loading
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricingLoaded(true); // Still set to true to prevent infinite loading
      }
    };
    fetchPricing();
  }, []);

  // Pricing configuration (derived from API settings)
  const PRICING = {
    basePrice: pricingSettings.standardCertifiedPricePerPage,
    swornPricePerPage: pricingSettings.swornPricePerPage,
    hardCopyBase: pricingSettings.hardCopyFee,
    multipliers: { 
      STANDARD: pricingSettings.standardMultiplier, 
      NEXT_DAY: pricingSettings.nextDayMultiplier, 
      SAME_DAY: pricingSettings.sameDayMultiplier 
    }
  };

  // Calculate total price
  useEffect(() => {
    let price = 0;
    
    if (totalPages > 0) {
      // Base price per page based on service type
      let unitPrice = formData.documentType === "SWORN" 
        ? PRICING.swornPricePerPage 
        : PRICING.basePrice;
      
      // Apply turnaround multiplier
      unitPrice *= PRICING.multipliers[formData.turnaround as keyof typeof PRICING.multipliers] || 1;
      
      // Total translation cost
      price = Math.round(totalPages * unitPrice);
      
      // Add hard copy fee (single price, no shipping method)
      if (formData.hardCopy) {
        price += PRICING.hardCopyBase;
      }
      
      // Apply coupon discount if available
      if (appliedCoupon) {
        price = Math.max(0, price - appliedCoupon.discountAmount);
      }
    }
    
    setTotalPrice(Math.round(price));
  }, [totalPages, formData.turnaround, formData.documentType, formData.hardCopy, appliedCoupon, pricingSettings]);

  // Track if we've already shown the page limit warning to avoid spam
  const [hasShownPageLimitWarning, setHasShownPageLimitWarning] = useState(false);
  const [showPageLimitModal, setShowPageLimitModal] = useState(false);
  const [exceededPageCount, setExceededPageCount] = useState(0);

  // Calculate total pages from uploaded files (use ACTUAL page count from files)
  useEffect(() => {
    const completedFiles = uploadedFiles.filter(f => f.status === "completed");
    if (completedFiles.length > 0) {
      // Only calculate total if all completed files have page counts
      const allHavePageCounts = completedFiles.every(f => f.pageCount !== undefined && f.pageCount !== null);
      
      if (allHavePageCounts) {
        // Sum actual page counts from each file
        const totalPagesCount = completedFiles.reduce((sum, file) => {
          const filePages = file.pageCount || 0;
          return sum + filePages;
        }, 0);
        
        // Show modal only once if limit is exceeded (don't auto-remove files)
        if (totalPagesCount > 10 && !hasShownPageLimitWarning) {
          setExceededPageCount(totalPagesCount);
          setShowPageLimitModal(true);
          setHasShownPageLimitWarning(true);
        } else if (totalPagesCount <= 10) {
          // Reset warning flag if we're back under the limit
          setHasShownPageLimitWarning(false);
          setShowPageLimitModal(false);
        }
        
        // Always show the actual total (don't cap at 10, let user see the real number)
        setTotalPages(totalPagesCount);
      } else {
        // Some files are still calculating page counts, use current known total
        const knownTotal = completedFiles.reduce((sum, file) => {
          return sum + (file.pageCount || 0);
        }, 0);
        setTotalPages(knownTotal);
      }
    } else {
      setTotalPages(0);
      setHasShownPageLimitWarning(false); // Reset when no files
    }
  }, [uploadedFiles, hasShownPageLimitWarning]);

  // Get ACTUAL page count from PDF using pdf.js client-side (like the HTML solution)
  const getPDFPageCount = async (file: File): Promise<number> => {
    try {
      // Load pdf.js dynamically from CDN (like the HTML solution)
      if (typeof window === 'undefined') {
        throw new Error('Client-side only');
      }
      
      // Check if pdf.js is already loaded
      let pdfjsLib: any;
      
      if ((window as any).pdfjsLib) {
        pdfjsLib = (window as any).pdfjsLib;
      } else {
        // Load pdf.js from CDN (same as HTML solution)
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
          script.async = true;
          script.onload = () => {
            pdfjsLib = (window as any).pdfjsLib;
            if (!pdfjsLib) {
              reject(new Error('Failed to load pdf.js library'));
              return;
            }
            // Configure worker (same as HTML solution)
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load pdf.js script'));
          document.head.appendChild(script);
        });
      }
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document using pdf.js (client-side, same as HTML solution)
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
      });
      
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      
      console.log(`PDF ${file.name}: Actual page count = ${pageCount} pages (client-side pdf.js)`);
      return pageCount;
    } catch (error) {
      console.error("Error getting PDF page count:", error);
      // Fallback: estimate from file size (very rough)
      const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
      console.warn(`Using fallback page count: ${estimatedPages} for ${file.name}`);
      return estimatedPages;
    }
  };
  
  // Extract page count from Word documents using client-side mammoth.js (like HTML solution)
  const extractWordDocumentPageCount = async (file: File): Promise<number> => {
    try {
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.docx')) {
        // Use mammoth.js for DOCX files (like HTML solution)
        if (typeof window === 'undefined') {
          throw new Error('Client-side only');
        }
        
        // Load mammoth.js dynamically from CDN
        let mammoth: any;
        
        if ((window as any).mammoth) {
          mammoth = (window as any).mammoth;
        } else {
          // Load mammoth.js from CDN (same as HTML solution)
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
            script.async = true;
            script.onload = () => {
              mammoth = (window as any).mammoth;
              if (!mammoth) {
                reject(new Error('Failed to load mammoth.js library'));
                return;
              }
              resolve();
            };
            script.onerror = () => reject(new Error('Failed to load mammoth.js script'));
            document.head.appendChild(script);
          });
        }
        
        // Extract text from DOCX using mammoth (like HTML solution)
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        // Count words
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        // Calculate pages: 250 words per page (industry standard, same as HTML solution)
        const WORDS_PER_PAGE = 250;
        const pageCount = Math.max(1, Math.ceil(words / WORDS_PER_PAGE));
        
        console.log(`DOCX ${file.name}: ${words} words = ${pageCount} pages (client-side mammoth.js)`);
        return pageCount;
      } else if (fileName.endsWith('.doc')) {
        // For .doc files (old format), we can't easily parse them client-side
        // Use a more conservative estimation based on file size
        // Old .doc files are typically much smaller per page (1000-2000 bytes for 1 page)
        // Use a larger divisor to avoid overcounting
        const estimatedPages = Math.max(1, Math.ceil(file.size / 15000));
        console.log(`DOC ${file.name}: Estimated ${estimatedPages} pages (size: ${file.size} bytes)`);
        return estimatedPages;
      }
      
      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('Error processing Word document:', error);
      // Fallback: Very conservative estimation
      const fileName = file.name.toLowerCase();
      // Use larger bytes per page to avoid overcounting
      const bytesPerPage = fileName.endsWith('.doc') && !fileName.endsWith('.docx') ? 15000 : 10000;
      const estimatedPages = Math.max(1, Math.ceil(file.size / bytesPerPage));
      console.warn(`Using fallback estimation: ${estimatedPages} pages for ${file.name}`);
      return estimatedPages;
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
              // Fallback estimation - use better bytes per page for DOCX (has XML overhead)
              const bytesPerPage = fileName.endsWith('.docx') ? 10000 : 3500;
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
      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    
    // Don't block uploads here - we'll validate after page counts are calculated
    // This allows users to add multiple files, and we'll warn them if total exceeds limit
    
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

  // Validate and apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (totalPages === 0) {
      setCouponError("Please upload files first");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      // Calculate base price before discount for validation
      let basePrice = 0;
      if (totalPages > 0) {
        let unitPrice = PRICING.basePrice;
        if (formData.documentType === "SWORN") unitPrice += PRICING.swornFee;
        unitPrice *= PRICING.multipliers[formData.turnaround as keyof typeof PRICING.multipliers] || 1;
        basePrice = Math.round(totalPages * unitPrice);
        if (formData.hardCopy) {
          basePrice += PRICING.hardCopyBase;
        }
      }

      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          totalAmount: basePrice,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          discountType: data.coupon.discountType,
        });
        setCouponError("");
        setCouponCode(""); // Clear input
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Failed to validate coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
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
    
    if (formData.hardCopy) {
      if (!formData.deliveryAddress || !formData.deliveryCity || !formData.deliveryPostalCode || !formData.deliveryCountry) {
        alert("Please fill in all required delivery address fields (Street Address, City, Postal Code, and Country)");
        return;
      }
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
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        deliveryPostalCode: formData.deliveryPostalCode,
        deliveryCountry: formData.deliveryCountry,
        deliveryInstructions: formData.deliveryInstructions,
        couponCode: appliedCoupon?.code || null,
        discountAmount: appliedCoupon?.discountAmount || null,
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
              onClick={() => fileInputRef.current?.click()}
              suppressHydrationWarning
            >
              <input
                ref={fileInputRef}
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
                <div className="mt-5 pt-5 border-t border-slate-200 space-y-4" suppressHydrationWarning>
                  {/* Delivery Address */}
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Street Address / Building *
                    </label>
                    <Input
                      id="deliveryAddress"
                      type="text"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#076E32]"
                      placeholder="Building No, Street Name, District..."
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      required={formData.hardCopy}
                    />
                  </div>

                  {/* City and Postal Code */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="deliveryCity" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                        City *
                      </label>
                      <Input
                        id="deliveryCity"
                        type="text"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#076E32]"
                        placeholder="City"
                        value={formData.deliveryCity}
                        onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                        required={formData.hardCopy}
                      />
                    </div>
                    <div>
                      <label htmlFor="deliveryPostalCode" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                        Postal Code *
                      </label>
                      <Input
                        id="deliveryPostalCode"
                        type="text"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#076E32]"
                        placeholder="Postal Code"
                        value={formData.deliveryPostalCode}
                        onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                        required={formData.hardCopy}
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="deliveryCountry" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Country *
                    </label>
                    <Input
                      id="deliveryCountry"
                      type="text"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#076E32]"
                      placeholder="Country"
                      value={formData.deliveryCountry}
                      onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value })}
                      required={formData.hardCopy}
                    />
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label htmlFor="deliveryInstructions" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Delivery Instructions (Optional)
                    </label>
                    <Textarea
                      id="deliveryInstructions"
                      rows={2}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#076E32]"
                      placeholder="Additional delivery instructions, landmarks, or special notes..."
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    />
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
                  
                  <div className="space-y-3 text-sm text-gray-300 min-h-[80px]" suppressHydrationWarning>
                    {totalPages > 0 ? (
                      <>
                        {/* Invoice-style breakdown */}
                        <div className="space-y-2" suppressHydrationWarning>
                          {/* Pages count */}
                          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className="text-gray-300">Number of Pages</span>
                            <span className="font-semibold text-white">{totalPages} Page{totalPages > 1 ? 's' : ''}</span>
                          </div>
                          
                          {/* Price per page breakdown */}
                          <div className="space-y-1.5 pt-2" suppressHydrationWarning>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Base Price (per page)</span>
                              <span className="text-white">SAR {formData.documentType === 'SWORN' ? PRICING.swornPricePerPage : PRICING.basePrice}</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-1 border-t border-gray-700/50">
                              <span className="text-gray-300 font-medium">Price per Page</span>
                              <span className="text-white font-semibold">
                                SAR {formData.documentType === 'SWORN' ? PRICING.swornPricePerPage : PRICING.basePrice}
                              </span>
                            </div>
                            
                            {/* Subtotal before multiplier */}
                            <div className="flex justify-between items-center pt-1 pb-2 border-b border-gray-700">
                              <span className="text-gray-300">Subtotal ({totalPages} × {formData.documentType === 'SWORN' ? PRICING.swornPricePerPage : PRICING.basePrice})</span>
                              <span className="text-white font-semibold">
                                SAR {totalPages * (formData.documentType === 'SWORN' ? PRICING.swornPricePerPage : PRICING.basePrice)}
                              </span>
                            </div>
                            
                            {/* Turnaround multiplier */}
                            {formData.turnaround !== 'STANDARD' && (
                              <div className="flex justify-between items-center text-emerald-300">
                                <span className="text-sm">
                                  {formData.turnaround === 'SAME_DAY' ? 'Same Day' : 'Next Day'} Speed Multiplier
                                </span>
                                <span className="text-sm">
                                  × {PRICING.multipliers[formData.turnaround as keyof typeof PRICING.multipliers] || 1}
                                </span>
                              </div>
                            )}
                            
                            {/* Translation total */}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-700 font-mono">
                              <span className="text-emerald-400 font-semibold">Translation Cost</span>
                              <span className="text-emerald-400 font-bold text-base">
                                SAR {(() => {
                                  if (totalPages === 0) return 0;
                                  let unitPrice = PRICING.basePrice;
                                  if (formData.documentType === 'SWORN') unitPrice += PRICING.swornFee;
                                  unitPrice *= PRICING.multipliers[formData.turnaround as keyof typeof PRICING.multipliers] || 1;
                                  return Math.round(totalPages * unitPrice);
                                })()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Hard copy fee */}
                          {formData.hardCopy && (
                            <div className="mt-3 pt-3 border-t border-gray-700" suppressHydrationWarning>
                              <div className="flex justify-between items-center text-emerald-300">
                                <span className="text-sm">Hard Copy Preparation</span>
                                <span className="text-sm">+ SAR {PRICING.hardCopyBase}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Coupon Discount */}
                          {appliedCoupon && (
                            <div className="mt-3 pt-3 border-t border-gray-700 space-y-1" suppressHydrationWarning>
                              <div className="flex justify-between items-center text-green-400">
                                <span className="text-sm font-medium">Coupon ({appliedCoupon.code})</span>
                                <span className="text-sm font-bold">- SAR {appliedCoupon.discountAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 italic text-center py-4">Upload a file to see the instant quote...</p>
                    )}
                  </div>

                  {/* Coupon Code Input */}
                  {totalPages > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700" suppressHydrationWarning>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg border border-green-500/30" suppressHydrationWarning>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-sm text-green-300 font-medium">Coupon Applied: {appliedCoupon.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-green-300 hover:text-white text-sm underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2" suppressHydrationWarning>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Coupon Code</label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError("");
                              }}
                              placeholder="Enter coupon code"
                              className="flex-1 border-gray-600 bg-gray-800 text-white placeholder:text-gray-500"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleApplyCoupon();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={isValidatingCoupon || !couponCode.trim()}
                              className="bg-[#076E32] hover:bg-[#065a2a] disabled:bg-gray-700"
                            >
                              {isValidatingCoupon ? "..." : "Apply"}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-red-400">{couponError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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

      {/* Page Limit Exceeded Modal */}
      <Dialog open={showPageLimitModal} onOpenChange={setShowPageLimitModal}>
        <DialogContent className="sm:max-w-md" suppressHydrationWarning>
          <DialogHeader suppressHydrationWarning>
            <DialogTitle className="text-xl font-bold text-slate-800" suppressHydrationWarning>
              Maximum Page Limit Exceeded
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2" suppressHydrationWarning>
              Your uploaded documents contain <strong>{exceededPageCount} pages</strong>, which exceeds the online limit of <strong>10 pages</strong>.
              <br /><br />
              Please contact us for documents with more than 10 pages. We'll provide you with a personalized quote and delivery timeline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4" suppressHydrationWarning>
            <Button
              onClick={() => {
                window.open('https://wa.me/966XXXXXXXXX', '_blank'); // Replace with actual WhatsApp number
              }}
              className="w-full bg-[#076E32] hover:bg-[#065a2a] text-white flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contact us on WhatsApp
            </Button>
            
            <Button
              onClick={() => {
                window.location.href = 'mailto:info@halatranslate.com'; // Replace with actual email
              }}
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Send us an Email
            </Button>
          </div>

          <DialogFooter className="mt-4" suppressHydrationWarning>
            <Button
              onClick={() => {
                setShowPageLimitModal(false);
                // Allow user to continue with warning
              }}
              variant="ghost"
              className="text-slate-600 hover:text-slate-800"
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

