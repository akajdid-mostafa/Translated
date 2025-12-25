import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, BookOpen, Clock, Lock, Upload, Calculator, Shield, FileText, Handshake } from "lucide-react"

export function ServicesSection2() {
  return (
    <>
  <section className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>

        {/* Language Support */}
        <div className="text-center mb-12" suppressHydrationWarning>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            We provide translations in a wide range of languages, including:
          </h3>

          <div className="relative overflow-hidden mb-8" suppressHydrationWarning>
            <div className="flex animate-scroll gap-3 whitespace-nowrap" suppressHydrationWarning>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇦🇪 Arabic
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇬🇧 English
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇫🇷 French
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇩🇪 German
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇪🇸 Spanish
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇮🇹 Italian
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇨🇳 Chinese (Mandarin)
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇷🇺 Russian
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇯🇵 Japanese
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇰🇷 Korean
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇵🇹 Portuguese
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇳🇱 Dutch
              </Badge>
              {/* Duplicate badges for seamless loop */}
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇦🇪 Arabic
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇬🇧 English
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇫🇷 French
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇩🇪 German
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇪🇸 Spanish
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm flex-shrink-0">
                🇮🇹 Italian
              </Badge>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            We offer certified translations in more languages — contact us for special requests.
          </p>

          <Button className="bg-[#076e32] hover:bg-[#065a2a] text-white border-0">Contact Us</Button>
        </div>

        {/* Our Achievements at a Glance */}
        <div className="mb-12" suppressHydrationWarning>
          <div className="flex items-center gap-2 justify-center mb-4" suppressHydrationWarning>
            <Handshake className="w-6 h-6 text-[#076e32]" />
            <h3 className="text-2xl font-bold text-gray-900">Our Achievements at a Glance</h3>
          </div>
          <p className="text-center text-gray-600 mb-8">
            Trusted across KSA for fast, accurate and officially recognized translations.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6" suppressHydrationWarning>
            <Card className="text-center border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                  <FileText className="w-8 h-8 text-[#076e32]" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>24,000+</div>
                <p className="text-gray-600">Certified Documents Delivered</p>
              </CardContent>
            </Card>

            <Card className="text-center border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                  <Handshake className="w-8 h-8 text-[#076e32]" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>3,200+</div>
                <p className="text-gray-600">Happy Clients Across KSA</p>
              </CardContent>
            </Card>

            <Card className="text-center border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                  <BookOpen className="w-8 h-8 text-[#076e32]" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>60+</div>
                <p className="text-gray-600">Sworn & Native Linguists</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-gray-700" suppressHydrationWarning>
            <p className="text-sm">
              <strong>98.7% On-Time Delivery</strong> • <strong>Confidential & Secure</strong> • <strong>Transparent Pricing (1 page = 250 words)</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
