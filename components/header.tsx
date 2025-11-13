"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center justify-between h-16" suppressHydrationWarning>
          {/* Logo */}
          <div className="flex items-center" suppressHydrationWarning>
            <Link href="/" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <Image src="/images/logo.svg" alt="Translated Logo" width={200} height={100} />
              </div>
            </Link>
            
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" suppressHydrationWarning>
            <Link href="/about" className="text-gray-700 hover:text-[#076e32] transition-colors">
              About Us
            </Link>
            <Link href="#services" className="text-gray-700 hover:text-[#076e32] transition-colors">
              Our Services
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-[#076e32] transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4" suppressHydrationWarning>
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent">
              Email us
            </Button>
            <Button className="bg-[#076e32] hover:bg-[#065a2a] text-white border-0">WhatsApp</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
