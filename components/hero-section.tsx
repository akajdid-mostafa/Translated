import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative bg-gray-50 py-20 overflow-hidden">
      {/* Flag decorations */}
      {/* <div className="absolute inset-0 pointer-events-none"> */}
        {/* French flag */}
        {/* <div className="absolute top-20 left-20 w-16 h-12 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded shadow-lg transform rotate-12"></div> */}
        {/* Italian flag */}
        {/* <div className="absolute top-32 right-32 w-16 h-12 bg-gradient-to-r from-green-600 via-white to-red-600 rounded shadow-lg transform -rotate-12"></div> */}
        {/* UAE flag */}
        {/* <div className="absolute bottom-32 left-32 w-16 h-12 bg-gradient-to-r from-red-600 via-white to-black rounded shadow-lg transform rotate-45"></div> */}
        {/* UK flag */}
        {/* <div className="absolute top-40 right-20 w-16 h-12 bg-blue-800 rounded shadow-lg transform -rotate-6"></div> */}
        {/* German flag */}
        {/* <div className="absolute bottom-20 left-1/4 w-16 h-12 bg-gradient-to-b from-black via-red-600 to-yellow-400 rounded shadow-lg transform rotate-12"></div> */}
        {/* Chinese flag */}
        {/* <div className="absolute top-60 left-1/3 w-16 h-12 bg-red-600 rounded shadow-lg transform -rotate-12"></div> */}
        {/* Indian flag */}
        {/* <div className="absolute bottom-40 right-1/4 w-16 h-12 bg-gradient-to-b from-orange-500 via-white to-green-600 rounded shadow-lg transform rotate-6"></div> */}
        {/* Russian flag */}
        {/* <div className="absolute top-80 right-1/3 w-16 h-12 bg-gradient-to-b from-white via-blue-600 to-red-600 rounded shadow-lg transform -rotate-6"></div> */}
        {/* Turkish flag */}
        {/* <div className="absolute bottom-60 right-20 w-16 h-12 bg-red-600 rounded shadow-lg transform rotate-12"></div> */}
      {/* </div> */}

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6">
          <Badge variant="secondary" className="bg-[#eaeef6] text-[#076e32] hover:bg-[#50c879] mb-4">
            100% Online by the KSA Certified Translation
          </Badge>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
          Same Day Legal and Certified Translation in the KSE
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-pretty">
          Don't waste time waiting for a quote! Upload your documents now, pay online and get your legal or certified
          translation on the same day!
        </p>

        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-3 text-lg">
          Upload Your Documents Now →
        </Button>
      </div>
    </section>
  )
}
