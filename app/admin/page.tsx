"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Admin() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) { router.push("/login/member"); return }
    const parsed = JSON.parse(user)
    if (parsed.role !== "ADMIN") { router.push("/dashboard"); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    try {
      const [coursesRes, ordersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const coursesData = await coursesRes.json()
      const ordersData = await ordersRes.json()
      setCourses(Array.isArray(coursesData) ? coursesData : [])
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } finally {
      setLoading(false)
    }
  }


  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course?")) return
    const token = localStorage.getItem("token")
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchData()
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const totalRevenue = orders.reduce((acc, o) => acc + (o.course?.price || 0), 0)

  return (<>
    <main className="min-h-screen bg-[#0a0f1e] text-white">

      <nav className="flex justify-between items-center px-10 py-5 border-b border-white/10 bg-black sticky top-0 z-50">
        <Link href="/">
          <Image src="/logo.jpg" alt="A to Z Automation" width={140} height={45} className="mix-blend-lighten" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400 text-sm font-semibold">⚙️ Admin Panel</span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full text-sm transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">

        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your courses and students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold text-blue-400">
              {new Set(orders.map((o: any) => o.user?.id)).size}
            </p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Courses</p>
            <p className="text-4xl font-bold text-green-400">{courses.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Orders</p>
            <p className="text-4xl font-bold text-purple-400">{orders.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-yellow-400">${totalRevenue}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/admin/courses/new" className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-4xl">➕</div>
            <div>
              <h3 className="font-bold">Add New Course</h3>
              <p className="text-gray-400 text-sm">Create and publish a new course</p>
            </div>
          </Link>
          <Link href="/admin/comments" className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-4xl">💬</div>
            <div>
              <h3 className="font-bold">View Comments</h3>
              <p className="text-gray-400 text-sm">Reply to student comments</p>
            </div>
          </Link>
          <Link href="/admin/orders" className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-4xl">💳</div>
            <div>
              <h3 className="font-bold">View Orders</h3>
              <p className="text-gray-400 text-sm">Track all payments</p>
            </div>
          </Link>
        </div>

        {/* Courses Table */}
        <h2 className="text-2xl font-bold mb-6">Courses</h2>
        <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Course</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Price</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Level</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              )}
              {!loading && courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No courses yet</td>
                </tr>
              )}
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{course.title}</td>
                  <td className="px-6 py-4 text-gray-300">${course.price}</td>
                  <td className="px-6 py-4 text-gray-300">{course.level}</td>
                  <td className="px-6 py-4">
                    {course.comingSoon ? (
                      <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">Coming Soon</span>
                    ) : (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm mt-12">
        © 2025 A to Z Automation. All rights reserved.
      </footer>

    </main>
    </>
  )
}