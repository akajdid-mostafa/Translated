"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { FileText, Clock, CheckCircle, AlertCircle, Search, Eye, Edit, LogOut, Trash, Download, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { DeleteSuccessModal } from "@/components/ui/delete-success-modal"
// Removed: import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

enum RequestStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  QUOTE_SENT = "QUOTE_SENT",
  APPROVED = "APPROVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  ON_HOLD = "ON_HOLD",
}

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
  numberOfPages: string
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
  statusHistory: Array<{ status: string; createdAt: string; notes: string; changedBy: string }>
}

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  inProgressRequests: number
  completedRequests: number
  recentRequests: TranslationRequest[]
  statusDistribution: Record<string, number>
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [requests, setRequests] = useState<TranslationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState("10")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [dateFilter, setDateFilter] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [requestIdToDelete, setRequestIdToDelete] = useState<string | null>(null)
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false) // New state for success modal
  // Removed: const { toast } = useToast() // Initialize useToast

  useEffect(() => {
    fetchStats()
    fetchRequests()
  }, [currentPage, statusFilter, searchTerm, itemsPerPage, sortBy, sortOrder, dateFilter])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder,
        ...(dateFilter && { dateFrom: dateFilter, dateTo: dateFilter }),
      })

      const response = await fetch(`/api/admin/requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
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

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      STANDARD: { variant: "outline" as const, label: "Standard" },
      URGENT: { variant: "secondary" as const, label: "Urgent" },
      EXPRESS: { variant: "destructive" as const, label: "Express" },
    }

    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.STANDARD
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleLogout = async () => {
    await logout()
    router.push("/") // Redirect to home page
  }

  const handleDeleteClick = (requestId: string) => {
    setRequestIdToDelete(requestId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (requestIdToDelete) {
      try {
        const response = await fetch(`/api/admin/requests/${requestIdToDelete}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestIdToDelete))
          fetchStats()
          fetchRequests()
          setShowDeleteSuccessModal(true) // Show success modal
        } else {
          console.error(`Failed to delete request ${requestIdToDelete}:`, response.status)
          alert("Failed to delete request.") // Revert to alert for error, or keep toast if user prefers error toasts
        }
      } catch (error) {
        console.error(`Error deleting request ${requestIdToDelete}:`, error)
        alert("Error deleting request.") // Revert to alert for error
      } finally {
        setShowDeleteModal(false)
        setRequestIdToDelete(null)
      }
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        console.log("Updated request from API:", updatedRequest)
        console.log("Updated request statusHistory:", updatedRequest.statusHistory)
        setRequests((prevRequests) =>
          prevRequests.map((request) => (request.id === requestId ? updatedRequest : request))
        )
        console.log(`Status updated for request ${requestId} to ${newStatus}`)
        fetchStats()
        fetchRequests()
      } else {
        console.error(`Failed to update status for request ${requestId}:`, response.status)
      }
    } catch (error) {
      console.error(`Error updating status for request ${requestId}:`, error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/images/logo.svg" alt="Translated Logo" width={200} height={100} />
              {/* <h1 className="text-xl font-bold text-gray-900">Dashboard</h1> */}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome in the Dashboard, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressRequests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedRequests}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Translation Requests</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Translation Requests</CardTitle>
                <CardDescription>Manage and track all translation requests</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, email, or filename..."
                        value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                          }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                    <Select value={statusFilter} onValueChange={(value) => {
                      setStatusFilter(value)
                      setCurrentPage(1)
                    }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={sortBy} onValueChange={(value) => {
                      setSortBy(value)
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortOrder} onValueChange={(value) => {
                      setSortOrder(value)
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortBy === "date" ? (
                          <>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="asc">A to Z</SelectItem>
                            <SelectItem value="desc">Z to A</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-[180px]"
                      placeholder="Filter by date"
                    />
                    
                    <Select value={itemsPerPage} onValueChange={(value) => {
                      setItemsPerPage(value)
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Items per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                        <SelectItem value="all">Show All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Requests Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.customerName}</div>
                              <div className="text-sm text-gray-500">{request.customerEmail}</div>
                              <div className="text-sm text-gray-500">{request.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {request.sourceLanguage} → {request.targetLanguage}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{request.originalFileName}</div>
                              <div className="text-xs text-gray-500">{request.documentType}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{request.numberOfPages}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!request.fileUrl || request.fileUrl === 'pending') {
                                    alert('File is not available yet. Please wait for the file to be processed.');
                                    return;
                                  }
                                  
                                  try {
                                    // Check file format
                                    const fileUrl = request.fileUrl.toLowerCase();
                                    const isPdf = fileUrl.includes('.pdf');
                                    const isTxt = fileUrl.includes('.txt');
                                    const isDoc = fileUrl.includes('.doc') && !fileUrl.includes('.docx');
                                    const isDocx = fileUrl.includes('.docx');
                                    
                                    if (isPdf || isTxt) {
                                      // PDF and TXT can be viewed directly - open API URL in new tab
                                      const viewUrl = `/api/view-file?url=${encodeURIComponent(request.fileUrl)}`;
                                      window.open(viewUrl, '_blank', 'noopener,noreferrer');
                                    } else if (isDoc || isDocx) {
                                      // Word documents cannot be viewed inline - show message
                                      const downloadUrl = `/api/download?url=${encodeURIComponent(request.fileUrl)}&filename=${encodeURIComponent(request.originalFileName || 'file')}`;
                                      const userChoice = confirm('Word documents cannot be displayed in the browser. Would you like to download the file to view it?');
                                      if (userChoice) {
                                        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                                      }
                                    } else {
                                      // Unknown format - try to view, but warn user
                                  const viewUrl = `/api/view-file?url=${encodeURIComponent(request.fileUrl)}`;
                                      window.open(viewUrl, '_blank', 'noopener,noreferrer');
                                    }
                                  } catch (error) {
                                    console.error('View file error:', error);
                                    alert('Failed to open file. Please try again.');
                                  }
                                }}
                                className="flex items-center gap-1"
                                disabled={!request.fileUrl || request.fileUrl === 'pending'}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (!request.fileUrl || request.fileUrl === 'pending') {
                                    alert('File is not available yet. Please wait for the file to be processed.');
                                    return;
                                  }

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
                                      return;
                                    }

                                    // For Cloudinary or other URLs, use the download API
                                    const downloadUrl = `/api/download?url=${encodeURIComponent(request.fileUrl)}&filename=${encodeURIComponent(request.originalFileName)}`;
                                    
                                    // Try to download using fetch first to handle errors
                                    const response = await fetch(downloadUrl);
                                    
                                    if (!response.ok) {
                                      const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
                                      throw new Error(errorData.error || 'Download failed');
                                    }

                                    // Get the blob and create download link
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                    link.href = url;
                                        link.download = request.originalFileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error('Download error:', error);
                                    alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                  }
                                }}
                                className="flex items-center gap-1"
                                disabled={!request.fileUrl || request.fileUrl === 'pending'}
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {request.fileSize ? `${(request.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{request.finalPrice || request.estimatedPrice || "N/A"} DH</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleTimeString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Select
                                value={request.status}
                                onValueChange={(newStatus) => handleStatusChange(request.id, newStatus as RequestStatus)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(RequestStatus).map((statusOption) => (
                                    <SelectItem key={statusOption} value={statusOption}>
                                      {statusOption.replace(/_/g, " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/requests/${request.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/requests/${request.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(request.id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {pagination.pages > 1 && itemsPerPage !== "all" && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum: number
                          if (pagination.pages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="min-w-[40px]"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                        disabled={currentPage === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Show total when "all" is selected */}
                {itemsPerPage === "all" && pagination.total > 0 && (
                  <div className="mt-6 text-sm text-gray-600 text-center">
                    Showing all {pagination.total} requests
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest translation requests and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{request.customerName}</p>
                        <p className="text-sm text-gray-500">
                          {request.sourceLanguage} → {request.targetLanguage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.status)}
                      <p className="text-xs text-gray-500 mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName="translation request"
      />
      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
      />
    </div>
  )
}
