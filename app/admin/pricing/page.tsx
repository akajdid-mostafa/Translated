"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save, Loader2, Calculator } from "lucide-react";

interface PricingSettings {
  standardCertifiedPricePerPage: number;
  swornPricePerPage: number;
  standardMultiplier: number;
  nextDayMultiplier: number;
  sameDayMultiplier: number;
  hardCopyFee: number;
}

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PricingSettings>({
    standardCertifiedPricePerPage: 49,
    swornPricePerPage: 75,
    standardMultiplier: 1.0,
    nextDayMultiplier: 1.5,
    sameDayMultiplier: 2.0,
    hardCopyFee: 50,
  });

  useEffect(() => {
    if (!user) {
      router.push("/admin/login");
      return;
    }
    fetchPricing();
  }, [user, router]);

  const fetchPricing = async () => {
    try {
      const response = await fetch("/api/admin/pricing");
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Pricing settings updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to update pricing"}`);
      }
    } catch (error) {
      console.error("Error updating pricing:", error);
      alert("Failed to update pricing settings");
    } finally {
      setSaving(false);
    }
  };

  // Calculate example prices
  const calculateExample = (
    pages: number,
    serviceType: "STANDARD" | "SWORN",
    turnaround: "STANDARD" | "NEXT_DAY" | "SAME_DAY",
    includeHardCopy: boolean = false
  ): number => {
    const basePrice = serviceType === "SWORN" 
      ? formData.swornPricePerPage 
      : formData.standardCertifiedPricePerPage;
    
    const multiplier = turnaround === "NEXT_DAY" 
      ? formData.nextDayMultiplier 
      : turnaround === "SAME_DAY" 
      ? formData.sameDayMultiplier 
      : formData.standardMultiplier;
    
    const translationPrice = pages * basePrice * multiplier;
    const hardCopyFee = includeHardCopy ? formData.hardCopyFee : 0;
    
    return translationPrice + hardCopyFee;
  };

  if (loading) {
    return (
      <AdminLayoutWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#076e32] mx-auto mb-4" />
            <div>Loading pricing settings...</div>
          </div>
        </div>
      </AdminLayoutWrapper>
    );
  }

  return (
    <AdminLayoutWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-[#076e32]" />
              Pricing Settings
            </h1>
            <p className="text-muted-foreground">
              Configure pricing variables for translation services. These values control price calculations in the upload form.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type Prices */}
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle>Service Type Prices (per page)</CardTitle>
              <CardDescription>
                Base price per page for each service type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="standardCertifiedPricePerPage" className="text-sm font-semibold">
                    Standard Certified Price (SAR per page)
                  </Label>
                  <Input
                    id="standardCertifiedPricePerPage"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.standardCertifiedPricePerPage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        standardCertifiedPricePerPage: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for standard certified translations
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swornPricePerPage" className="text-sm font-semibold">
                    Sworn (Official Court) Price (SAR per page)
                  </Label>
                  <Input
                    id="swornPricePerPage"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.swornPricePerPage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        swornPricePerPage: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for sworn/official court translations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Turnaround Multipliers */}
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle>Turnaround Multipliers</CardTitle>
              <CardDescription>
                Multipliers applied to base price based on turnaround time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="standardMultiplier" className="text-sm font-semibold">
                    Standard Multiplier
                  </Label>
                  <Input
                    id="standardMultiplier"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.standardMultiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        standardMultiplier: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied to standard turnaround (3 business days)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDayMultiplier" className="text-sm font-semibold">
                    Next Day Multiplier
                  </Label>
                  <Input
                    id="nextDayMultiplier"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nextDayMultiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextDayMultiplier: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied to next-day delivery (before 6PM)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sameDayMultiplier" className="text-sm font-semibold">
                    Same Day Multiplier
                  </Label>
                  <Input
                    id="sameDayMultiplier"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sameDayMultiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sameDayMultiplier: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied to same-day delivery (before 12PM)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hard Copy Delivery */}
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle>Hard Copy Delivery</CardTitle>
              <CardDescription>
                Fee for hard copy delivery (single option)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="hardCopyFee" className="text-sm font-semibold">
                  Hard Copy Fee (SAR)
                </Label>
                <Input
                  id="hardCopyFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hardCopyFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hardCopyFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Fixed fee added when hard copy delivery is selected
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Examples */}
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#076e32]" />
                Price Calculation Examples
              </CardTitle>
              <CardDescription>
                Example calculations using current pricing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="text-sm font-semibold mb-2">3 pages, Standard Certified, Standard</div>
                    <div className="text-2xl font-bold text-[#076e32]">
                      {calculateExample(3, "STANDARD", "STANDARD", false).toFixed(2)} SAR
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.standardCertifiedPricePerPage} × 3 × {formData.standardMultiplier}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="text-sm font-semibold mb-2">3 pages, Standard Certified, Next Day</div>
                    <div className="text-2xl font-bold text-[#076e32]">
                      {calculateExample(3, "STANDARD", "NEXT_DAY", false).toFixed(2)} SAR
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.standardCertifiedPricePerPage} × 3 × {formData.nextDayMultiplier}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="text-sm font-semibold mb-2">3 pages, Sworn, Standard</div>
                    <div className="text-2xl font-bold text-[#076e32]">
                      {calculateExample(3, "SWORN", "STANDARD", false).toFixed(2)} SAR
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.swornPricePerPage} × 3 × {formData.standardMultiplier}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="text-sm font-semibold mb-2">3 pages, Standard Certified, Standard + Hard Copy</div>
                    <div className="text-2xl font-bold text-[#076e32]">
                      {calculateExample(3, "STANDARD", "STANDARD", true).toFixed(2)} SAR
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ({formData.standardCertifiedPricePerPage} × 3 × {formData.standardMultiplier}) + {formData.hardCopyFee}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="text-sm font-semibold mb-2">5 pages, Sworn, Same Day + Hard Copy</div>
                  <div className="text-2xl font-bold text-[#076e32]">
                    {calculateExample(5, "SWORN", "SAME_DAY", true).toFixed(2)} SAR
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ({formData.swornPricePerPage} × 5 × {formData.sameDayMultiplier}) + {formData.hardCopyFee}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button 
              type="submit" 
              disabled={saving} 
              className="bg-[#076e32] hover:bg-[#065a2a]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Pricing Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayoutWrapper>
  );
}


