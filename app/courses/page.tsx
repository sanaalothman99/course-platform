"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "../components/Navbar"

type Course = {
  id: string
  title: string
  description: string
  price: number
  level: string
  thumbnail?: string
  comingSoon: boolean
  lessons: { id: string }[]
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

const fetchCourses = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
    const data = await res.json()
    const mainCourses = Array.isArray(data) ? data.filter((c: any) => !c.parentId) : []
    setCourses(mainCourses)
  } finally {
    setLoading(false)
  }
}

  return (<>
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Courses</h1>
          <p className="text-gray-400 text-center mb-16">
            Everything you need to become a PLC expert
          </p>

          {loading && (
            <div className="text-center text-gray-400 py-12">Loading courses...</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#111827] border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                 <div className="h-64 bg-[#0a0f1e] flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">🎓</div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                    {course.comingSoon && (
                      <span className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                        🔜 Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>

                  <p className="text-gray-400 text-sm leading-6 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex gap-4 text-sm text-gray-400 mb-6">
                    <span>📖 {course.lessons?.length || 0} Lessons</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {course.comingSoon ? (
                      <span className="text-yellow-400 font-semibold">Coming Soon</span>
                    ) : (
                      <span className="text-2xl font-bold">${course.price}</span>
                    )}
                    <Link
                      href={`/courses/${course.id}`}
                      className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                    >
                      {course.comingSoon ? "Learn More →" : "View Course →"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && courses.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              No courses available yet
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        © 2025 A to Z Automation. All rights reserved.
      </footer>
    </main>
    </>
  )
}