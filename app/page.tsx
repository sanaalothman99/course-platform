"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "./components/Navbar"
import ScrollToTop from "./components/ScrollToTop"

type Course = {
  id: string
  title: string
  description: string
  price: number
  level: string
  thumbnail?: string
  comingSoon: boolean
  hasLevels: boolean
  children: { id: string }[]
  lessons: { id: string }[]
}

const faqs = [
  { q: "Do I need prior experience?", a: "No — you can start from zero. This course is designed for complete beginners and guides you step-by-step." },
  { q: "Do I get lifetime access?", a: "Yes, lifetime access including all future updates — with no extra cost." },
  { q: "What software do I need?", a: "TIA Portal (free trial) and Factory I/O (optional). We guide you through installation step-by-step." },
  { q: "Is there a certificate?", a: "Yes, you'll receive a certificate of completion to showcase your skills." },
  { q: "Can I follow along without hardware?", a: "Yes! Practice everything using PLCSIM and Factory I/O — no physical PLC required." },
  { q: "What makes this course different?", a: "Focus on real industrial projects, not just theory — practical experience you can use in the field." },
  { q: "Do I need to be a control engineer?", a: "No — designed for technicians, and engineers in mechatronics, electrical, communications, or mechanical fields." },
]

const heroImages = [ "/logo.png","/hero-plc.png", "/hero-top.png", "/hero-bottom.png","/hero-center.png"]

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentImg, setCurrentImg] = useState(0)

  useEffect(() => {
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      .then(res => res.json())
      .then(data => {
        const mainCourses = Array.isArray(data) ? data.filter((c: any) => !c.parentId) : []
        setCourses(mainCourses)
      })
      .catch(() => setCourses([]))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % heroImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative flex items-center px-6 overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center py-24">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full text-sm mb-8">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Professional PLC Training
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
              Master PLC
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Programming
              </span>
              <br />
              From A to Z
            </h1>

            <p className="text-lg text-gray-400 mb-10 leading-8 max-w-lg">
              Learn industrial automation with hands-on PLC courses. TIA Portal, Step 7, HMI, Factory I/O & more.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link href="/courses" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-600/30 transition-all duration-300 hover:shadow-blue-600/50 hover:scale-105">
                Browse Courses →
              </Link>
              <Link href="/contact" className="border border-white/20 hover:border-blue-400/50 hover:bg-blue-400/5 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300">
                Contact Us
              </Link>
            </div>

            <div className="flex gap-8 mt-12">
         
              <div  />
              <div>
                <p className="text-2xl font-black text-blue-400">4.9★</p>
                <p className="text-gray-500 text-xs">Rating</p>
              </div>
            </div>
          </div>

          {/* Image Slider */}
          <div className="relative flex items-center justify-center h-[480px]">
            <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

            {heroImages.map((src, i) => (
              <div
                key={src}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${i === currentImg ? "opacity-100" : "opacity-0"}`}
              >
                <Image
                  src={src}
                  alt="PLC"
                  width={520}
                  height={420}
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-0 flex gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentImg ? "bg-blue-400 w-6" : "bg-white/30 w-2"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

     

      {/* Courses */}
      <section className="px-6 py-24 bg-[#0d1426]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase">Our Courses</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2 mb-4">Everything You Need</h2>
            <p className="text-gray-400">To become a professional PLC programmer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="group bg-[#111827] border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="h-64 bg-[#0a0f1e] flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-7xl">🎓</div>
                  )}
                </div>

                <div className="p-7">
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">{course.level}</span>
                    {course.comingSoon && <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">🔜 Coming Soon</span>}
                  </div>

                  <h3 className="text-2xl font-black mb-3 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                  <p className="text-gray-400 text-sm leading-6 mb-6 line-clamp-2">{course.description}</p>

                  <div className="text-sm text-gray-500 mb-6">
                    📖 {`course.hasLevels ? ${course.children?.length || 0} Levels : ${course.lessons?.length || 0} Lessons`}
                  </div>

                  <div className="flex items-center justify-between">
                    {course.comingSoon ? (
                      <span className="text-yellow-400 font-bold">Coming Soon</span>
                    ) : (
                      <span className="text-3xl font-black">${course.price}</span>
                    )}
                    <Link href={`/courses/${course.id}`} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-600/30">
                      {course.comingSoon ? "Learn More →" : "Enroll Now →"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase">Why Us</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2 mb-4">Why Choose Us?</h2>
            <p className="text-gray-400">We make PLC learning simple, practical and effective</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🎯", title: "Practical Training", desc: "Real-world exercises and projects you can apply immediately on the job" },
              { icon: "👨‍🏫", title: "Expert Instructors", desc: "Learn from engineers with years of industrial automation experience" },
              { icon: "⏱️", title: "Learn at Your Pace", desc: "Lifetime access to all course materials — study whenever you want" },
              { icon: "📜", title: "Certificate", desc: "Receive a certificate after completing your course to boost your career" },
            ].map((item) => (
              <div key={item.title} className="group flex gap-6 bg-[#111827] border border-white/10 rounded-2xl p-8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-black mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-6">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 bg-[#0d1426]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2 mb-4">Common Questions</h2>
            <p className="text-gray-400">Everything you need to know before getting started</p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all">
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <h3 className="font-bold text-sm md:text-base">{faq.q}</h3>
                  <span className={`text-blue-400 text-xl flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </div>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-7 border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Start<br /><span className="text-blue-400">Learning?</span></h2>
          <p className="text-gray-400 mb-10 text-lg">Join hundreds of students and take your automation skills to the next level</p>
          <Link href="/courses" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-lg px-12 py-5 rounded-full font-black shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-blue-600/50">
            Get Started Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        © 2025 A to Z Automation. All rights reserved.
      </footer>

      <ScrollToTop />
    </main>
  )
}