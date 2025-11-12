"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function TranslationForm() {
  const [sourceLanguage, setSourceLanguage] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [pages, setPages] = useState("")

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document & Translation Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <CardTitle className="text-xl">Document & Translation Details</CardTitle>
                </div>
                <p className="text-gray-600">Tell us about your document and we will provide information if needed.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source-language">Source Language *</Label>
                    <Select value={sourceLanguage} onValueChange={(value) => {
                      setSourceLanguage(value);
                      if (value === targetLanguage) {
                        setTargetLanguage("");
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arabic">Arabic</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="russian">Russian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target-language">Target Language *</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your language" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "arabic", label: "Arabic" },
                          { value: "english", label: "English" },
                          { value: "french", label: "French" },
                          { value: "german", label: "German" },
                          { value: "spanish", label: "Spanish" },
                          { value: "italian", label: "Italian" },
                          { value: "chinese", label: "Chinese" },
                          { value: "russian", label: "Russian" },
                        ].filter((lang) => lang.value !== sourceLanguage)
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Document Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="document-type">Document Type *</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="birth-certificate">Birth Certificate</SelectItem>
                        <SelectItem value="marriage-certificate">Marriage Certificate</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="transcript">Academic Transcript</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pages">Number of Pages *</Label>
                    <Input
                      id="pages"
                      type="number"
                      placeholder="Enter number of pages"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Special Instructions */}
                <div>
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Add any specific requirements or instructions for your translation"
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please include any special requirements or notes for translation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <CardTitle className="text-xl">Customer Details</CardTitle>
                </div>
                <p className="text-gray-600">
                  We will need your details and verify you when your translation is ready.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input id="first-name" placeholder="First Name" />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input id="last-name" placeholder="Last Name" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="Email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" placeholder="e.g. +971xxxxxxxx" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-gray-900">350 AED</div>
                  <p className="text-sm text-gray-600">Service and certified your page starts in the next step</p>

                  <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 py-3 w-full">Continue</Button>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Document Type:</span>
                        <Badge variant="outline">{documentType || "Not selected"}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pages:</span>
                        <Badge variant="outline">{pages || "0"}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">From:</span>
                        <Badge variant="outline">{sourceLanguage || "Not selected"}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">To:</span>
                        <Badge variant="outline">{targetLanguage || "Not selected"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
