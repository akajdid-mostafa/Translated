"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CouponsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 0,
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
    description: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/admin/login");
      return;
    }
    fetchCoupons();
  }, [user, router]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minPurchase: "",
      maxDiscount: "",
      usageLimit: "",
      expiresAt: "",
      isActive: true,
      description: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      isActive: coupon.isActive,
      description: coupon.description || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate discountValue
    const discountValue = parseFloat(formData.discountValue.toString());
    if (isNaN(discountValue) || discountValue <= 0) {
      alert("Please enter a valid discount value");
      return;
    }

    if (formData.discountType === "PERCENTAGE" && discountValue > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    const payload: any = {
      code: formData.code,
      discountType: formData.discountType,
      discountValue: discountValue,
      isActive: formData.isActive,
      description: formData.description || undefined,
    };

    // Only include optional fields if they have values
    if (formData.minPurchase && formData.minPurchase.trim() !== "") {
      const minPurchase = parseFloat(formData.minPurchase);
      if (!isNaN(minPurchase) && minPurchase > 0) {
        payload.minPurchase = minPurchase;
      }
    }

    if (formData.maxDiscount && formData.maxDiscount.trim() !== "") {
      const maxDiscount = parseFloat(formData.maxDiscount);
      if (!isNaN(maxDiscount) && maxDiscount > 0) {
        payload.maxDiscount = maxDiscount;
      }
    }

    if (formData.usageLimit && formData.usageLimit.trim() !== "") {
      const usageLimit = parseInt(formData.usageLimit);
      if (!isNaN(usageLimit) && usageLimit > 0) {
        payload.usageLimit = usageLimit;
      }
    }

    if (formData.expiresAt && formData.expiresAt.trim() !== "") {
      payload.expiresAt = formData.expiresAt;
    }

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowDialog(false);
        fetchCoupons();
      } else {
        const error = await response.json();
        const errorMessage = error.error 
          + (error.details ? `: ${typeof error.details === 'string' ? error.details : JSON.stringify(error.details)}` : '');
        alert(errorMessage || "Failed to save coupon");
        console.error("Coupon creation error:", error);
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Failed to save coupon. Please check the console for details.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCoupons();
      } else {
        alert("Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Failed to delete coupon");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <AdminLayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
            <p className="text-muted-foreground">
              Create and manage discount coupon codes
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-[#076E32] hover:bg-[#065a2a]">
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>Manage discount coupon codes</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Discount</TableHead>
                    <TableHead className="font-semibold">Usage</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Expires</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      <Badge variant={coupon.discountType === "PERCENTAGE" ? "default" : "secondary"}>
                        {coupon.discountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `SAR ${coupon.discountValue}`}
                    </TableCell>
                    <TableCell>
                      {coupon.usageLimit
                        ? `${coupon.usedCount}/${coupon.usageLimit}`
                        : `${coupon.usedCount} uses`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isExpired(coupon.expiresAt) ? (
                          <Badge  className="text-white bg-red-500">Expired</Badge>
                        ) : coupon.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>Configure the coupon details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  placeholder="SUMMER2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "PERCENTAGE" | "FIXED") =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discountValue">
                    Discount Value * ({formData.discountType === "PERCENTAGE" ? "%" : "SAR"})
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase">Minimum Purchase (SAR)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="maxDiscount">Max Discount (SAR)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    placeholder="For % discounts only"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiry Date</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (coupon can be used)
                </Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#076E32] hover:bg-[#065a2a]">
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayoutWrapper>
  );
}

