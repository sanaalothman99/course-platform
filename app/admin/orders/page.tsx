"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"

type Order = {
  id: string
  paidAt: string
  user: {
    id: string
    name: string
    email: string
  }
  course: {
    id: string
    title: string
    price: number
  }
}

export default function AdminOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = orders.reduce((acc, o) => acc + (o.course?.price || 0), 0)

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-12">

        <div className="mb-8">
          <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white text-sm mb-2 block">
            ← Back to Admin
          </button>
          <h1 className="text-3xl font-bold">💳 Orders</h1>
          <p className="text-gray-400 mt-1">{orders.length} total orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Orders</p>
            <p className="text-4xl font-bold text-blue-400">{orders.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-green-400">${totalRevenue}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold text-purple-400">
              {new Set(orders.map(o => o.user?.id)).size}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Student</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Course</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Price</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No orders yet</td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-gray-400 text-sm">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{order.course?.title}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">${order.course?.price}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}