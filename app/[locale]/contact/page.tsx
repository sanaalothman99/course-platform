"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Navbar from "../components/Navbar"

export default function Contact() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const t = useTranslations("contact")
  const tf = useTranslations("footer")

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) { setError(t("requiredError")); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${form.firstName} ${form.lastName}`, email: form.email, subject: form.subject, message: form.message }),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" })
      } else {
        setError(t("errorMsg"))
      }
    } catch {
      setError(t("errorMsg"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />
      <section className="text-center py-20 px-4">
        <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1 rounded-full text-sm mb-6 inline-block">{t("badge")}</span>
        <h1 className="text-5xl font-extrabold mt-4 mb-4">{t("title")}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t("desc")}</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          {[
            { icon: "📧", label: t("emailLabel"), value: <a href="mailto:Atoz96automation@gmail.com" className="text-blue-400 hover:underline font-medium">Atoz96automation@gmail.com</a> },
            { icon: "📞", label: t("phoneLabel"), value: <a href="tel:+4917661833596" className="text-blue-400 hover:underline font-medium">+49 176 61833596</a> },
            { icon: "⏱️", label: t("responseLabel"), value: <p className="font-medium">{t("responseValue")}</p> },
            { icon: "🌍", label: t("locationLabel"), value: <p className="font-medium">{t("locationValue")}</p> },
          ].map((item, i) => (
            <div key={i} className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">{t("formTitle")}</h2>
          {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">{t("successMsg")}</div>}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t("firstNameLabel")}</label>
                <input type="text" placeholder={t("firstNamePlaceholder")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t("lastNameLabel")}</label>
                <input type="text" placeholder={t("lastNamePlaceholder")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t("emailFieldLabel")}</label>
              <input type="email" placeholder={t("emailFieldPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t("subjectLabel")}</label>
              <input type="text" placeholder={t("subjectPlaceholder")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t("messageLabel")}</label>
              <textarea rows={5} placeholder={t("messagePlaceholder")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors mt-2">
              {loading ? t("sending") : t("sendBtn")}
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">{tf("copy")}</footer>
    </main>
  )
}
