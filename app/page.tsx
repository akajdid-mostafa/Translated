import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DocumentUploadFormWrapper } from "@/components/document-upload-form-wrapper"
import { FAQSection } from "@/components/faq-section"
import { ServicesSection } from "@/components/services-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <Header />
      <HeroSection />
      <DocumentUploadFormWrapper />
      <FAQSection />
      <ServicesSection />
      {/* <Footer /> */}
    </div>
  )
}
