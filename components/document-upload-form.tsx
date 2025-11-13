"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
import {
  Upload,
  FileText,
  X,
  ChevronRight,
  User,
  CircleHelp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
// Removed Cloudinary import - using client-side upload instead

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  fileUrl?: string; // Added to store the URL from Cloudinary
}

export function DocumentUploadForm() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numPages, setNumPages] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState("");
  const router = useRouter(); // Add this line
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    sourceLanguage: "",
    targetLanguage: "",
    documentType: "",
    urgency: "STANDARD",
    specialization: "",
    additionalNotes: "",
  });

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
    if (uploadedFiles.length + files.length > 10) {
      alert("Maximum 10 pages allowed. Please contact us for more pages.");
      return;
    }
    
    // Validate file types - Only allow PDF, Word, and TXT files
    const allowedTypes = [
      "application/pdf", // PDF
      "application/msword", // DOC (Word 97-2003)
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX (Word 2007+)
      "text/plain", // TXT
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    
    // Filter out invalid files
    const validFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      const isValidType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.includes(fileExtension);
      
      if (!isValidType && !isValidExtension) {
        alert(`File "${file.name}" is not a supported format. Please upload only PDF, DOC, DOCX, or TXT files.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) {
      return;
    }
    
    // Generate a temporary request ID for organized file storage
    let tempRequestId: string | null = null;
    try {
      const tempIdResponse = await fetch('/api/generate-temp-id');
      if (tempIdResponse.ok) {
        const tempIdData = await tempIdResponse.json();
        tempRequestId = tempIdData.tempRequestId;
        console.log(`Generated temporary request ID for file organization: ${tempRequestId}`);
      }
    } catch (error) {
      console.warn("Failed to generate temporary request ID, files will be uploaded to fallback folder:", error);
    }
    
    for (const file of validFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const uploadedFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: "uploading",
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      try {
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: Math.min(progress, 90) } : f
            )
          );
        }, 200);

        // Upload file to server with organized folder structure
        const formData = new FormData();
        formData.append('file', file);
        if (tempRequestId) {
          formData.append('requestId', tempRequestId);
        }
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          clearInterval(interval);
          
          if (result.url) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? {
                      ...f,
                      progress: 100,
                      status: "completed",
                      fileUrl: result.url,
                    }
                  : f
              )
            );
          } else {
            throw new Error("Upload failed - no URL returned");
          }
        } catch (uploadError) {
          // Fallback: Create a data URL for local testing
          console.warn("Server upload failed, using data URL fallback:", uploadError);
          const reader = new FileReader();
          reader.onload = () => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? {
                      ...f,
                      progress: 100,
                      status: "completed",
                      fileUrl: reader.result as string,
                    }
                  : f
              )
            );
          };
          reader.readAsDataURL(file);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  progress: 0,
                  status: "error",
                }
              : f
          )
        );
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to upload ${file.name}: ${errorMessage}`);
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

    if (
      !formData.sourceLanguage ||
      !formData.targetLanguage ||
      !formData.documentType ||
      !numPages
    ) {
      alert("Please fill in all required Document & Translation Details.");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.customerEmail ||
      !formData.customerPhone
    ) {
      alert("Please fill in all required Customer Details.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for review page (same as before)
      const reviewData = {
        ...formData,
        numPages: numPages,
        estimatedPrice: calculateOrderTotal().toString(),
        originalFileName: uploadedFiles[0]?.file.name || "",
        fileUrl: uploadedFiles[0]?.fileUrl || "",
        fileSize: uploadedFiles[0]?.file.size.toString() || "",
        fileType: uploadedFiles[0]?.file.type || "",
      };
      
      // Redirect to review page with form data
      const encodedData = encodeURIComponent(JSON.stringify(reviewData));
      router.push(`/review-order?formData=${encodedData}`);

    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = "An error occurred while submitting your request";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract error message from response
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = Array.isArray(errorObj.error) 
            ? errorObj.error.map((e: any) => e.message || e).join(', ')
            : errorObj.error;
        }
      }
      
      alert(`Submission Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    setSubmittedRequestId("");
  };

  const calculateOrderTotal = () => {
    // Calculate total based on number of pages
    const pages = parseInt(numPages, 10);
    if (isNaN(pages) || pages <= 0) {
      return 0; // Return 0 if number of pages is invalid or not set
    }
    return pages * 350; // Each page costs 350 DH
  };

  return (
    <section className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <form onSubmit={handleSubmit} className="space-y-8" suppressHydrationWarning>
          {/* Upload Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center" suppressHydrationWarning>
                <Upload className="w-5 h-5 text-[#076e32] mr-2" />
                <CardTitle className="text-xl">
                  Upload your documents in seconds
                </CardTitle>
              </div>
              <CardDescription>
                We will handle the rest with precision and care.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                suppressHydrationWarning
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900">
                  Drop your files here, or browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: PDF, Word documents, and TXT files
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Browse Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-yellow-600">
                    Maximum: 10 pages. If you have more pages, please contact us
                    on WhatsApp or email.
                  </p>
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {uploadedFile.file.name}
                          </p>
                          {uploadedFile.status === "uploading" && (
                            <Progress
                              value={uploadedFile.progress}
                              className="h-1 mt-1"
                            />
                          )}
                          {uploadedFile.status === "completed" && (
                            <p className="text-xs text-green-600">
                              Upload Complete
                            </p>
                          )}
                          {uploadedFile.status === "error" && (
                            <p className="text-xs text-red-600">
                              Upload Failed
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document & Translation Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center" suppressHydrationWarning>
                <FileText className="w-5 h-5 text-[#076e32] mr-2" />
                <CardTitle className="text-xl">
                  Document & Translation Details
                </CardTitle>
              </div>
              <CardDescription>
                Specify the source and target languages, and add any special
                instructions if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4" suppressHydrationWarning>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="sourceLanguage">Source Language *</Label>
                  <Select
                    value={formData.sourceLanguage}
                    onValueChange={(value) => {
                      setFormData({ ...formData, sourceLanguage: value });
                      if (value === formData.targetLanguage) {
                        setFormData({ ...formData, sourceLanguage: value, targetLanguage: "" });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Russian">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="targetLanguage">Target Language *</Label>
                  <Select
                    value={formData.targetLanguage}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetLanguage: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English" disabled={formData.sourceLanguage === "English"}>English</SelectItem>
                      <SelectItem value="Arabic" disabled={formData.sourceLanguage === "Arabic"}>Arabic</SelectItem>
                      <SelectItem value="French" disabled={formData.sourceLanguage === "French"}>French</SelectItem>
                      <SelectItem value="Spanish" disabled={formData.sourceLanguage === "Spanish"}>Spanish</SelectItem>
                      <SelectItem value="German" disabled={formData.sourceLanguage === "German"}>German</SelectItem>
                      <SelectItem value="Chinese" disabled={formData.sourceLanguage === "Chinese"}>Chinese</SelectItem>
                      <SelectItem value="Japanese" disabled={formData.sourceLanguage === "Japanese"}>Japanese</SelectItem>
                      <SelectItem value="Russian" disabled={formData.sourceLanguage === "Russian"}>Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4" suppressHydrationWarning>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, documentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEGAL">Legal</SelectItem>
                      <SelectItem value="MEDICAL">Medical</SelectItem>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="CERTIFIED">Certified</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="numPages">Number of Pages *</Label>
                  <Input
                    id="numPages"
                    type="number"
                    placeholder="Enter number of pages"
                    value={numPages}
                    onChange={(e) => setNumPages(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2" suppressHydrationWarning>
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, urgency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="EXPRESS">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" suppressHydrationWarning>
                <Label htmlFor="specialization">Special Instructions</Label>
                <Textarea
                  id="specialization"
                  placeholder="Add any specific requirements or instructions for your translation..."
                  value={formData.additionalNotes} // Using additionalNotes for special instructions as per image
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalNotes: e.target.value,
                    })
                  }
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Include any special requirements or notes for the
                  translator.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center" suppressHydrationWarning>
                <User className="w-5 h-5 text-[#076e32] mr-2" />
                <CardTitle className="text-xl">Customer Details</CardTitle>
              </div>
              <CardDescription>
                We will send you updates and notify you when your translation is
                ready.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4" suppressHydrationWarning>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4" suppressHydrationWarning>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="Email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    placeholder="e.g. +971456789012"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPhone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Total & Continue Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-bold">
                    Order Total : {calculateOrderTotal()} DH
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleHelp className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Review and confirm your order details in the next
                          step.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      {/* showSuccessMessage && (
        <SubmissionSuccessMessage
          requestId={submittedRequestId}
          onClose={handleCloseSuccessMessage}
        />
      ) */}
    </section>
  );
}
