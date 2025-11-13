"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle } from "lucide-react"

export function FAQSection() {
  return (
    <section id="faq" className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="text-center mb-12" suppressHydrationWarning>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Find answers to common questions about our translation services</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="what-is-translated" className="border border-gray-200 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              What is Translated.ae?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Translated.ae is the UAE's leading online certified translation service. We provide fast, accurate, and
              legally recognized translations for all your official documents, delivered the same day.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-does-work" className="border border-gray-200 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              How does Translated.ae work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Simply upload your documents, select your languages, fill in your details, and pay online. Our certified
              translators will process your documents and deliver your certified translation the same day via email.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="languages-supported" className="border border-gray-200 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              Which languages do you support?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              We support translation between Arabic, English, French, German, Spanish, Italian, Chinese, Russian, and
              many other languages. Our certified translators are native speakers with expertise in legal and official
              document translation.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="document-types" className="border border-gray-200 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              What types of documents do you translate?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              We translate all types of official documents including passports, birth certificates, marriage
              certificates, academic transcripts, diplomas, contracts, legal documents, and more. All translations are
              certified and legally recognized in the UAE.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="page-count" className="border border-gray-200 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              How do you determine the page count?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Each side of a document counts as one page. For example, a passport with information on both sides of a
              page would count as 2 pages. We use advanced OCR technology to accurately count and process your
              documents.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Contact CTA */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-[#076e32] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Have more questions?</h3>
            <p className="text-gray-600 mb-6">Check out FAQ or contact us on WhatsApp</p>
            <Button className="bg-[#076e32] hover:bg-[#065a2a] text-white border-0">Contact Us</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
