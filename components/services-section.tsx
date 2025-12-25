import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, BookOpen, Clock, Lock, Upload, Calculator, Shield, FileText, Handshake } from "lucide-react"

export function ServicesSection() {
  return (
    <>
      <section id="services" className="py-16 bg-white" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          {/* Service Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20" suppressHydrationWarning>
            <Card className="text-left border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4" suppressHydrationWarning> 
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" suppressHydrationWarning>
                    <CheckCircle2 className="w-8 h-8 text-[#076e32]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 ">Legal & Certified</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">Officially recognized translations for government, courts, universities, and employers.</p>
              </CardContent>
            </Card>

            <Card className="text-left border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4" suppressHydrationWarning> 
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" suppressHydrationWarning>
                    <BookOpen className="w-8 h-8 text-[#076e32]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 ">Expert Linguists</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">Native translators with legal specialization and double review for quality.</p>
              </CardContent>
            </Card>

            <Card className="text-left border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4" suppressHydrationWarning> 
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" suppressHydrationWarning>
                    <Clock className="w-8 h-8 text-[#076e32]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 ">Fast Turnaround</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">Same-Day & Next-Day options with clear cut-offs and guaranteed SLAs.</p>
              </CardContent>
            </Card>

            <Card className="text-left border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4" suppressHydrationWarning>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" suppressHydrationWarning>
                    <Lock className="w-8 h-8 text-[#076e32]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Secure & Private</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">Secure uploads, strict confidentiality, and data purge policies.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section id="how" className="py-20 bg-white border-y border-slate-200" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="text-center mb-16" suppressHydrationWarning>
          <h2 className="text-3xl font-bold text-slate-800">How It Works</h2>
          <p className="text-slate-600 mt-2">Get your translation in 4 simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8" suppressHydrationWarning>
          {/* Step 1: Upload */}
          <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center cursor-default" suppressHydrationWarning>
            <div className="w-20 h-20 mx-auto mb-6 bg-[#076E32] text-white rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-green-200" suppressHydrationWarning>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 74.46 74.46" suppressHydrationWarning>
                <path d="M4.26,43.42c.29-1.11.46-2.27.89-3.33,1.62-4.05,4.61-6.57,8.86-7.57.5-.12.64-.32.69-.8,1.01-8.16,5.16-14.18,12.45-17.98,3.48-1.81,7.24-2.55,11.14-2.36,4.8.24,9.13,1.85,12.92,4.83,3.85,3.03,6.44,6.9,7.78,11.61.15.52.41.75.92.9,6.9,1.98,11.32,9.05,10.1,16.1-1.04,5.99-5.27,10.43-11.22,11.79-.5.11-1.02.22-1.52.23-3.2.02-6.39.01-9.64.01v-4.03c.25,0,.47,0,.7,0,2.43,0,4.85,0,7.28,0,5.17-.02,9.28-3.39,10.3-8.44,1.08-5.36-2.61-10.93-7.99-11.9-1.52-.28-2.25-1.03-2.64-2.52-2.01-7.63-6.96-12.32-14.65-13.93-7.34-1.54-15.19,2.05-19.09,8.46-1.67,2.75-2.62,5.71-2.74,8.93,0,.24-.03.47-.05.71-.13,1.48-.83,2.13-2.3,2.21-3.03.16-5.37,1.53-6.9,4.16-3.09,5.28.68,12.12,6.79,12.29,3.26.09,6.53.02,9.79.03.25,0,.51,0,.81,0v4.12h-.64c-3.11,0-6.23,0-9.34,0-6.33-.01-11.22-4.01-12.48-10.21-.07-.33-.13-.66-.2-.99,0-.77,0-1.55,0-2.32Z"/>
                <path d="M39.35,63.1h-4.12v-19.64c-1.59,1.63-3.1,3.16-4.58,4.67-1.09-1.09-2.05-2.04-3.03-3.02,1.32-1.32,2.67-2.66,4.02-4.01,1.32-1.32,2.64-2.64,3.96-3.96,1.09-1.08,2.23-1.09,3.31,0,2.57,2.56,5.13,5.13,7.69,7.69.1.1.2.22.26.29-.96.95-1.9,1.89-2.87,2.86-1.46-1.47-2.98-3-4.49-4.53-.05.03-.11.06-.16.08v19.57Z"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">1 · Upload</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Upload file(s), choose languages, and select your turnaround speed.</p>
          </div>

          {/* Step 2: Instant Price */}
          <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center cursor-default" suppressHydrationWarning>
            <div className="w-20 h-20 mx-auto mb-6 bg-[#076E32] text-white rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-green-200" suppressHydrationWarning>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 74.46 74.46" suppressHydrationWarning>
                <path d="M59.82,42.82c-.43,1.48-.81,2.98-1.3,4.44-.11.33-.55.7-.9.78-5.2,1.14-10.41,2.24-15.62,3.35-.17.04-.35.04-.66.07v-10.77c-1.86.4-3.57.76-5.38,1.15,0,1.66-.06,3.3.02,4.93.06,1.33-.28,2.46-1.08,3.51-.73.95-1.35,1.99-2.02,2.98-.72,1.06-1.67,1.8-2.94,2.07-4.83,1.04-9.67,2.08-14.5,3.11-.16.03-.33,0-.79,0,.55-1.83,1.05-3.56,1.61-5.26.07-.22.48-.4.76-.47,4.23-.91,8.47-1.82,12.71-2.68.78-.16,1.03-.46,1-1.26-.07-1.9-.02-3.8-.02-5.82-4.47.95-8.84,1.87-13.5,2.86.4-1.55.78-2.94,1.1-4.34.24-1.03.78-1.5,1.87-1.7,3.25-.6,6.47-1.37,9.71-2.02.66-.13.84-.39.84-1.03-.02-6.45-.03-12.9.01-19.36,0-.52.26-1.14.59-1.54,1.25-1.48,2.75-2.68,4.62-3.72v24.34c1.8-.39,3.45-.71,5.09-1.13.16-.04.28-.58.28-.9.02-4.78.03-9.56,0-14.34,0-.74.22-1.27.72-1.78,1.31-1.35,2.72-2.56,4.53-3.56v19.44c4.52-.95,8.89-1.87,13.26-2.79v.53c-.36,1.35-.74,2.7-1.09,4.05-.22.87-.76,1.23-1.63,1.4-3.29.65-6.57,1.37-9.85,2.09-.24.05-.63.27-.63.41-.05,1.68-.03,3.37-.03,5.15,2.55-.54,4.98-1.07,7.4-1.57,1.94-.4,3.89-.77,5.83-1.15v.53Z"/>
                <path d="M59.82,53.55c-.42,1.49-.84,2.97-1.24,4.47-.15.55-.49.78-1.04.89-5.35,1.12-10.7,2.26-16.24,3.44.14-.81.23-1.54.39-2.26q.77-3.37,4.05-4.07c4.69-1,9.38-2,14.07-3v.53Z"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">2 · Instant Price</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Our smart engine calculates a transparent per-page price instantly.</p>
          </div>

          {/* Step 3: Pay Securely */}
          <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center cursor-default" suppressHydrationWarning>
            <div className="w-20 h-20 mx-auto mb-6 bg-[#076E32] text-white rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-green-200" suppressHydrationWarning>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 74.46 74.46" suppressHydrationWarning>
                <path d="M6.64,25.14c.34-1.19.89-2.24,2.08-2.76.59-.25,1.26-.45,1.89-.45,6.91-.03,13.82-.02,20.73-.02,1.22,0,2.07.81,2.07,1.92,0,1.11-.86,1.9-2.09,1.9-6.69,0-13.38,0-20.07,0-.24,0-.47,0-.74,0v7.65h.72c6.61,0,13.22,0,19.83,0,.26,0,.52-.01.77.03.92.17,1.59.98,1.57,1.91-.02.95-.73,1.74-1.69,1.86-.24.03-.48.02-.72.02-6.57,0-13.14,0-19.71,0h-.77v22.9h53.48v-.64c0-4.1,0-8.21,0-12.31,0-.26,0-.52.04-.77.19-.95,1.05-1.59,2-1.53.95.07,1.7.82,1.77,1.79.02.2,0,.4,0,.6,0,4.14,0,8.29,0,12.43,0,2.75-1.54,4.3-4.28,4.3-17.38,0-34.77,0-52.15,0-2.82,0-3.75-.63-4.74-3.23V25.14Z"/>
                <path d="M37.23,22.81c0-1.47.02-2.95,0-4.42-.02-1.06.45-1.77,1.43-2.18,4.3-1.83,8.59-3.67,12.88-5.52.69-.3,1.33-.28,2.01,0,4.27,1.84,8.54,3.68,12.82,5.5,1,.42,1.47,1.13,1.46,2.22-.02,2.77.02,5.54-.03,8.3-.06,3.53-.64,6.96-2.19,10.18-1.35,2.79-3.26,5.16-5.68,7.06-2,1.57-4.16,2.92-6.26,4.36-.7.48-1.45.49-2.2.06-3.17-1.86-6.19-3.92-8.7-6.64-2.9-3.14-4.66-6.83-5.16-11.06-.31-2.6-.36-5.23-.52-7.85.05,0,.1,0,.14,0ZM63.99,24.15c0-1.8-.01-3.07,0-4.35,0-.32-.09-.49-.4-.62-3.57-1.51-7.13-3.05-10.69-4.56-.21-.09-.52-.11-.72-.02-3.61,1.52-7.2,3.07-10.8,4.62-.15.07-.33.31-.32.46.06,3.36.02,6.73.27,10.08.23,3.05,1.38,5.82,3.28,8.26,2.08,2.67,4.77,4.61,7.62,6.34.16.1.51.05.67-.06,1.63-1.14,3.31-2.22,4.84-3.48,2.97-2.46,4.92-5.59,5.71-9.4.54-2.57.56-5.18.53-7.26Z"/>
                <path d="M20.04,44.86c1.21,0,2.43,0,3.64,0,1.22,0,2.07.81,2.07,1.91,0,1.11-.85,1.9-2.08,1.91-2.43,0-4.85,0-7.28,0-1.23,0-2.09-.78-2.1-1.88-.01-1.13.85-1.93,2.11-1.94,1.21,0,2.43,0,3.64,0Z"/>
                <path d="M50.77,30.13c.98-1.22,1.92-2.4,2.86-3.57,1.03-1.29,2.05-2.59,3.1-3.87.5-.62,1.16-.9,1.96-.72.77.18,1.25.67,1.44,1.44.15.6,0,1.15-.39,1.62-2.53,3.17-5.05,6.35-7.61,9.51-.88,1.08-2.31,1.02-3.1-.12-1.3-1.88-2.56-3.79-3.81-5.71-.61-.93-.36-2.05.5-2.63.89-.6,2.01-.39,2.67.54.68.96,1.31,1.95,1.97,2.92.12.18.25.35.41.59Z"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">3 · Pay Securely</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Checkout safely using Mada, Apple Pay, or Credit Card.</p>
          </div>

          {/* Step 4: Receive */}
          <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center cursor-default" suppressHydrationWarning>
            <div className="w-20 h-20 mx-auto mb-6 bg-[#076E32] text-white rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-green-200" suppressHydrationWarning>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 74.46 74.46" suppressHydrationWarning>
                <path d="M66.68,51.72c-.38-.61-.93-.87-1.76-.83-.49.03-.99.02-1.52,0h-.62v-9.22c0-1.21-.42-1.64-1.63-1.65h-2.93v-5.14c0-5.53-.01-11.05.01-16.57,0-.69-.21-1.2-.68-1.67-2.71-2.68-5.48-5.45-8.22-8.22-.47-.47-.98-.68-1.66-.68h-.01c-7.84.01-15.69.01-23.54.01h-6.19c-2.52,0-3.97,1.44-3.97,3.95v8.15h-.67c-.58,0-1.16.01-1.73,0h-.07c-1.05,0-1.9.32-2.59.97-.74.71-1.12,1.56-1.12,2.53-.01,4.44-.02,9.16,0,13.87.01,1.84,1.4,3.34,3.25,3.47.68.05,1.35.04,2.06.03.29,0,.58,0,.87,0v19.74c0,2.47,1.47,3.94,3.92,3.94h5.53c10.27,0,20.53,0,30.8,0,.43,0,.66.12.9.48.29.44.64.86.97,1.26.15.17.29.35.43.52l.03.05h.81l.03-.04c.09-.09.19-.18.28-.27.21-.2.42-.4.58-.65,2.23-3.45,4.48-6.98,6.66-10.38l1.4-2.18c.09-.15.18-.29.26-.44l.14-.23v-.76l-.02-.03ZM53.83,16.7h-1.89c-.53,0-1.05.01-1.58,0-.67-.02-1.07-.41-1.08-1.06-.01-.88-.01-1.79,0-2.67v-.83l4.55,4.56ZM53.1,61.84c-.13.01-.25.02-.37.02H17.9c-1.07,0-1.4-.32-1.4-1.38v-19.74h7.21c.24,0,.48,0,.71-.05.58-.11,1.01-.62,1.01-1.21.01-.62-.45-1.15-1.06-1.24-.24-.04-.47-.04-.71-.04h-11.85c-1.22,0-1.5-.28-1.5-1.51v-12.9c0-1.07.31-1.39,1.38-1.39h34.1c1.1,0,1.41.31,1.41,1.42v12.95c0,1.11-.32,1.43-1.41,1.43h-10.83c-.21,0-.43,0-.64.03-.64.08-1.08.56-1.11,1.19-.02.65.42,1.18,1.08,1.29.18.03.36.03.53.03h1.98c3.03.01,6.06.01,9.08,0,2.38,0,3.86-1.49,3.86-3.89v-13.06c0-2.5-1.44-3.93-3.93-3.93h-29.31v-8.35c.01-.81.39-1.2,1.17-1.2,8.34-.01,16.69-.01,25.03-.01h3.85c.05,0,.09.01.16.02h.02v1.92c0,1.11,0,2.22,0,3.33.01,2.12,1.55,3.66,3.65,3.67,1.24.01,2.47.01,3.71,0h1.53v20.79h-2.78c-1.33,0-1.74.41-1.74,1.72v9.15h-.64c-.58,0-1.13,0-1.68,0-.53,0-1.1.08-1.43.69-.34.61-.07,1.13.21,1.56,1.5,2.34,3,4.67,4.49,7.01l.86,1.33c.06.11.12.21.19.33l.02.03h-.03ZM56.95,63.07l-6.16-9.63h1.39c1.03-.01,1.47-.46,1.47-1.49.01-2.19.01-4.38.01-6.57v-2.77h6.58v9.21c0,1.21.42,1.62,1.64,1.62h1.23l-6.16,9.63Z"/>
                <path d="M33.27,27.85c-.69-2.14-2.26-3.32-4.55-3.4-.84-.02-1.68-.01-2.47,0-.95.02-1.41.49-1.41,1.44-.01,1-.01,2-.01,3l.02,2.56v3.21c0,1.01.48,1.49,1.48,1.49h.37c.72,0,1.45-.01,2.16-.03,1.69-.06,2.99-.84,3.86-2.31,1.07-1.78,1.25-3.79.55-5.96ZM27.41,33.59v-6.52c1.14-.2,1.99-.09,2.59.33.56.4.91,1.07,1.06,2.05.15.99.05,1.87-.3,2.68-.43.98-1.12,1.46-2.11,1.46h-1.24Z"/>
                <path d="M19.75,24.48c-.82-.05-1.65-.04-2.46-.03h-.29c-.99.01-1.44.48-1.45,1.47,0,2.92,0,5.84.01,8.76,0,.19.01.44.09.66.17.49.63.8,1.15.8.08,0,.15-.01.22-.02.64-.1,1.05-.59,1.07-1.29.01-.63.01-1.24.01-1.89-.01-.24-.01-.48-.01-.73.2-.01.39-.01.57-.02.48-.02.93-.04,1.38-.11,1.92-.28,3.3-2,3.22-3.98-.07-1.9-1.61-3.49-3.51-3.62ZM18.55,29.64c-.14,0-.27,0-.41.01v-2.64h.38c.36-.01.69-.02,1.02.01.63.06,1.14.57,1.18,1.19.05.66-.41,1.24-1.06,1.35-.35.06-.72.07-1.11.08Z"/>
                <path d="M41.67,30.21c0,.75-.57,1.27-1.42,1.28-.46.01-.92.01-1.4.01h-.57s0,3.24,0,3.24c-.01.74-.42,1.26-1.07,1.35-.07.01-.14.02-.21.02-.31,0-.61-.11-.84-.3-.26-.23-.41-.56-.41-.93-.02-2.85-.02-5.84,0-9.15,0-.72.52-1.23,1.26-1.24,1.17-.01,2.37-.01,3.66,0,.74.01,1.26.51,1.28,1.22.02.73-.5,1.28-1.25,1.31-.57.02-1.13.01-1.72.01-.22,0-.44-.01-.66-.01v1.93h1.93c.85.01,1.42.52,1.42,1.26Z"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-3">4 · Receive</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Receive your digital PDF by email. Add a hard copy if you need the stamped original.</p>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
