"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, Clock, CalendarDays, ChevronLeft, MapPin, FileText, Package } from 'lucide-react'
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
  urgency: string;
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
  const [hardCopyDeliveryType, setHardCopyDeliveryType] = useState("STANDARD");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
    deliveryInstructions: ''
  });

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

  const calculatePrice = (numPages: string, deliveryType: string, includeHardCopy: boolean = false, hardCopyDeliveryType: string = "STANDARD") => {
    const pages = parseInt(numPages, 10);
    if (isNaN(pages) || pages <= 0) return 0;

    let basePricePerPage = 350; // Standard price per page

    switch (deliveryType) {
      case "SAME_DAY":
        basePricePerPage = 550;
        break;
      case "NEXT_DAY":
        basePricePerPage = 450;
        break;
      case "STANDARD":
      default:
        basePricePerPage = 350;
        break;
    }
    
    const translationPrice = pages * basePricePerPage;
    let hardCopyFee = 0;
    if (includeHardCopy) {
      hardCopyFee = 50; // Base hard copy fee
      if (hardCopyDeliveryType === "EXPRESS") {
        hardCopyFee += 30; // Additional express delivery fee
      }
    }
    
    return translationPrice + hardCopyFee;
  };

  useEffect(() => {
    const data = searchParams.get('formData');
    if (data) {
      const parsedData: FormData = JSON.parse(data);
      setFormData(parsedData);
      // Map urgency to delivery option and set it
      const mappedDelivery = mapUrgencyToDelivery(parsedData.urgency || "STANDARD");
      setSelectedDelivery(mappedDelivery);
      // Set hard copy delivery state if it was selected in the form
      if (parsedData.hardCopy) {
        setHardCopyDelivery(true);
        setHardCopyDeliveryType(parsedData.hardCopyDelivery || "STANDARD");
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
      // Set initial price based on mapped delivery option
      setFinalPrice(calculatePrice(parsedData.numPages, mappedDelivery, parsedData.hardCopy || false));
    } else {
      // Redirect back if no data is present
      router.push('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (formData) {
      setFinalPrice(calculatePrice(formData.numPages, selectedDelivery, hardCopyDelivery, hardCopyDeliveryType));
    }
  }, [selectedDelivery, formData, hardCopyDelivery, hardCopyDeliveryType]);

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

    try {
      // Create FormData for the new organized upload endpoint
      // Pass existing file information instead of re-downloading the file
      const formDataToSend = new FormData();
      formDataToSend.append('customerName', `${formData.firstName} ${formData.lastName}`);
      formDataToSend.append('customerEmail', formData.customerEmail);
      formDataToSend.append('customerPhone', formData.customerPhone);
      
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
      formDataToSend.append('hardCopyDeliveryType', hardCopyDeliveryType);
      formDataToSend.append('sourceLanguage', formData.sourceLanguage);
      formDataToSend.append('targetLanguage', formData.targetLanguage);
      formDataToSend.append('documentType', formData.documentType);
      formDataToSend.append('urgency', selectedDelivery);
      formDataToSend.append('specialization', formData.specialization || '');
      formDataToSend.append('additionalNotes', formData.additionalNotes || '');
      formDataToSend.append('numberOfPages', formData.numPages);
      formDataToSend.append('estimatedPrice', finalPrice.toString()); // Add the calculated final price
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
                        ✓ Selected ({hardCopyDeliveryType === "EXPRESS" ? "Express" : "Standard"} Delivery)
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

            {/* Delivery Time Selection */}
            <Card className="border border-gray-200">
          <CardHeader>
                <CardTitle className="text-lg font-semibold">Choose Your Delivery Time</CardTitle>
                <CardDescription className="text-sm">When would you like to receive your digital scanned copy?</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Label htmlFor="same-day" className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedDelivery === "SAME_DAY" 
                      ? "border-[#076e32] bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                <RadioGroupItem value="SAME_DAY" id="same-day" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                      <Clock className={`h-6 w-6 ${selectedDelivery === "SAME_DAY" ? "text-[#076e32]" : "text-gray-400"}`} />
                      <CheckCircle className={`h-5 w-5 ${selectedDelivery === "SAME_DAY" ? "text-[#076e32]" : "text-gray-300"}`} />
                </div>
                    <span className="block w-full text-center font-semibold mb-1 text-gray-900">Same Day</span>
                    <span className="block w-full text-center text-xs text-gray-500">SAR 550/page • Before 12:00 AST</span>
              </Label>

                  <Label htmlFor="next-day" className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedDelivery === "NEXT_DAY" 
                      ? "border-[#076e32] bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                <RadioGroupItem value="NEXT_DAY" id="next-day" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                      <CalendarDays className={`h-6 w-6 ${selectedDelivery === "NEXT_DAY" ? "text-[#076e32]" : "text-gray-400"}`} />
                      <CheckCircle className={`h-5 w-5 ${selectedDelivery === "NEXT_DAY" ? "text-[#076e32]" : "text-gray-300"}`} />
                </div>
                    <span className="block w-full text-center font-semibold mb-1 text-gray-900">Next Day</span>
                    <span className="block w-full text-center text-xs text-gray-500">SAR 450/page • Before 18:00 AST</span>
              </Label>

                  <Label htmlFor="standard" className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedDelivery === "STANDARD" 
                      ? "border-[#076e32] bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                <RadioGroupItem value="STANDARD" id="standard" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                      <MapPin className={`h-6 w-6 ${selectedDelivery === "STANDARD" ? "text-[#076e32]" : "text-gray-400"}`} />
                      <CheckCircle className={`h-5 w-5 ${selectedDelivery === "STANDARD" ? "text-[#076e32]" : "text-gray-300"}`} />
                </div>
                    <span className="block w-full text-center font-semibold mb-1 text-gray-900">Standard</span>
                    <span className="block w-full text-center text-xs text-gray-500">SAR 350/page • 3 business days</span>
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
                  <Label htmlFor="hard-copy-toggle" className="text-sm font-medium cursor-pointer">
                    Add hard copy (paper)
                  </Label>
                  <Switch
                    id="hard-copy-toggle"
                    checked={hardCopyDelivery}
                    onCheckedChange={setHardCopyDelivery}
                  />
                </div>
                
                {hardCopyDelivery && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <div className="space-y-2" suppressHydrationWarning>
                      <Label htmlFor="hardCopyDeliveryType" className="text-sm font-medium">Delivery Type</Label>
                      <Select
                        value={hardCopyDeliveryType}
                        onValueChange={setHardCopyDeliveryType}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="EXPRESS">Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-sm font-medium">Delivery Address *</Label>
                        <Input
                          id="street"
                          placeholder="Street address"
                          value={deliveryAddress.street}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                          required={hardCopyDelivery}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
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
                          <Input
                            id="postalCode"
                            placeholder="Postal Code"
                            value={deliveryAddress.postalCode}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                            required={hardCopyDelivery}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
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
                        <Label htmlFor="deliveryInstructions" className="text-sm">Delivery Instructions (Optional)</Label>
                        <Textarea
                          id="deliveryInstructions"
                          placeholder="Any special delivery instructions"
                          value={deliveryAddress.deliveryInstructions}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryInstructions: e.target.value })}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 pt-2 border-t">
                      Digital PDF is always included for free. Hard copy fee: 50 SAR
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
                  <div className="flex justify-between text-sm" suppressHydrationWarning>
                    <span className="text-gray-600">Translation ({formData.numPages} pages × {calculatePrice("1", selectedDelivery, false)} SAR):</span>
                    <span className="font-medium">{calculatePrice(formData.numPages, selectedDelivery, false)} SAR</span>
                  </div>
                  {hardCopyDelivery && (
                    <>
                      <div className="flex justify-between text-sm" suppressHydrationWarning>
                        <span className="text-gray-600">Hard Copy:</span>
                        <span className="font-medium">50 SAR</span>
                      </div>
                      {hardCopyDeliveryType === "EXPRESS" && (
                        <div className="flex justify-between text-sm" suppressHydrationWarning>
                          <span className="text-gray-600">Express Delivery:</span>
                          <span className="font-medium">30 SAR</span>
                        </div>
                      )}
                    </>
                  )}
            <Separator />
                  <div className="flex justify-between items-baseline" suppressHydrationWarning>
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{finalPrice} SAR</span>
                  </div>
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
                  className="w-full bg-[#076e32] hover:bg-[#065a2a] text-white mt-4"
                >
                  Proceed to Secure Payment
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
