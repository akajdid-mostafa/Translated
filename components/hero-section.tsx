"use client";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-r from-[#076e32] via-[#0a8a42] to-[#10b954]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#212A37] to-[#044d22] opacity-95"></div>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="text-center mb-8" suppressHydrationWarning>
          <div className="mb-6 inline-block" suppressHydrationWarning>
            <Badge variant="secondary" className="bg-green-100 text-[#076e32] border-0 px-4 py-1.5 text-sm font-medium rounded-full">
              • 100% ONLINE - KSA
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance leading-tight">
            Same-Day <span className="text-[#a8f5c8]">Legal & Sworn Translation</span><br />in Saudi Arabia
          </h1>

          <p className="text-base md:text-lg text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your document, get a transparent price per page, pay securely, and receive your certified or sworn translation. 
            You always receive a <strong>digital PDF</strong> by default. Add a <strong>hard copy</strong> if needed, with standard or express delivery across KSA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" suppressHydrationWarning>
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 border-0 px-8 py-6 text-lg font-semibold shadow-lg"
              onClick={() => {
                document.getElementById('file-upload')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Upload now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-[#10b954] text-white hover:bg-[#0ea048] border-0 px-8 py-6 text-lg font-semibold shadow-lg"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it works
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
