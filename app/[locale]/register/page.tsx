"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import Navbar from "../components/Navbar"

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const t = useTranslations("register")

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        setError(data.message || t("errorGeneric"))
      }
    } catch {
      setError(t("errorGeneric"))
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
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-gray-400">{t("subtitle")}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 flex flex-col gap-5">
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">{t("nameLabel")}</label>
              <input type="text" placeholder={t("namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">{t("emailLabel")}</label>
              <input type="email" placeholder={t("emailPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">{t("passwordLabel")}</label>
              <input type="password" placeholder={t("passwordPlaceholder")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <button onClick={handleRegister} disabled={loading || !form.name || !form.email || !form.password}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors">
              {loading ? t("creating") : t("createBtn")}
            </button>
            <p className="text-center text-gray-400 text-sm">
              {t("hasAccount")}{" "}
              <Link href="/login/member" className="text-blue-400 hover:underline">{t("login")}</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
