"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "../../components/Navbar"

type Lesson = {
  id: string
  title: string
  position: number
  videoUrl?: string
  description?: string
  pdfUrl?: string
  chapterId?: string
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

  useEffect(() => {
    fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}/sub-courses`)
      .then(res => res.json())
      .then(data => setSubCourses(Array.isArray(data) ? data : []))
  }, [courseId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {subCourses.length === 0 && (
        <p className="text-gray-400 col-span-2">No levels available yet</p>
      )}
      {subCourses.map((sub) => (
        <div
          key={sub.id}
          onClick={() => router.push(`/courses/${sub.id}`)}
          className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/50 hover:-translate-y-1 transition-all"
        >
          <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-800">
            {sub.thumbnail ? (
              <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-contain bg-[#0a0f1e]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>
            )}
          </div>
          <div className="p-6">
            <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{sub.level}</span>
            <h3 className="font-bold text-lg mt-3 mb-2">{sub.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{sub.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">${sub.price}</span>
              <span className="text-blue-400 text-sm">View Level →</span>
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

  useEffect(() => {
    if (!courseId) return
    fetchCourse()
    checkEnrollment()
    fetchProgress()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}`)
      const data = await res.json()
      setCourse(data)
      // افتح كل الـ chapters تلقائياً
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
    const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}/progress`, {
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
  
  // تحقق إذا أدمن
  const userData = localStorage.getItem("user")
  if (userData) {
    const user = JSON.parse(userData)
    if (user.role === "ADMIN") {
      setEnrolled(true)
      return
    }
  }

  if (!token) return

  const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/orders/check/${courseId}`, {
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
      const res = await fetch("process.env.NEXT_PUBLIC_API_URL/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setEnrolling(false)
    }
  }

  const fetchComments = async (lessonId: string) => {
    const token = localStorage.getItem("token")
    if (!token || !lessonId) return
    try {
      const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/comments/lesson/${lessonId}`, {
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
      await fetch(`process.env.NEXT_PUBLIC_API_URL/comments/lesson/${activeLesson.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      })
      setNewComment("")
      fetchComments(activeLesson.id)
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
      await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/progress/${lessonId}/complete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
    }
  } else {
    updated.add(lessonId)
    if (token) {
      await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/progress/${lessonId}/complete`, {
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">404</p>
          <p className="text-gray-400 mb-6">Course not found</p>
          <Link href="/courses" className="bg-blue-600 px-6 py-3 rounded-full">Back to Courses</Link>
        </div>
      </main>
    )
  }
    // كورس فيه مستويات — مشترك أو أدمن
if (enrolled && course.hasLevels) {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-400 mb-16">{course.description}</p>
          <h2 className="text-2xl font-bold mb-8">📚 Course Levels</h2>
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

        <section className="relative py-20 px-6 bg-gradient-to-b from-blue-900/20 to-[#0a0f1e]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                {course.level}
              </span>
              <h1 className="text-4xl font-bold mt-4 mb-4">{course.title}</h1>
              <p className="text-gray-400 leading-7 mb-6">{course.description}</p>
              <div className="flex gap-6 text-sm text-gray-400 mb-8">
                {course.hasLevels ? (
                  <span>📚 Multiple Levels</span>
                ) : (
                  <span>📖 {totalLessons} Lessons</span>
                )}
              </div>
              <div className="flex items-center gap-6">
                {course.comingSoon ? (
                  <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-6 py-3 rounded-full font-semibold">
                    🔜 Coming Soon
                  </span>
                ) : course.hasLevels ? (
                  <span className="text-gray-400 text-sm">Select a level below to enroll</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold">${course.price}</span>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3 rounded-full font-semibold transition-colors"
                    >
                      {enrolling ? "Processing..." : "Enroll Now →"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-8xl">🎓</div>
              )}
            </div>
          </div>
        </section>

        {/* Preview Video */}
        {course.previewUrl && (
          <section className="max-w-5xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold mb-4">🎬 Preview Video</h2>
            <video src={course.previewUrl} controls className="w-full rounded-2xl max-h-96 " />
          </section>
        )}

        {/* Levels or Content */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          {course.hasLevels ? (
            <div>
              <h2 className="text-2xl font-bold mb-8">📚 Course Levels</h2>
              <SubCourses courseId={course.id} />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-8">📚 Course Content</h2>
              <div className="flex flex-col gap-3">
                {course.chapters?.length > 0 ? (
                  course.chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 flex items-center gap-3 bg-white/5">
                        <span className="text-blue-400 font-bold text-sm">#{chapter.position}</span>
                        <span className="font-semibold">{chapter.title}</span>
                        <span className="ml-auto text-gray-400 text-xs">{chapter.lessons.length} lessons</span>
                      </div>
                      {chapter.lessons.map((lesson, i) => (
                        <div key={lesson.id} className="px-6 py-3 flex items-center gap-4 border-t border-white/5">
                          <span className="text-gray-500 text-sm w-6">{i + 1}</span>
                          <span className="flex-1 text-sm text-gray-300">{lesson.title}</span>
                          <span className="text-gray-600 text-sm">🔒</span>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  course.lessons.map((lesson, i) => (
                    <div key={lesson.id} className="bg-[#111827] border border-white/10 rounded-xl px-6 py-4 flex items-center gap-4">
                      <span className="text-blue-400 font-bold w-8">{i + 1}</span>
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-gray-600 text-sm">🔒 Locked</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
          © 2025 A to Z Automation. All rights reserved.
        </footer>
      </main>
    )
  }

  // Course Player — enrolled
  return (
    
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="flex" style={{ height: "calc(100vh - 80px)" }}>

        {/* Sidebar */}
        <div className="w-80 bg-[#0d1426] border-r border-white/10 flex flex-col overflow-hidden flex-shrink-0">
          <div className="bg-blue-700 p-6">
            <Link href="/courses" className="text-white/70 text-sm hover:text-white mb-3 inline-block">
              ← Back to Courses
            </Link>
            <h2 className="text-lg font-bold">{course.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progress}%`}} />
              </div>
              <p className="text-white/70 text-xs mt-1">{completedCount} / {totalLessons} lessons</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Preview */}
            {course.previewUrl && (
              <div
                onClick={() => { setActiveLesson(null); setActiveTab("preview") }}
                className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors ${activeTab === "preview" && !activeLesson ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
              >
                <span className="text-yellow-400">🎬</span>
                <div>
                  <p className="text-sm font-medium">Preview Video</p>
                  <p className="text-xs text-gray-400">Free intro</p>
                </div>
              </div>
            )}

            {/* Chapters */}
            {course.chapters?.length > 0 ? (
              course.chapters.map((chapter) => (
                <div key={chapter.id}>
                  <div
                    onClick={() => toggleChapter(chapter.id)}
                    className="px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 bg-white/3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-gray-400 text-xs">{expandedChapters.has(chapter.id) ? "▼" : "▶"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{chapter.title}</p>
                      <p className="text-xs text-gray-400">{chapter.lessons.length} lessons</p>
                    </div>
                  </div>

                  {expandedChapters.has(chapter.id) && chapter.lessons
                    .sort((a, b) => a.position - b.position)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => { setActiveLesson(lesson); setActiveTab("lesson"); fetchComments(lesson.id) }}
                        className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 pl-8 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCompleted(lesson.id) }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed.has(lesson.id) ? "bg-green-500 border-green-500" : "border-gray-500"}`}
                        >
                          {completed.has(lesson.id) && <span className="text-white text-xs">✓</span>}
                        </button>
                        <p className="text-sm truncate">{lesson.title}</p>
                      </div>
                    ))}
                </div>
              ))
            ) : (
              course.lessons.sort((a, b) => a.position - b.position).map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => { setActiveLesson(lesson); setActiveTab("lesson"); fetchComments(lesson.id) }}
                  className={`px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors ${activeLesson?.id === lesson.id ? "bg-blue-600/20 border-l-4 border-l-blue-500" : "hover:bg-white/5"}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCompleted(lesson.id) }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${completed.has(lesson.id) ? "bg-green-500 border-green-500" : "border-gray-500"}`}
                  >
                    {completed.has(lesson.id) && <span className="text-white text-xs">✓</span>}
                  </button>
                  <p className="text-sm truncate">{lesson.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* Preview Video */}
          {activeTab === "preview" && !activeLesson && (
            <div>
              <h1 className="text-2xl font-bold mb-6">🎬 Preview — {course.title}</h1>
              {course.previewUrl ? (
                <video src={course.previewUrl} controls controlsList="nodownload" className="w-full max-w-4xl rounded-2xl mb-6 aspect-video" />
              ) : (
                <div className="aspect-video w-full max-w-4xl rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-center mb-6">
                  <div className="text-center text-gray-400">
                    <p className="text-6xl mb-4">🎬</p>
                    <p>Select a lesson to start</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lesson */}
          {activeLesson && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
                <button
                  onClick={() => toggleCompleted(activeLesson.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${completed.has(activeLesson.id) ? "bg-green-600 hover:bg-green-500" : "bg-white/10 hover:bg-white/20"}`}
                >
                  {completed.has(activeLesson.id) ? "✓ Completed" : "Mark as Complete"}
                </button>
              </div>

              {/* Video */}
              <div className="aspect-video w-full max-w-full rounded-2xl overflow-hidden mb-8 bg-[#111827] border border-white/10">
                {activeLesson.videoUrl ? (
                  <video src={activeLesson.videoUrl} controls controlsList="nodownload" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="text-6xl mb-4">🎬</p>
                      <p>Video coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {activeLesson.description && (
                <div className="max-w-4xl bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold mb-2">📝 About this lesson</h3>
                  <p className="text-gray-400">{activeLesson.description}</p>
                </div>
              )}

              {/* PDF */}
              {activeLesson.pdfUrl && (
                <div className="max-w-4xl mb-8">
                  <h3 className="font-bold mb-4">📎 Attachments</h3>
                  <a
                    href={activeLesson.pdfUrl}
                    target="_blank"
                    className="bg-[#111827] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-blue-500/50 transition-all"
                  >
                    <span className="text-red-400 text-2xl">📄</span>
                    <span className="text-sm font-medium">Download PDF</span>
                    <span className="ml-auto text-blue-400 text-sm">Download →</span>
                  </a>
                </div>
              )}

              {/* Comments */}
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">💬 Comments</h2>
                <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
                  <textarea
                    rows={3}
                    placeholder="Ask a question or leave a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none mb-4"
                  />
                  <button
                    onClick={submitComment}
                    disabled={!newComment || submitting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {submitting ? "Sending..." : "Post Comment →"}
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {comments.length === 0 && (
                    <p className="text-gray-400 text-sm">No comments yet — be the first!</p>
                  )}
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="bg-[#111827] border border-white/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-blue-400">{comment.user.name}</span>
                        <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 mb-4">{comment.content}</p>
                      {comment.replies?.length > 0 && (
                        <div className="border-l-2 border-blue-500/30 pl-4 flex flex-col gap-2">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-[#0a0f1e] rounded-xl p-3">
                              <span className="text-green-400 text-sm font-semibold">✅ {reply.user.name} (Admin)</span>
                              <p className="text-gray-300 text-sm mt-1">{reply.content}</p>
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
    </main>
    
  )
}