"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, FileText, User, Phone, Mail, MapPin, ExternalLink } from "lucide-react"

interface TranslationRequest {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  sourceLanguage: string
  targetLanguage: string
  documentType: string
  urgency: string
  specialization?: string
  additionalNotes?: string
  originalFileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  status: string
  estimatedPrice?: number
  finalPrice?: number
  estimatedDelivery?: string
  actualDelivery?: string
  adminNotes?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  statusHistory: Array<{
    id: string
    status: string
    notes?: string
    changedBy: string
    createdAt: string
  }>
}

export default function RequestDetails() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<TranslationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    status: "",
    estimatedPrice: "",
    finalPrice: "",
    estimatedDelivery: "",
    actualDelivery: "",
    adminNotes: "",
    assignedTo: "",
  })

  useEffect(() => {
    fetchRequest()
  }, [params.id])

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/admin/requests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRequest(data.request)
        setFormData({
          status: data.request.status,
          estimatedPrice: data.request.estimatedPrice?.toString() || "",
          finalPrice: data.request.finalPrice?.toString() || "",
          estimatedDelivery: data.request.estimatedDelivery
            ? new Date(data.request.estimatedDelivery).toISOString().split("T")[0]
            : "",
          actualDelivery: data.request.actualDelivery
            ? new Date(data.request.actualDelivery).toISOString().split("T")[0]
            : "",
          adminNotes: data.request.adminNotes || "",
          assignedTo: data.request.assignedTo || "",
        })
      }
    } catch (error) {
      console.error("Error fetching request:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const updateData = {
        ...formData,
        estimatedPrice: formData.estimatedPrice ? Number.parseFloat(formData.estimatedPrice) : undefined,
        finalPrice: formData.finalPrice ? Number.parseFloat(formData.finalPrice) : undefined,
      }

      const response = await fetch(`/api/admin/requests/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchRequest() // Refresh data
      }
    } catch (error) {
      console.error("Error updating request:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending" },
      UNDER_REVIEW: { variant: "outline" as const, label: "Under Review" },
      QUOTE_SENT: { variant: "outline" as const, label: "Quote Sent" },
      APPROVED: { variant: "default" as const, label: "Approved" },
      IN_PROGRESS: { variant: "default" as const, label: "In Progress" },
      COMPLETED: { variant: "default" as const, label: "Completed" },
      DELIVERED: { variant: "default" as const, label: "Delivered" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelled" },
      ON_HOLD: { variant: "secondary" as const, label: "On Hold" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Request not found</p>
          <Button onClick={() => router.push("/admin/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
              <p className="text-gray-600">ID: {request.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(request.status)}
            <Button variant="outline" onClick={() => {
              // Use the view-file API to ensure proper display
              const viewUrl = `/api/view-file?url=${encodeURIComponent(request.fileUrl)}`;
              window.open(viewUrl, "_blank");
            }}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View File
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                // Check if it's a data URL (base64)
                if (request.fileUrl.startsWith('data:')) {
                  // Handle data URL (base64) files directly
                  const link = document.createElement('a');
                  link.href = request.fileUrl;
                  link.download = request.originalFileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  // Try direct download first
                  try {
                    const link = document.createElement('a');
                    link.href = request.fileUrl;
                    link.download = request.originalFileName;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (directError) {
                    console.warn('Direct download failed, trying server-side:', directError);
                    // Fallback to server-side download
                    const downloadUrl = `/api/download?url=${encodeURIComponent(request.fileUrl)}&filename=${encodeURIComponent(request.originalFileName)}`;
                    window.open(downloadUrl, '_blank');
                  }
                }
              } catch (error) {
                console.error('Download error:', error);
                alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Name</Label>
                    <p className="text-sm">{request.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {request.customerEmail}
                    </p>
                  </div>
                  {request.customerPhone && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-sm flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {request.customerPhone}
                      </p>
                    </div>
                  )}
                  {request.customerAddress && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p className="text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {request.customerAddress}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Translation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Translation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Source Language</Label>
                    <p className="text-sm">{request.sourceLanguage}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Target Language</Label>
                    <p className="text-sm">{request.targetLanguage}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Document Type</Label>
                    <p className="text-sm">{request.documentType}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Urgency</Label>
                    <Badge
                      variant={
                        request.urgency === "EXPRESS"
                          ? "destructive"
                          : request.urgency === "URGENT"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {request.urgency}
                    </Badge>
                  </div>
                </div>

                {request.specialization && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Specialization</Label>
                    <p className="text-sm">{request.specialization}</p>
                  </div>
                )}

                {request.additionalNotes && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500">Additional Notes</Label>
                    <p className="text-sm">{request.additionalNotes}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">File Information</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">{request.originalFileName}</p>
                    <p className="text-xs text-gray-500">
                      {request.fileType} • {(request.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Request</CardTitle>
                <CardDescription>Manage request status and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="QUOTE_SENT">Quote Sent</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedPrice">Estimated Price</Label>
                    <Input
                      id="estimatedPrice"
                      type="number"
                      step="0.01"
                      value={formData.estimatedPrice}
                      onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice">Final Price</Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      step="0.01"
                      value={formData.finalPrice}
                      onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualDelivery">Actual Delivery</Label>
                  <Input
                    id="actualDelivery"
                    type="date"
                    value={formData.actualDelivery}
                    onChange={(e) => setFormData({ ...formData, actualDelivery: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Translator name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    placeholder="Internal notes..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleUpdate} disabled={updating} className="w-full">
                  {updating ? "Updating..." : "Update Request"}
                </Button>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {request.statusHistory.map((history) => (
                    <div key={history.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {history.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {history.notes && <p className="text-sm text-gray-600 mt-1">{history.notes}</p>}
                        <p className="text-xs text-gray-500">by {history.changedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
