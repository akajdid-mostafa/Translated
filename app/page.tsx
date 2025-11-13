import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DocumentUploadForm } from "@/components/document-upload-form"
// import { TranslationForm } from "@/components/translation-form"
import { FAQSection } from "@/components/faq-section"
import { ServicesSection } from "@/components/services-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <Header />
      <HeroSection />
      <DocumentUploadForm />
      {/* <TranslationForm /> */}
      <FAQSection />
      <ServicesSection />
      {/* <Footer /> */}
    </div>
  )
}
