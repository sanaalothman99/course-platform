"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "../../components/Navbar"

export default function MemberLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

const handleLogin = async () => {
  setLoading(true)
  setError("")
  try {
    // نولد deviceId من المتصفح
    const deviceId = navigator.userAgent + screen.width + screen.height

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, deviceId }),
    })

    const data = await res.json()

    if (res.ok) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      if (data.user.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else if (res.status === 403) {
      setError("This account is already logged in on another device. Please contact support.")
    } else {
      setError("Invalid email or password")
    }
  } catch {
    setError("Something went wrong")
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-gray-400">Login to access your courses</p>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 flex flex-col gap-5">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !form.email || !form.password}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {loading ? "Logging in..." : "Login →"}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Register
              </Link>
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}