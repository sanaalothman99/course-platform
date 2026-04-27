"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "../components/Navbar"

type Course = {
  id: string
  title: string
  description: string
  level: string
  thumbnail?: string
  lessons: { id: string }[]
}

type Order = {
  id: string
  course: Course
}

export default function Dashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login/member")
      return
    }
    setUser(JSON.parse(userData))
    fetchOrders()
    fetchCertificates()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }
  const fetchCertificates = async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setCertificates(Array.isArray(data) ? data : [])
  } catch {
    setCertificates([])
  }
}

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name} 👋
            </h1>
            <p className="text-gray-400 mt-1">Your learning dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-white/20 hover:border-red-500/50 text-gray-400 hover:text-red-400 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-400">{orders.length}</p>
            <p className="text-gray-400 text-sm mt-1">Courses Enrolled</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-green-400">
              {orders.reduce((acc, o) => acc + (o.course.lessons?.length || 0), 0)}
            </p>
            <p className="text-gray-400 text-sm mt-1">Total Lessons</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-purple-400">∞</p>
            <p className="text-gray-400 text-sm mt-1">Lifetime Access</p>
          </div>
        </div>

        {/* My Courses */}
        <h2 className="text-2xl font-bold mb-6">📚 My Courses</h2>

        {loading && (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🎓</p>
            <p className="text-gray-400 mb-6">You haven't enrolled in any courses yet</p>
            <Link
              href="/courses"
              className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Browse Courses →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all"
            >
              {/* My Certificates */}
{certificates.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-6">🎓 My Certificates</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <div key={cert.id} className="bg-[#111827] border border-green-500/30 rounded-2xl p-6">
          <div className="text-4xl mb-4">📜</div>
          <h3 className="font-bold mb-2">{cert.course.title}</h3>
          <p className="text-gray-400 text-sm mb-4">{cert.course.level}</p>
          <a
            href={cert.certificateUrl}
            target="_blank"
            className="block text-center bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            📥 Download Certificate
          </a>
        </div>
      ))}
    </div>
  </div>
)}
              {/* Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-600 to-blue-800">
                {order.course.thumbnail ? (
                  <img
                    src={order.course.thumbnail}
                    alt={order.course.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl">🎓</div>
                )}
              </div>

              <div className="p-5">
                <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                  {order.course.level}
                </span>
                <h3 className="font-bold mt-3 mb-1">{order.course.title}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {order.course.lessons?.length || 0} lessons
                </p>
                <Link
                  href={`/courses/${order.course.id}`}
                  className="block text-center bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  Continue Learning →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}