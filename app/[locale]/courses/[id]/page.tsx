"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, Link } from "@/i18n/navigation"
import Navbar from "../../components/Navbar"



type Lesson = {
  id: string
  title: string
  titleAr?: string
  position: number
  videoUrl?: string
  description?: string
  pdfUrl?: string
  thumbnailUrl?:string
  chapterId?: string
  files?: any[]
}

type Chapter = {
  id: string
  title: string
  position: number
  lessons: Lesson[]
}

type Course = {
  id: string
  title: string
  description: string
  titleAr?: string
  descriptionAr?: string
  price: number
  level: string
  thumbnail?: string
  previewUrl?: string
  comingSoon: boolean
  hasLevels: boolean
  lessons: Lesson[]
  chapters: Chapter[]
}

function SubCourses({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [subCourses, setSubCourses] = useState<any[]>([])
  const t = useTranslations("coursePage")
  const locale = useLocale()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/sub-courses`)
      .then(res => res.json())
      .then(data => setSubCourses(Array.isArray(data) ? data : []))
  }, [courseId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {subCourses.length === 0 && (
        <p className="text-gray-400 col-span-2">{t("noLevels")}</p>
      )}
      {subCourses.map((sub) => (
        <div
          key={sub.id}
          onClick={() => router.push(`/courses/${sub.id}`)}
          className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/50 hover:-translate-y-1 transition-all"
        >
       <div className="aspect-square bg-[#0a0f1e] overflow-hidden">
  {sub.thumbnail ? (
    <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-contain p-4" />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>
  )}
</div>
          <div className="p-6">
            <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{sub.level}</span>
            <h3 className="font-bold text-lg mt-3 mb-2">{locale === "ar" && sub.titleAr ? sub.titleAr : sub.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{locale === "ar" && sub.descriptionAr ? sub.descriptionAr : sub.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">${sub.price}</span>
              <span className="text-blue-400 text-sm">{t("viewLevel")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const t = useTranslations("coursePage")
  const tf = useTranslations("footer")
  const locale = useLocale()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeTab, setActiveTab] = useState<"preview" | "lesson">("preview")
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)

  useEffect(() => {
    if (!courseId) return

    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (sessionId) {
      const token = localStorage.getItem('token')
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sessionId }),
        }).then(() => {
          window.history.replaceState({}, '', window.location.pathname)
          checkEnrollment()
        })
      }
    }

    fetchCourse()
    checkEnrollment()
    fetchProgress()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCourse()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`)
      const data = await res.json()
      setCourse(data)
      if (data.chapters) {
        setExpandedChapters(new Set(data.chapters.map((c: Chapter) => c.id)))
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setCompleted(new Set(data.map((p: any) => p.lessonId)))
      }
    } catch {
      setCompleted(new Set())
    }
  }

  const checkEnrollment = async () => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role === "ADMIN") {
        setEnrolled(true)
        return
      }
    }
    if (!token) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/check/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setEnrolled(data.enrolled)
  }

  const handleEnroll = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login/member")
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert("فشل الدفع: " + (data.message || JSON.stringify(data)))
      }
    } catch (err) {
      alert("خطأ: " + (err as Error).message)
    } finally {
      setEnrolling(false)
    }
  }

  const fetchComments = async (lessonId: string) => {
    const token = localStorage.getItem("token")
    if (!token || !lessonId) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch {
      setComments([])
    }
  }

  const submitComment = async () => {
    const token = localStorage.getItem("token")
    if (!token || !newComment || !activeLesson) return
    setSubmitting(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/lesson/${activeLesson.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setNewComment("")
      fetchComments(activeLesson.id)
    } catch (err: any) {
      alert(err.name === "AbortError" ? "انتهت مهلة الاتصال — حاول لاحقاً" : "فشل إرسال التعليق: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCompleted = async (lessonId: string) => {
    const token = localStorage.getItem("token")
    const updated = new Set(completed)
    if (updated.has(lessonId)) {
      updated.delete(lessonId)
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/progress/${lessonId}/complete`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } else {
      updated.add(lessonId)
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/progress/${lessonId}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    }
    setCompleted(updated)
  }

  const toggleChapter = (chapterId: string) => {
    const updated = new Set(expandedChapters)
    if (updated.has(chapterId)) {
      updated.delete(chapterId)
    } else {
      updated.add(chapterId)
    }
    setExpandedChapters(updated)
  }

  const getAllLessons = () => {
    if (!course) return []
    const chapterLessons = course.chapters?.flatMap(c => c.lessons) || []
    return [...chapterLessons, ...(course.lessons || [])]
  }

  const totalLessons = getAllLessons().length
  const completedCount = completed.size
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const displayTitle = (locale === "ar" && course?.titleAr ? course.titleAr : course?.title) || ""
  const displayDescription = (locale === "ar" && course?.descriptionAr ? course.descriptionAr : course?.description) || ""

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
        <p className="text-gray-400">{t("loading")}</p>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">404</p>
          <p className="text-gray-400 mb-6">{t("notFound")}</p>
          <Link href="/courses" className="bg-blue-600 px-6 py-3 rounded-full">{t("backToCourses")}</Link>
        </div>
      </main>
    )
  }

 // Coming Soon — عرض وصف + مستويات فرعية
if (course.comingSoon) {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />
      <section className="relative py-12 md:py-20 px-6 bg-gradient-to-b from-blue-900/20 to-[#0a0f1e]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-full">
              {t("comingSoon")}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4">{displayTitle}</h1>
            <p className="text-gray-400 leading-7 mb-6">{displayDescription}</p>
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4">
              <p className="text-yellow-400 font-semibold text-sm">{t("underDevelopment")}</p>
              <p className="text-gray-400 text-xs mt-1">{t("stayTuned")}</p>
            </div>
          </div>
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={displayTitle} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-600/30 to-blue-800 flex items-center justify-center text-7xl">🔜</div>
            )}
          </div>
        </div>
      </section>

      {/* المستويات الفرعية إذا في */}
      {course.hasLevels && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-8">{t("courseLevels")}</h2>
          <SubCourses courseId={course.id} />
        </section>
      )}

      <Link href="/courses" className="block text-center text-gray-400 hover:text-white text-sm py-8 transition-colors">
        {t("backToCourses")}
      </Link>
    </main>
  )
}

  // كورس فيه مستويات — مشترك أو أدمن

if (enrolled && course.hasLevels) {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>
              <p className="text-gray-400 mb-6">{displayDescription}</p>
            </div>
            {course.thumbnail && (
              <div className="h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10">
                <img src={course.thumbnail} alt={displayTitle} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-8">{t("courseLevels")}</h2>
          <SubCourses courseId={course.id} />
        </div>
      </section>
    </main>
  )
}
  // Landing page — not enrolled
  if (!enrolled) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-white">
        <Navbar />

        <section className="relative py-12 md:py-20 px-6 bg-gradient-to-b from-blue-900/20 to-[#0a0f1e]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                {course.level}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4">{displayTitle}</h1>
              <p className="text-gray-400 leading-7 mb-6">{displayDescription}</p>
              <div className="flex gap-6 text-sm text-gray-400 mb-8">
                {course.hasLevels ? (
                  <span>{t("multipleLevels")}</span>
                ) : (
                  <span>{t("lessonsCount", { count: totalLessons })}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {course.hasLevels ? (
                  <span className="text-gray-400 text-sm">{t("selectLevel")}</span>
                ) : (
                  <>
                    <span className="text-3xl md:text-4xl font-bold">${course.price}</span>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3 rounded-full font-semibold transition-colors"
                    >
                      {enrolling ? t("processing") : t("enrollNow")}
                    </button>
                  </>
                )}
              </div>
            </div>

   <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10">
  {course.thumbnail ? (
    <img src={course.thumbnail} alt={displayTitle} className="w-full h-full object-contain p-4" />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-7xl">🎓</div>
  )}
</div>
          </div>
        </section>

        {course.previewUrl && !course.hasLevels && (
          <section className="max-w-5xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold mb-4">{t("previewVideo")}</h2>
            <video src={course.previewUrl} controls controlsList="nodownload" className="w-full rounded-2xl max-h-96" />
          </section>
        )}

        <section className="max-w-5xl mx-auto px-6 py-12">
          {course.hasLevels ? (
            <div>
              <h2 className="text-2xl font-bold mb-8">{t("courseLevels")}</h2>
              <SubCourses courseId={course.id} />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-8">{t("courseContent")}</h2>
              <div className="flex flex-col gap-3">
                {course.chapters?.length > 0 ? (
                  course.chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                      <div className="px-4 md:px-6 py-4 flex items-center gap-3 bg-white/5">
                        <span className="text-blue-400 font-bold text-sm">#{chapter.position}</span>
                        <span className="font-semibold text-sm md:text-base">{chapter.title}</span>
                        <span className="ml-auto text-gray-400 text-xs">
                          {(chapter as any).children?.length > 0
                            ? `${(chapter as any).children.length} sub-chapters`
                            : t("lessonsWord", { count: chapter.lessons.length })}
                        </span>
                      </div>
                      {(chapter as any).children?.length > 0 ? (
                        (chapter as any).children.map((sub: any) => (
                          <div key={sub.id} className="px-4 md:px-6 py-3 flex items-center gap-4 border-t border-white/5">
                            <span className="text-purple-400 text-xs">▶</span>
                            <span className="flex-1 text-sm text-purple-300">{sub.title}</span>
                            <span className="text-gray-500 text-xs">{t("lessonsWord", { count: sub.lessons?.length || 0 })}</span>
                          </div>
                        ))
                      ) : (
                        chapter.lessons.map((lesson, i) => (
                          <div key={lesson.id} className="px-4 md:px-6 py-3 flex items-center gap-4 border-t border-white/5">
                            <span className="text-gray-500 text-sm w-6">{i + 1}</span>
                            <span className="flex-1 text-sm text-gray-300">{locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title}</span>
                            <span className="text-gray-600 text-sm">🔒</span>
                          </div>
                        ))
                      )}
                    </div>
                  ))
                ) : (
                  course.lessons.map((lesson, i) => (
                    <div key={lesson.id} className="bg-[#111827] border border-white/10 rounded-xl px-4 md:px-6 py-4 flex items-center gap-4">
                      <span className="text-blue-400 font-bold w-8">{i + 1}</span>
                      <span className="flex-1 text-sm">{locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title}</span>
                      <span className="text-gray-600 text-sm">🔒</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
          {tf("copy")}
        </footer>
      </main>
    )
  }

  // Course Player — enrolled
  return (

    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="flex relative" style={{ height: "calc(100vh - 80px)" }}>

        {/* Sidebar */}
        <div className={`
          fixed md:relative top-0 left-0 h-full z-40
          bg-[#0d1426] border-r border-white/10 flex flex-col overflow-hidden
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `} style={{ marginTop: "80px", width: `${sidebarWidth}px`, minWidth: "200px", maxWidth: "600px" }}>


          {/* Close button mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>

          <div className="bg-blue-700 p-4 md:p-6">
            <Link href="/courses" className="text-white/70 text-sm hover:text-white mb-3 inline-block">
              {t("backToCourses")}
            </Link>
            <h2 className="text-base md:text-lg font-bold">{displayTitle}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>{t("progress")}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/70 text-xs mt-1">{completedCount} / {totalLessons} {t("lessonsPlural")}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {course.previewUrl && (
              <div
                onClick={() => { setActiveLesson(null); setActiveTab("preview"); setSidebarOpen(false) }}
                className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors ${activeTab === "preview" && !activeLesson ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
              >
                <span className="text-yellow-400">🎬</span>
                <div>
                  <p className="text-sm font-medium">{t("previewVideoLabel")}</p>
                  <p className="text-xs text-gray-400">{t("freeIntro")}</p>
                </div>
              </div>
            )}

            {course.chapters?.length > 0 ? (
              course.chapters.map((chapter) => (
                <div key={chapter.id}>
                  <div
                    onClick={() => toggleChapter(chapter.id)}
                    className="px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-gray-400 text-xs">{expandedChapters.has(chapter.id) ? "▼" : "▶️"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{chapter.title}</p>
                      <p className="text-xs text-gray-400">
                        {(chapter as any).children?.length > 0
                          ? `${(chapter as any).children.length} sub-chapters`
                          : t("lessonsWord", { count: chapter.lessons.length })}
                      </p>
                    </div>
                  </div>

                  {expandedChapters.has(chapter.id) && (
                    <>
                      {(chapter as any).children?.length > 0 ? (
                        (chapter as any).children.map((subChapter: any) => (
                          <div key={subChapter.id}>
                            <div
                              onClick={() => toggleChapter(subChapter.id)}
                              className="px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 pl-6 hover:bg-white/5 transition-colors"
                            >
                              <span className="text-purple-400 text-xs">{expandedChapters.has(subChapter.id) ? "▼" : "▶️"}</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-purple-300">{subChapter.title}</p>
                                <p className="text-xs text-gray-500">{subChapter.lessons?.length || 0} lessons</p>
                              </div>
                            </div>

                            {expandedChapters.has(subChapter.id) && [...(subChapter.lessons || [])]
                              .sort((a: any, b: any) => a.position - b.position)
                              .map((lesson: any) => (
                                <div
                                  key={lesson.id}
                                  onClick={() => { setActiveLesson(lesson); setActiveTab("lesson"); fetchComments(lesson.id); setSidebarOpen(false) }}
                                  className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 pl-10 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
                                >
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleCompleted(lesson.id) }}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed.has(lesson.id) ? "bg-green-500 border-green-500" : "border-gray-500"}`}
                                  >
                                    {completed.has(lesson.id) && <span className="text-white text-xs">✓</span>}
                                  </button>
                                  <p className="text-sm truncate">{locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title}</p>
                                </div>
                              ))}
                          </div>
                        ))
                      ) : (
                        [...chapter.lessons]
                          .sort((a, b) => a.position - b.position)
                          .map((lesson) => (
                            <div
                              key={lesson.id}
                              onClick={() => { setActiveLesson(lesson); setActiveTab("lesson"); fetchComments(lesson.id); setSidebarOpen(false) }}
                              className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 pl-8 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleCompleted(lesson.id) }}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed.has(lesson.id) ? "bg-green-500 border-green-500" : "border-gray-500"}`}
                              >
                                {completed.has(lesson.id) && <span className="text-white text-xs">✓</span>}
                              </button>
                              <p className="text-sm truncate">{locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title}</p>
                            </div>
                          ))
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              [...course.lessons].sort((a, b) => a.position - b.position).map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => { setActiveLesson(lesson); setActiveTab("lesson"); fetchComments(lesson.id); setSidebarOpen(false) }}
                  className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCompleted(lesson.id) }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed.has(lesson.id) ? "bg-green-500 border-green-500" : "border-gray-500"}`}
                  >
                    {completed.has(lesson.id) && <span className="text-white text-xs">✓</span>}
                  </button>
                  <p className="text-sm truncate">{locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            style={{ marginTop: "80px" }}
          />
        )}
             {/* Resize Handle */}
<div
  className="hidden md:block w-1 bg-white/10 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
  onMouseDown={(e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX)
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth)
      }
    }
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }}
/>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "preview" && !activeLesson && (
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-6">{t("previewLabel", { title: displayTitle })}</h1>
              {course.previewUrl ? (
                <video src={course.previewUrl} controls controlsList="nodownload" className="w-full max-w-4xl rounded-2xl mb-6 aspect-video" />
              ) : (
                <div className="aspect-video w-full max-w-4xl rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-center mb-6">
                  <div className="text-center text-gray-400">
                    <p className="text-5xl mb-4">🎬</p>
                    <p>{t("selectLessonToStart")}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeLesson && (
            <div>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold">{locale === "ar" && activeLesson.titleAr ? activeLesson.titleAr : activeLesson.title}</h1>
                <button
                  onClick={() => toggleCompleted(activeLesson.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${completed.has(activeLesson.id) ? "bg-green-600 hover:bg-green-500" : "bg-white/10 hover:bg-white/20"}`}
                >
                  {completed.has(activeLesson.id) ? t("completed") : t("markComplete")}
                </button>
              </div>

              <div className="aspect-video w-full max-w-4xl rounded-2xl overflow-hidden mb-8 bg-[#111827] border border-white/10">
               {activeLesson.videoUrl ? (
  <div key={activeLesson.id} className="relative w-full h-full">
    {activeLesson.thumbnailUrl && (
      <img
        src={activeLesson.thumbnailUrl}
        alt={locale === "ar" && activeLesson.titleAr ? activeLesson.titleAr : activeLesson.title}
        className="absolute inset-0 w-full h-full object-cover z-10 cursor-pointer"
        onClick={(e) => {
          (e.target as HTMLElement).style.display = 'none'
          const video = (e.target as HTMLElement).nextElementSibling as HTMLVideoElement
          video?.play()
        }}
      />
    )}
    <video
      src={activeLesson.videoUrl}
      controls
      controlsList="nodownload"
      className="w-full h-full"
    />
  </div>
) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="text-5xl mb-4">🎬</p>
                      <p>{t("videoComingSoon")}</p>
                    </div>
                  </div>
                )}
              </div>

             {activeLesson.description && (
  <div className="max-w-4xl bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
    <h3 className="font-bold mb-2">{t("aboutLesson")}</h3>
    <p className="text-gray-400 whitespace-pre-wrap">
      {activeLesson.description.split(/(\bhttps?:\/\/\S+)/g).map((part, i) =>
        part.match(/^https?:\/\//) ? (
          <a key={i} href={part} target="_blank" className="text-blue-400 hover:underline">{part}</a>
        ) : (
          part
        )
      )}
    </p>
  </div>
)}

                 {activeLesson.pdfUrl && (
  <div className="max-w-4xl bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
    <h3 className="font-bold mb-4">{t("lessonPdf")}</h3>
    <a
      href={activeLesson.pdfUrl}
      target="_blank"
      className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-semibold transition-colors inline-block"
    >
      {t("downloadPdf")}
    </a>
  </div>
)}
{activeLesson.files && activeLesson.files.length > 0 && (
  <div className="max-w-4xl bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
    <h3 className="font-bold mb-4">{t("additionalFiles")}</h3>
    <div className="flex flex-col gap-2">
      {activeLesson.files.map((file: any) => {
        const isPdf = file.fileType === 'application/pdf' || file.fileName?.toLowerCase().endsWith('.pdf')
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/upload/download?url=${encodeURIComponent(file.fileUrl)}&filename=${encodeURIComponent(file.fileName)}`
        return (
          <a
            key={file.id}
            href={isPdf ? file.fileUrl : downloadUrl}
            {...(isPdf ? { target: "_blank" } : {})}
            className="flex items-center gap-2 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 hover:border-blue-500/50 transition-colors"
          >
            <span>{isPdf ? "📄" : "📥"}</span>
            <span className="text-sm text-blue-400 truncate">{file.fileName}</span>
          </a>
        )
      })}
    </div>
  </div>
)}

              {/* Comments */}
              <div className="max-w-4xl">
                <h3 className="font-bold text-lg mb-4">{t("comments")}</h3>
                <div className="flex gap-3 mb-6">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t("writeComment")}
                    className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={submitComment}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {t("send")}
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-[#111827] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                          {comment.user?.name?.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold">{comment.user?.name}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                      {comment.replies?.length > 0 && (
                        <div className="mt-3 border-l-2 border-blue-500/40 pl-3 flex flex-col gap-2">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-[#0a0f1e] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                                  {reply.user?.name?.charAt(0).toUpperCase()}
                                </span>
                                <span className="text-xs font-semibold text-green-400">{reply.user?.name}</span>
                              </div>
                              <p className="text-gray-300 text-xs">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm">
  {tf("copy")}
</footer>
    </main>

  )
}
