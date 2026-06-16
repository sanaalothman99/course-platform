"use client"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
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

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const t = useTranslations("home")
  const tf = useTranslations("footer")

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      .then(res => res.json())
      .then(data => {
        const mainCourses = Array.isArray(data) ? data.filter((c: any) => !c.parentId) : []
        setCourses(mainCourses)
      })
      .catch(() => setCourses([]))
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <div className="relative min-h-[500px] flex items-center justify-center">
            <div className="absolute w-[680px] h-[680px] bg-blue-500/35 rounded-full blur-3xl" />
            <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 flex flex-col gap-5 z-20">
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-xl backdrop-blur-sm">
                <Image src="/hero-top.png" alt="Top PLC panel" width={210} height={135} className="object-contain" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-xl backdrop-blur-sm">
                <Image src="/hero-bottom.png" alt="Bottom HMI panel" width={210} height={160} className="object-contain" />
              </div>
            </div>
            <div className="relative z-10 translate-x-10">
              <Image src="/hero-plc.png" alt="Main PLC system" width={580} height={400} priority className="object-contain" />
            </div>
          </div>
          <div>
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1 rounded-full text-sm mb-6 inline-block">
              {t("badge")}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              {t("heroTitle")} <span className="text-blue-400">{t("heroTitleHighlight")}</span>
              <br />{t("heroTitleSuffix")}
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-xl leading-8">{t("heroDesc")}</p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/courses" className="bg-blue-600 hover:bg-blue-500 text-white text-lg px-9 py-4 rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all">
                {t("browseCourses")}
              </Link>
              <Link href="/contact" className="border border-white/20 hover:border-blue-400 text-white text-lg px-8 py-4 rounded-full transition-colors">
                {t("contactUs")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600/10 border-y border-blue-500/20 py-10">
        <div className="flex justify-center gap-24">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">{t("stat1Value")}</p>
            <p className="text-gray-400 text-sm mt-1">{t("stat1Label")}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">{t("stat2Value")}</p>
            <p className="text-gray-400 text-sm mt-1">{t("stat2Label")}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">{t("stat3Value")}</p>
            <p className="text-gray-400 text-sm mt-1">{t("stat3Label")}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">{t("stat4Value")}</p>
            <p className="text-gray-400 text-sm mt-1">{t("stat4Label")}</p>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="px-6 py-24 bg-[#0d1426]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">{t("coursesTitle")}</h2>
          <p className="text-gray-400 text-center mb-16">{t("coursesSubtitle")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {courses.map((course) => (
              <div key={course.id} className="bg-[#111827] border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="relative h-72 bg-gradient-to-br from-blue-600 to-blue-800">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">🎓</div>
                  )}
                </div>
                <div className="p-7">
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{course.level}</span>
                    {course.comingSoon && (
                      <span className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">🔜 {t("comingSoon")}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mt-4 mb-3">{course.title}</h3>
                  <p className="text-gray-400 text-sm leading-6 mb-6 line-clamp-2">{course.description}</p>
                  <div className="flex gap-5 text-sm text-gray-400 mb-8">
                    <span>📖 {course.hasLevels ? `${course.children?.length || 0} ${t("levels", { count: course.children?.length || 0 })}` : `${course.lessons?.length || 0} ${t("lessons", { count: course.lessons?.length || 0 })}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    {course.comingSoon ? (
                      <span className="text-yellow-400 font-semibold">{t("comingSoon")}</span>
                    ) : (
                      <span className="text-3xl font-bold">${course.price}</span>
                    )}
                    <Link href={`/courses/${course.id}`} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full text-sm font-semibold transition-colors">
                      {course.comingSoon ? t("learnMore") : t("enrollNow")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-10 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">{t("whyTitle")}</h2>
        <p className="text-gray-400 text-center mb-16">{t("whySubtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            { icon: "🎯", title: t("why1Title"), desc: t("why1Desc") },
            { icon: "👨‍🏫", title: t("why2Title"), desc: t("why2Desc") },
            { icon: "⏱️", title: t("why3Title"), desc: t("why3Desc") },
            { icon: "📜", title: t("why4Title"), desc: t("why4Desc") },
          ].map((item, i) => (
            <div key={i} className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-10 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">{t("faqTitle")}</h2>
        <p className="text-gray-400 text-center mb-16">{t("faqSubtitle")}</p>
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {[1,2,3,4,5,6,7].map((n) => (
            <div key={n} className="bg-[#111827] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <h3 className="font-bold mb-2">{t(`faq${n}Q` as any)}</h3>
              <p className="text-gray-400 text-sm">{t(`faq${n}A` as any)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-gradient-to-b from-[#0d1426] to-[#0a0f1e]">
        <h2 className="text-4xl font-bold mb-4">{t("ctaTitle")}</h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">{t("ctaDesc")}</p>
        <Link href="/courses" className="bg-blue-600 hover:bg-blue-500 text-white text-lg px-10 py-4 rounded-full font-semibold transition-colors">
          {t("ctaBtn")}
        </Link>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        {tf("copy")}
      </footer>

      <ScrollToTop />
    </main>
  )
}
