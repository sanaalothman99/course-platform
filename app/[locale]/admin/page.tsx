"use client"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import Navbar from "../components/Navbar"

function ResetDevice() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [success, setSuccess] = useState("")
  const t = useTranslations("admin")

  const searchUsers = async (query: string) => {
    setSearch(query)
    if (!query) { setUsers([]); return }
    const token = localStorage.getItem("token")
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    const filtered = (Array.isArray(data) ? data : []).filter((u: any) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    )
    setUsers(filtered)
  }

  const resetDevice = async (userId: string) => {
    const token = localStorage.getItem("token")
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-device`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    })
    setSuccess(t("deviceResetSuccess"))
    setUsers([])
    setSearch("")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-12">
      <h2 className="text-xl font-bold mb-4">{t("resetDeviceTitle")}</h2>
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
          {success}
        </div>
      )}
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => searchUsers(e.target.value)}
        className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
      />
      {users.map((user) => (
        <div key={user.id} className="bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {user.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => resetDevice(user.id)}
            className="bg-red-600/20 text-red-400 border border-red-400/30 px-3 py-1 rounded-lg text-xs hover:bg-red-600/30 transition-colors"
          >
            {t("resetDevice")}
          </button>
        </div>
      ))}
    </div>
  )
}

export default function Admin() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations("admin")
  const tc = useTranslations("common")
  const tf = useTranslations("footer")

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
    if (!confirm(t("deleteConfirm"))) return
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
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">

        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t("dashTitle")}</h1>
          <p className="text-gray-400">{t("dashSubtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">{t("totalStudents")}</p>
            <p className="text-4xl font-bold text-blue-400">
              {new Set(orders.map((o: any) => o.user?.id)).size}
            </p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">{t("totalCourses")}</p>
            <p className="text-4xl font-bold text-green-400">{courses.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">{t("totalOrders")}</p>
            <p className="text-4xl font-bold text-purple-400">{orders.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">{t("totalRevenue")}</p>
            <p className="text-4xl font-bold text-yellow-400">${totalRevenue}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-6">{t("quickActions")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/admin/courses/new" className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-4xl">➕</div>
            <div>
              <h3 className="font-bold">{t("addCourse")}</h3>
              <p className="text-gray-400 text-sm">{t("addCourseDesc")}</p>
            </div>
          </Link>
          <Link href="/admin/comments" className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-4xl">💬</div>
            <div>
              <h3 className="font-bold">{t("viewComments")}</h3>
              <p className="text-gray-400 text-sm">{t("viewCommentsDesc")}</p>
            </div>
          </Link>
          <Link href="/admin/orders" className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-4xl">💳</div>
            <div>
              <h3 className="font-bold">{t("viewOrders")}</h3>
              <p className="text-gray-400 text-sm">{t("viewOrdersDesc")}</p>
            </div>
          </Link>
        </div>
        <ResetDevice />

    {/* Courses - Mobile Friendly */}
<h2 className="text-2xl font-bold mb-6">{t("coursesTable")}</h2>

{/* Desktop Table */}
<div className="hidden md:block bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/10 bg-white/5">
        <th className="text-left px-6 py-4 text-gray-400 text-sm">{t("colCourse")}</th>
        <th className="text-left px-6 py-4 text-gray-400 text-sm">{t("colPrice")}</th>
        <th className="text-left px-6 py-4 text-gray-400 text-sm">{t("colLevel")}</th>
        <th className="text-left px-6 py-4 text-gray-400 text-sm">{t("colStatus")}</th>
        <th className="text-left px-6 py-4 text-gray-400 text-sm">{t("colActions")}</th>
      </tr>
    </thead>
    <tbody>
      {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">{tc("loading")}</td></tr>}
      {!loading && courses.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">{t("noCourses")}</td></tr>}
      {courses.map((course) => (
        <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 font-medium">{course.title}</td>
          <td className="px-6 py-4 text-gray-300">${course.price}</td>
          <td className="px-6 py-4 text-gray-300">{course.level}</td>
          <td className="px-6 py-4">
            {course.comingSoon ? (
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">{t("statusComingSoon")}</span>
            ) : (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">{t("statusActive")}</span>
            )}
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-3">
              <Link href={`/admin/courses/${course.id}`} className="text-blue-400 hover:text-blue-300 text-sm">{t("manage")}</Link>
              <button onClick={() => deleteCourse(course.id)} className="text-red-400 hover:text-red-300 text-sm">{tc("delete")}</button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Cards */}
<div className="md:hidden flex flex-col gap-4">
  {loading && <p className="text-center text-gray-400">{tc("loading")}</p>}
  {!loading && courses.length === 0 && <p className="text-center text-gray-400">{t("noCourses")}</p>}
  {courses.map((course) => (
    <div key={course.id} className="bg-[#111827] border border-white/10 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm flex-1">{course.title}</h3>
        {course.comingSoon ? (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs ml-2">{t("statusComingSoonShort")}</span>
        ) : (
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs ml-2">{t("statusActive")}</span>
        )}
      </div>
      <div className="flex gap-4 text-sm text-gray-400 mb-4">
        <span>${course.price}</span>
        <span>{course.level}</span>
      </div>
      <div className="flex gap-3">
        <Link href={`/admin/courses/${course.id}`} className="flex-1 text-center bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl text-sm">
          {t("manage")}
        </Link>
        <button onClick={() => deleteCourse(course.id)} className="flex-1 bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm">
          {tc("delete")}
        </button>
      </div>
    </div>
  ))}
</div>

      </div>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm mt-12">
        {tf("copy")}
      </footer>

    </main>
    </>
  )
}
