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
}

function ReviewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("STANDARD"); // Default to Standard
  const [finalPrice, setFinalPrice] = useState(0);
  const [hardCopyDelivery, setHardCopyDelivery] = useState(false);
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

  const calculatePrice = (numPages: string, deliveryType: string, includeHardCopy: boolean = false) => {
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
    const hardCopyFee = includeHardCopy ? 50 : 0; // 50 DH for hard copy delivery
    
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
      // Set initial price based on mapped delivery option
      setFinalPrice(calculatePrice(parsedData.numPages, mappedDelivery));
    } else {
      // Redirect back if no data is present
      router.push('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (formData) {
      setFinalPrice(calculatePrice(formData.numPages, selectedDelivery, hardCopyDelivery));
    }
  }, [selectedDelivery, formData, hardCopyDelivery]);

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Review Your Order</h1>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <p className="text-gray-600">Double-check your details before placing the order.</p>

        {/* Order Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Details</CardTitle>
            <Button variant="ghost" size="sm">Edit</Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Source Language: <strong>{formData.sourceLanguage}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Target Language: <strong>{formData.targetLanguage}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Document Type: <strong>{formData.documentType}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Number of Pages: <strong>{formData.numPages}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Full Name: <strong>{formData.firstName} {formData.lastName}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Email: <strong>{formData.customerEmail}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary"><CheckCircle className="w-3 h-3" /></Badge>
              <span>Phone Number: <strong>{formData.customerPhone}</strong></span>
            </div>
            {formData.additionalNotes && (
              <div className="flex items-start space-x-2 lg:col-span-3">
                <Badge variant="secondary"><CheckCircle className="w-3 h-3 mt-1" /></Badge>
                <span>Special Instructions: <strong>{formData.additionalNotes}</strong></span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.originalFileName && formData.fileUrl && (
              <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">{formData.originalFileName}</span>
                <Badge variant="secondary">{ (parseFloat(formData.fileSize) / (1024 * 1024)).toFixed(2) } MB</Badge>
              </a>
            )}
            {!formData.originalFileName && <p className="text-gray-500">No file uploaded.</p>}
          </CardContent>
        </Card>

        {/* Choose Your Delivery Time */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Delivery Time</CardTitle>
            <CardDescription>When would you like to receive your digital scanned copy?</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Label htmlFor="same-day" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="SAME_DAY" id="same-day" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                  <Clock className="h-6 w-6" />
                  <CheckCircle className={`h-5 w-5 ${selectedDelivery === "SAME_DAY" ? "text-primary" : "text-gray-300"}`} />
                </div>
                <span className="block w-full text-center font-semibold mb-1">Same Day</span>
                <span className="block w-full text-center text-sm text-gray-500">DH 550/page • Available for orders placed before 13:00 UAE Time (GST). Not available on Sundays.</span>
              </Label>

              <Label htmlFor="next-day" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="NEXT_DAY" id="next-day" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                  <CalendarDays className="h-6 w-6" />
                  <CheckCircle className={`h-5 w-5 ${selectedDelivery === "NEXT_DAY" ? "text-primary" : "text-gray-300"}`} />
                </div>
                <span className="block w-full text-center font-semibold mb-1">Next Day</span>
                <span className="block w-full text-center text-sm text-gray-500">DH 450/page • Available for orders placed before 18:00 UAE Time (GST). Not available on Saturdays.</span>
              </Label>

              <Label htmlFor="standard" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="STANDARD" id="standard" className="sr-only" />
                <div className="flex items-center justify-between w-full mb-3">
                  <MapPin className="h-6 w-6" />
                  <CheckCircle className={`h-5 w-5 ${selectedDelivery === "STANDARD" ? "text-primary" : "text-gray-300"}`} />
                </div>
                <span className="block w-full text-center font-semibold mb-1">Standard</span>
                <span className="block w-full text-center text-sm text-gray-500">DH 350/page • 3 business days delivery</span>
              </Label>
            </RadioGroup>
            
            {selectedDelivery === "SAME_DAY" && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                <p className="font-semibold">In a Hurry? We've Got You Covered</p>
                <p>Urgent translations (within 1-4 hours) are possible based on the complexity of the document and the number of pages. <a href="#" className="underline">Contact us to learn more.</a></p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hard Copy Delivery (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Hard Copy Delivery
            </CardTitle>
            <CardDescription>Receive a professionally printed and stamped copy of your translation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hard-copy-toggle" className="text-base font-medium">
                Request Hard Copy Delivery
              </Label>
              <Switch
                id="hard-copy-toggle"
                checked={hardCopyDelivery}
                onCheckedChange={setHardCopyDelivery}
              />
            </div>
            
            {hardCopyDelivery && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      required={hardCopyDelivery}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        required={hardCopyDelivery}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        placeholder="Enter postal code"
                        value={deliveryAddress.postalCode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                        required={hardCopyDelivery}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      value={deliveryAddress.country}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                      required={hardCopyDelivery}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="deliveryInstructions"
                      placeholder="Any special delivery instructions (e.g., building name, floor, contact person)"
                      value={deliveryAddress.deliveryInstructions}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryInstructions: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-100 rounded-md text-sm text-blue-800">
                  <p className="font-semibold">Hard Copy Delivery Fee: 50 DH</p>
                  <p className="text-xs mt-1">This fee covers printing, stamping, and delivery of your certified translation.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Price Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Translation Price ({formData.numPages} pages x {calculatePrice("1", selectedDelivery, false)} DH per page):</span>
              <span>{calculatePrice(formData.numPages, selectedDelivery, false)} DH</span>
            </div>
            {hardCopyDelivery && (
              <div className="flex justify-between text-sm">
                <span>Hard Copy Delivery Fee:</span>
                <span>50 DH</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Price:</span>
              <span>{finalPrice} DH</span>
            </div>
            <p className="text-xs text-gray-500">* Prices do not include 5% VAT.</p>
            <p className="text-xs text-gray-500">* By proceeding to pay, you agree to our <a href="#" className="underline">Terms of Use</a> & <a href="#" className="underline">Privacy Policy</a>.</p>
          </CardContent>
        </Card>

        {/* Proceed to Payment Button */}
        <div className="text-right">
          <Button size="lg" onClick={handleConfirmOrder}>
            Proceed to Payment
          </Button>
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
