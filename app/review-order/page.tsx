"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, Clock, CalendarDays, ChevronLeft, MapPin, FileText, Package, User, Mail, Phone, Loader2, Tag, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormData {
  firstName: string;
  lastName: string;
  customerEmail: string;
  customerPhone: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  serviceLevel?: string; // STANDARD_CERTIFIED or SWORN
  turnaround?: string; // STANDARD, NEXT_DAY, or SAME_DAY
  urgency?: string; // Legacy field
  specialization: string;
  additionalNotes: string;
  numPages: string;
  estimatedPrice: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  hardCopy?: boolean;
  hardCopyDelivery?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;
  deliveryInstructions?: string;
}

function ReviewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("STANDARD"); // Default to Standard
  const [finalPrice, setFinalPrice] = useState(0);
  const [hardCopyDelivery, setHardCopyDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
    deliveryInstructions: ''
  });
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [priceBeforeDiscount, setPriceBeforeDiscount] = useState(0);
  
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
  
  // Service level and turnaround from form
  const [serviceLevel, setServiceLevel] = useState("STANDARD_CERTIFIED");
  const [turnaround, setTurnaround] = useState("STANDARD");

  // Map urgency from first stage to delivery option
  const mapUrgencyToDelivery = (urgency: string): string => {
    switch (urgency) {
      case "EXPRESS":
        return "SAME_DAY";
      case "URGENT":
        return "NEXT_DAY";
      case "STANDARD":
      default:
        return "STANDARD";
    }
  };

  // Fixed pricing calculation algorithm
  // Formula: (Price per page × Service Type) × Turnaround Multiplier + Hard Copy Fee - Coupon
  const calculatePrice = (numPages: string, currentServiceLevel: string, currentTurnaround: string, includeHardCopy: boolean = false, applyCoupon: boolean = true) => {
    const pages = parseInt(numPages, 10);
    if (isNaN(pages) || pages <= 0) return 0;

    // Step 1: Get base price per page based on service type
    const basePricePerPage = currentServiceLevel === "SWORN" 
      ? pricingSettings.swornPricePerPage 
      : pricingSettings.standardCertifiedPricePerPage;
    
    // Step 2: Calculate base translation price
    const baseTranslationPrice = pages * basePricePerPage;
    
    // Step 3: Apply turnaround multiplier
    let multiplier = pricingSettings.standardMultiplier;
    if (currentTurnaround === "NEXT_DAY") {
      multiplier = pricingSettings.nextDayMultiplier;
    } else if (currentTurnaround === "SAME_DAY") {
      multiplier = pricingSettings.sameDayMultiplier;
    }
    
    const translationPrice = baseTranslationPrice * multiplier;
    
    // Step 4: Add hard copy fee if selected
    const hardCopyFee = includeHardCopy ? pricingSettings.hardCopyFee : 0;
    
    // Step 5: Calculate subtotal
    let subtotal = translationPrice + hardCopyFee;
    
    // Step 6: Apply coupon discount (if applicable)
    if (applyCoupon && appliedCoupon) {
      subtotal = Math.max(0, subtotal - appliedCoupon.discountAmount);
    }
    
    return subtotal;
  };

  // Validate and apply coupon
  const validateCoupon = async (code: string, totalAmount: number) => {
    if (!code.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          totalAmount: totalAmount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          discountType: data.coupon.discountType,
        });
        // Update final price with discount
        setFinalPrice(data.finalAmount);
        setCouponError("");
        setCouponCode(""); // Clear input
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid coupon code");
        // Reset to price without coupon
        setFinalPrice(totalAmount);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Failed to validate coupon. Please try again.");
      setAppliedCoupon(null);
      setFinalPrice(totalAmount);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    // Reset to price before discount
    setFinalPrice(priceBeforeDiscount);
  };

  // Fetch pricing settings on mount (with cache busting)
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        // Add cache busting to ensure fresh data
        const response = await fetch("/api/pricing?t=" + Date.now(), {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched pricing from API:", data); // Debug log
          setPricingSettings(data);
          setPricingLoaded(true);
        } else {
          console.error("Failed to fetch pricing, status:", response.status);
          setPricingLoaded(true); // Still set to true to prevent infinite loading
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        // Use default values if fetch fails
        setPricingLoaded(true); // Still set to true to prevent infinite loading
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    const data = searchParams.get('formData');
    if (data) {
      const parsedData: FormData = JSON.parse(data);
      setFormData(parsedData);
      // Set service level and turnaround from form
      if (parsedData.serviceLevel) {
        setServiceLevel(parsedData.serviceLevel);
      }
      if (parsedData.turnaround) {
        setTurnaround(parsedData.turnaround);
        // Map turnaround to selectedDelivery for backward compatibility
        setSelectedDelivery(parsedData.turnaround);
      } else if (parsedData.urgency) {
        // Fallback to urgency if turnaround not provided
      const mappedDelivery = mapUrgencyToDelivery(parsedData.urgency || "STANDARD");
      setSelectedDelivery(mappedDelivery);
        setTurnaround(mappedDelivery);
      }
      // Set hard copy delivery state if it was selected in the form
      if (parsedData.hardCopy) {
        setHardCopyDelivery(true);
        // Parse delivery address if it exists
        if (parsedData.deliveryAddress) {
          // Try to parse the address if it's in the format "street, city, postal, country"
          const addressParts = parsedData.deliveryAddress.split(', ');
          if (addressParts.length >= 4) {
            setDeliveryAddress({
              street: addressParts[0] || '',
              city: parsedData.deliveryCity || addressParts[1] || '',
              postalCode: parsedData.deliveryPostalCode || addressParts[2] || '',
              country: parsedData.deliveryCountry || addressParts[3] || '',
              deliveryInstructions: parsedData.deliveryInstructions || ''
            });
          } else {
            setDeliveryAddress({
              street: parsedData.deliveryAddress || '',
              city: parsedData.deliveryCity || '',
              postalCode: parsedData.deliveryPostalCode || '',
              country: parsedData.deliveryCountry || '',
              deliveryInstructions: parsedData.deliveryInstructions || ''
            });
          }
        }
      }
    } else {
      // Redirect back if no data is present
      router.push('/');
    }
  }, [searchParams, router]);

  // Recalculate price whenever form data, service level, turnaround, or pricing settings change
  useEffect(() => {
    if (formData) {
      // Calculate price without coupon first
      const priceWithoutCoupon = calculatePrice(formData.numPages, serviceLevel, turnaround, hardCopyDelivery, false);
      setPriceBeforeDiscount(priceWithoutCoupon);
      
      // If coupon is applied, re-validate it with the new price
      if (appliedCoupon && priceWithoutCoupon > 0) {
        validateCoupon(appliedCoupon.code, priceWithoutCoupon);
      } else {
        // Calculate final price with coupon if available
        const finalPriceWithCoupon = calculatePrice(formData.numPages, serviceLevel, turnaround, hardCopyDelivery, true);
        setFinalPrice(finalPriceWithCoupon);
      }
    }
  }, [serviceLevel, turnaround, formData, hardCopyDelivery, appliedCoupon, pricingSettings]);

  const handleConfirmOrder = async () => {
    if (!formData) return;

    // Ensure a file is provided in formData
    if (!formData.originalFileName || !formData.fileUrl) {
      alert("Error: Missing file information. Please go back and re-upload your document.");
      return;
    }

    // Validate hard copy delivery address if hard copy is requested
    if (hardCopyDelivery) {
      if (!deliveryAddress.street.trim() || !deliveryAddress.city.trim() || 
          !deliveryAddress.postalCode.trim() || !deliveryAddress.country.trim()) {
        alert("Please fill in all required delivery address fields.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Create FormData for the new organized upload endpoint
      // Pass existing file information instead of re-downloading the file
      const formDataToSend = new FormData();
      formDataToSend.append('customerName', `${formData.firstName} ${formData.lastName}`);
      formDataToSend.append('customerEmail', formData.customerEmail);
      // Normalize phone number (remove spaces, dashes, parentheses, etc.)
      const normalizedPhone = formData.customerPhone ? formData.customerPhone.replace(/[^\d+]/g, '') : '';
      formDataToSend.append('customerPhone', normalizedPhone);
      
      // Build full delivery address if hard copy is requested
      let fullAddress = '';
      if (hardCopyDelivery) {
        const addressParts = [
          deliveryAddress.street,
          deliveryAddress.city,
          deliveryAddress.postalCode,
          deliveryAddress.country
        ].filter(part => part.trim() !== '');
        fullAddress = addressParts.join(', ');
        if (deliveryAddress.deliveryInstructions) {
          fullAddress += ` (Instructions: ${deliveryAddress.deliveryInstructions})`;
        }
      }
      formDataToSend.append('customerAddress', fullAddress);
      formDataToSend.append('hardCopyDelivery', hardCopyDelivery ? 'true' : 'false');
      formDataToSend.append('sourceLanguage', formData.sourceLanguage);
      formDataToSend.append('targetLanguage', formData.targetLanguage);
      formDataToSend.append('documentType', formData.documentType);
      // Send service level and turnaround
      if (formData.serviceLevel) {
        formDataToSend.append('serviceLevel', formData.serviceLevel);
      }
      if (turnaround) {
        formDataToSend.append('turnaround', turnaround);
        formDataToSend.append('urgency', turnaround); // For backward compatibility
      } else {
        formDataToSend.append('urgency', selectedDelivery);
      }
      formDataToSend.append('specialization', formData.specialization || '');
      formDataToSend.append('additionalNotes', formData.additionalNotes || '');
      formDataToSend.append('numberOfPages', formData.numPages);
      formDataToSend.append('estimatedPrice', finalPrice.toString()); // Add the calculated final price (with coupon discount)
      
      // Add coupon information if applied
      if (appliedCoupon) {
        formDataToSend.append('couponCode', appliedCoupon.code);
        formDataToSend.append('discountAmount', appliedCoupon.discountAmount.toString());
      }
      formDataToSend.append('originalFileName', formData.originalFileName);
      formDataToSend.append('fileUrl', formData.fileUrl);
      formDataToSend.append('fileSize', formData.fileSize);
      formDataToSend.append('fileType', formData.fileType);

      console.log('Submitting organized request with existing file info');

      const response = await fetch("/api/requests-with-files", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Request submitted successfully:', result);
        router.push(`/submission-success?requestId=${result.requestId}`);
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        alert(`Submission Error: ${errorData.message || errorData.error || "An unknown error occurred."}`);
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("An error occurred while confirming your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8" suppressHydrationWarning>
          <div className="flex items-center justify-between mb-4" suppressHydrationWarning>
            <h1 className="text-3xl font-bold text-gray-900">Review Your Order</h1>
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <p className="text-gray-600">Double-check your details before placing the order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" suppressHydrationWarning>
          {/* Left Column: Order Details */}
          <div className="lg:col-span-2 space-y-6" suppressHydrationWarning>

            {/* Customer Information */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm">Your contact details for order updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      Full Name
                    </p>
                    <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </p>
                    <p className="font-medium text-gray-900 break-all">{formData.customerEmail}</p>
                  </div>
                  {formData.customerPhone && (
                    <div>
                      <p className="text-gray-500 mb-1 flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </p>
                      <p className="font-medium text-gray-900">{formData.customerPhone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">From</p>
                    <p className="font-medium">{formData.sourceLanguage}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">To</p>
                    <p className="font-medium">{formData.targetLanguage}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Document Type</p>
                    <p className="font-medium">{formData.documentType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Pages</p>
                    <p className="font-medium">{formData.numPages}</p>
                  </div>
                  {hardCopyDelivery && (
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Hard Copy</p>
                      <p className="font-medium text-[#076e32]">
                        ✓ Selected
                      </p>
                    </div>
                  )}
                </div>
                
                {formData.originalFileName && formData.fileUrl && (
                  <div className="pt-4 border-t">
                    <p className="text-gray-500 mb-2 text-sm">Uploaded File</p>
                    <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-[#076e32] hover:underline">
                      <FileText className="w-4 h-4" />
                      <span>{formData.originalFileName}</span>
                      <Badge variant="outline" className="ml-auto">{ (parseFloat(formData.fileSize) / (1024 * 1024)).toFixed(2) } MB</Badge>
                    </a>
                  </div>
                )}
                
                {formData.additionalNotes && (
                  <div className="pt-4 border-t">
                    <p className="text-gray-500 mb-1 text-sm">Special Instructions</p>
                    <p className="text-sm text-gray-700">{formData.additionalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Turnaround Selection */}
            <Card className="border border-gray-200">
          <CardHeader>
                <CardTitle className="text-lg font-semibold">Choose Your Turnaround Time</CardTitle>
                <CardDescription className="text-sm">When would you like to receive your digital scanned copy?</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={turnaround} onValueChange={(value) => { setTurnaround(value); setSelectedDelivery(value); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Label htmlFor="standard" className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    turnaround === "STANDARD" 
                      ? "border-[#076e32] bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                <RadioGroupItem value="STANDARD" id="standard" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                      <MapPin className={`h-6 w-6 ${turnaround === "STANDARD" ? "text-[#076e32]" : "text-gray-400"}`} />
                      <CheckCircle className={`h-5 w-5 ${turnaround === "STANDARD" ? "text-[#076e32]" : "text-gray-300"}`} />
                </div>
                    <span className="block w-full text-center font-semibold mb-1 text-gray-900">Standard</span>
                    <span className="block w-full text-center text-xs text-gray-500">Multiplier: x {pricingSettings.standardMultiplier} • 3 business days</span>
              </Label>
              <Label htmlFor="next-day" className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    turnaround === "NEXT_DAY" 
                      ? "border-[#076e32] bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                <RadioGroupItem value="NEXT_DAY" id="next-day" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                      <CalendarDays className={`h-6 w-6 ${turnaround === "NEXT_DAY" ? "text-[#076e32]" : "text-gray-400"}`} />
                      <CheckCircle className={`h-5 w-5 ${turnaround === "NEXT_DAY" ? "text-[#076e32]" : "text-gray-300"}`} />
                </div>
                    <span className="block w-full text-center font-semibold mb-1 text-gray-900">Next Day</span>
                    <span className="block w-full text-center text-xs text-gray-500">Multiplier: x {pricingSettings.nextDayMultiplier} • Before 18:00 AST</span>
              </Label>
                  <Label htmlFor="same-day" className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    turnaround === "SAME_DAY" 
                      ? "border-[#076e32] bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                <RadioGroupItem value="SAME_DAY" id="same-day" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                      <Clock className={`h-6 w-6 ${turnaround === "SAME_DAY" ? "text-[#076e32]" : "text-gray-400"}`} />
                      <CheckCircle className={`h-5 w-5 ${turnaround === "SAME_DAY" ? "text-[#076e32]" : "text-gray-300"}`} />
                </div>
                    <span className="block w-full text-center font-semibold mb-1 text-gray-900">Same Day</span>
                    <span className="block w-full text-center text-xs text-gray-500">Multiplier: x {pricingSettings.sameDayMultiplier} • Before 12:00 AST</span>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

            {/* Hard Copy Delivery - Display and Edit */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Hard Copy Delivery
                </CardTitle>
                <CardDescription className="text-sm">
                  {hardCopyDelivery 
                    ? "Review or update your hard copy delivery details" 
                    : "Add hard copy delivery if needed"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hard-copy-toggle" className="text-sm font-medium cursor-pointer">
                      Add Hard Copy Delivery
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      We will ship the stamped original paper version to your address.
                    </p>
                  </div>
                  <Switch
                    id="hard-copy-toggle"
                    checked={hardCopyDelivery}
                    onCheckedChange={setHardCopyDelivery}
                  />
                </div>
                
                {hardCopyDelivery && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-sm font-medium">STREET ADDRESS / BUILDING *</Label>
                        <Input
                          id="street"
                          placeholder="Building No, Street Name, District..."
                          value={deliveryAddress.street}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                          required={hardCopyDelivery}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">CITY *</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          required={hardCopyDelivery}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium">POSTAL CODE *</Label>
                        <Input
                          id="postalCode"
                          placeholder="Postal Code"
                          value={deliveryAddress.postalCode}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                          required={hardCopyDelivery}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">COUNTRY *</Label>
                        <Input
                          id="country"
                          placeholder="Country"
                          value={deliveryAddress.country}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                          required={hardCopyDelivery}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deliveryInstructions" className="text-sm font-medium">DELIVERY INSTRUCTIONS (OPTIONAL)</Label>
                        <Textarea
                          id="deliveryInstructions"
                          placeholder="Additional delivery instructions, landmarks, or special notes..."
                          value={deliveryAddress.deliveryInstructions}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryInstructions: e.target.value })}
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 pt-2 border-t">
                      Digital PDF is always included for free. Hard copy preparation fee: {pricingSettings.hardCopyFee} SAR
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Price Summary & Payment */}
          <div className="lg:col-span-1" suppressHydrationWarning>
            <Card className="border border-gray-200 sticky top-4" suppressHydrationWarning>
          <CardHeader>
                <div className="flex items-center justify-between" suppressHydrationWarning>
                  <CardTitle className="text-lg font-semibold">Total (SAR)</CardTitle>
                  <Separator className="flex-1 mx-2" />
                </div>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="space-y-3" suppressHydrationWarning>
                  {/* Price Breakdown */}
                  <div className="flex justify-between text-sm" suppressHydrationWarning>
                    <span className="text-gray-600">Number of Pages:</span>
                    <span className="font-medium">{formData.numPages} {parseInt(formData.numPages) === 1 ? 'Page' : 'Pages'}</span>
                  </div>
                  <div className="flex justify-between text-sm" suppressHydrationWarning>
                    <span className="text-gray-600">Base Price (per page):</span>
                    <span className="font-medium">SAR {
                      serviceLevel === "SWORN" 
                        ? pricingSettings.swornPricePerPage.toFixed(2)
                        : pricingSettings.standardCertifiedPricePerPage.toFixed(2)
                    }</span>
                  </div>
                  <div className="flex justify-between text-sm" suppressHydrationWarning>
                    <span className="text-gray-600">Price per Page:</span>
                    <span className="font-medium">SAR {
                      serviceLevel === "SWORN" 
                        ? pricingSettings.swornPricePerPage.toFixed(2)
                        : pricingSettings.standardCertifiedPricePerPage.toFixed(2)
                    }</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2" suppressHydrationWarning>
                    <span className="text-gray-600">Subtotal ({formData.numPages} × {
                      serviceLevel === "SWORN" 
                        ? pricingSettings.swornPricePerPage.toFixed(2)
                        : pricingSettings.standardCertifiedPricePerPage.toFixed(2)
                    }):</span>
                    <span className="font-medium">SAR {(
                      parseInt(formData.numPages) * (serviceLevel === "SWORN" 
                        ? pricingSettings.swornPricePerPage 
                        : pricingSettings.standardCertifiedPricePerPage)
                    ).toFixed(2)}</span>
                  </div>
                  {turnaround !== "STANDARD" && (
                    <div className="flex justify-between text-sm text-green-600" suppressHydrationWarning>
                      <span className="text-gray-600">
                        {turnaround === "NEXT_DAY" ? "Next Day" : "Same Day"} Speed Multiplier:
                      </span>
                      <span className="font-medium">x {
                        turnaround === "NEXT_DAY" 
                          ? pricingSettings.nextDayMultiplier 
                          : pricingSettings.sameDayMultiplier
                      }</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-green-600 border-t pt-2" suppressHydrationWarning>
                    <span>Translation Cost:</span>
                    <span>SAR {(
                      parseInt(formData.numPages) * (serviceLevel === "SWORN" 
                        ? pricingSettings.swornPricePerPage 
                        : pricingSettings.standardCertifiedPricePerPage) * 
                      (turnaround === "NEXT_DAY" ? pricingSettings.nextDayMultiplier :
                       turnaround === "SAME_DAY" ? pricingSettings.sameDayMultiplier :
                       pricingSettings.standardMultiplier)
                    ).toFixed(2)}</span>
                  </div>
                  {hardCopyDelivery && (
                    <div className="flex justify-between text-sm" suppressHydrationWarning>
                      <span className="text-gray-600">Hard Copy Preparation:</span>
                      <span className="font-medium">+ SAR {pricingSettings.hardCopyFee.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm text-green-600" suppressHydrationWarning>
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          Coupon ({appliedCoupon.code})
                        </span>
                        <span className="font-medium">- {appliedCoupon.discountAmount.toFixed(2)} SAR</span>
                      </div>
                    </>
                  )}
            <Separator />
                  <div className="flex justify-between items-baseline" suppressHydrationWarning>
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{finalPrice.toFixed(2)} SAR</span>
                  </div>
                </div>
                
                {/* Coupon Code Input */}
                <div className="space-y-2 pt-2 border-t" suppressHydrationWarning>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md" suppressHydrationWarning>
                      <div className="flex items-center gap-2" suppressHydrationWarning>
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Coupon Applied: {appliedCoupon.code}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2" suppressHydrationWarning>
                      <Label htmlFor="couponCode" className="text-sm font-medium">Have a coupon code?</Label>
                      <div className="flex gap-2" suppressHydrationWarning>
                        <Input
                          id="couponCode"
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && couponCode.trim() && priceBeforeDiscount > 0) {
                              validateCoupon(couponCode, priceBeforeDiscount);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => validateCoupon(couponCode, priceBeforeDiscount)}
                          disabled={isValidatingCoupon || !couponCode.trim() || priceBeforeDiscount === 0}
                          className="whitespace-nowrap"
                        >
                          {isValidatingCoupon ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 pt-2 border-t">
                  Prices exclude VAT. Cut-offs: Same-Day 12:00 AST • Next-Day 18:00 AST • 1 page = 250 words.
                </p>
                
                {/* Payment Methods */}
                <div className="flex flex-col gap-2 pt-4 border-t" suppressHydrationWarning>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  >
                    MADA
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  >
                    APPLE PAY
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  >
                    STC PAY
                  </Button>
            </div>
                
                <Button
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="w-full bg-[#076e32] hover:bg-[#065a2a] text-white mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Proceed to Secure Payment'
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center pt-2">
                  By proceeding, you agree to our <a href="#" className="underline">Terms & SLA</a>
                </p>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <ReviewOrderContent />
    </Suspense>
  );
}
