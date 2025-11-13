import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, Award, Users, Zap, Globe } from "lucide-react"

export function ServicesSection() {
  return (
    <section id="services" className="py-16 bg-gray-50" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        {/* Main Title */}
        <div className="text-center mb-16" suppressHydrationWarning>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Fast, Accurate & Certified Legal Translation Services in the UAE
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Whether you're an individual, a business, or a government entity, we have the right solution for you. Our
            expert translators are certified and experienced in handling all types of legal documents.
          </p>
        </div>

        {/* Service Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16" suppressHydrationWarning>
          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal & Certified</h3>
              <p className="text-gray-600 text-sm">Officially recognized translations for all legal purposes</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Linguists</h3>
              <p className="text-gray-600 text-sm">Native speakers with legal translation expertise</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Turnaround</h3>
              <p className="text-gray-600 text-sm">Receive your documents within the same working day</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Confidential</h3>
              <p className="text-gray-600 text-sm">We prioritize the security of your personal documents</p>
            </CardContent>
          </Card>
        </div>

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

        {/* Statistics */}
        <div className="bg-white rounded-2xl p-8 shadow-sm" suppressHydrationWarning>
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Achievements at a Glance</h3>

          <div className="grid md:grid-cols-3 gap-8 text-center" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>10,240+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>

            <div suppressHydrationWarning>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>1600+</div>
              <p className="text-gray-600">Happy Clients</p>
            </div>

            <div suppressHydrationWarning>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>30+</div>
              <p className="text-gray-600">Native Languages</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
