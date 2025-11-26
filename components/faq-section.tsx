"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  return (
    <section id="faq" className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center mb-12" suppressHydrationWarning>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            FAQ — Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about certified & sworn translations.
          </p>
        </div>

        {/* FAQ Items */}
        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem 
            value="page-count-pricing" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  How do you count pages and calculate the price?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                We use the convention <strong>1 page = 250 words</strong>. If your text exceeds 250 words, it is rounded up to the next page. The total price is based on pages × selected turnaround, plus any add-ons (Sworn, Hard copy, Delivery).
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="file-types" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  What file types can I upload?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                We accept <strong>PDF</strong>, <strong>DOC/DOCX</strong>, and <strong>TXT</strong>. For scans or photos, please convert them into a clear PDF. Each file must be legible and within the maximum size allowed (25MB).
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="page-limit" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Is there a page limit online?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Yes. The instant checkout supports up to <strong>10 pages</strong> (approx 2500 words). If you have more pages, please contact us via <strong>WhatsApp</strong> or <strong>Email</strong> for a tailored quote and timeline.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="languages-supported" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Which languages do you support?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Common pairs include Arabic, English, French, German, Spanish, Italian, Russian, Chinese (Mandarin), Portuguese, Turkish, Korean, Hindi, and Dutch. If your language isn't listed in the form, message us and we'll arrange it.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="certified-vs-sworn" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  What is the difference between Certified and Sworn translation?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                <strong>Certified</strong> translations include our translator's certification and the HalaTranslate seal, suitable for many official purposes. <strong>Sworn</strong> translations are for cases where authorities/courts explicitly require a sworn/official translator. Select <em>Sworn</em> in the form if needed.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="hard-copy" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Do I get a hard copy?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                You always receive a <strong>digital PDF</strong> by default. If you need a stamped paper version, tick <strong>Hard copy</strong> and choose <strong>Standard</strong> or <strong>Express</strong> delivery at checkout.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="turnaround-cutoffs" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  What are the turnaround cut-offs?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                <strong>Same-Day</strong> for orders placed before <strong>12:00 AST</strong>. <strong>Next-Day</strong> for orders placed before <strong>18:00 AST</strong>. After the cut-off, your order rolls to the next window. Large/complex files may require extra time.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="price-includes" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  What does the price include?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                The total covers translation per page (based on your selected turnaround). Optional add-ons: <em>Sworn</em>, <em>Hard copy</em>, and <em>Delivery</em> (Standard/Express). VAT is excluded unless shown at checkout.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="corrections" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Can I request corrections?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Yes—<strong>minor edits</strong> are included within <strong>48 hours</strong> after delivery for the same content (typos, formatting, transliteration clarifications). Substantive changes or new content may incur extra fees.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="data-security" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Is my data secure?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                We maintain strict confidentiality and limit access to your documents to the people handling your order. NDAs are available on request. We also follow data minimization practices.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="payment-methods" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Which payment methods do you support?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                We support <strong>Mada</strong>, <strong>Apple Pay</strong>, and <strong>STC Pay</strong>. Payments are processed through a secure, hosted checkout.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="hard-copy-delivery" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  How long does Hard copy delivery take?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                <strong>Standard</strong> typically arrives in a few business days depending on your city/region. <strong>Express</strong> is faster for major cities. You'll receive tracking once shipped.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="authority-acceptance" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Will my translation be accepted by authorities?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Acceptance depends on the receiving institution's policy. If a specific format, sworn translator, or additional steps (e.g., notarization/attestation) are required, tell us before checkout—we'll advise the correct option.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="cancel-refund" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Can I cancel or get a refund?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Orders cannot be cancelled once assigned to a translator. If you need to change or cancel before assignment, contact us immediately—we'll do our best to help.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="names-spellings" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  How should I provide names and spellings?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Use the "Special instructions" field to confirm the exact spelling of names, places, and numbers as they should appear in the target language.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="updates" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  How will I receive updates?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                We'll notify you by <strong>Email</strong> (and WhatsApp if you provide your number). You'll receive the digital PDF by email; Hard copy, if selected, is shipped with tracking.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="company-invoice" 
            className="border-0 bg-slate-100 rounded-xl"
          >
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg.size-4]:hidden [&[data-state=open]>svg:last-child]:rotate-180">
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-2 h-2 rounded-full bg-[#076E32] flex-shrink-0"></div>
                <span className="font-semibold text-slate-800 text-base">
                  Can I get a company invoice?
                </span>
              </div>
              <svg 
                className="w-5 h-5 text-[#076E32] flex-shrink-0 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-slate-600 ml-6">
              <div className="text-sm leading-relaxed">
                Yes. Enter your billing details in the order notes or contact us after checkout and we'll issue a VAT-compliant invoice for your company.
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
