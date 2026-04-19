"use client"
import { useState } from "react"
import Navbar from "../components/Navbar"

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) {
      setError("Please fill in all required fields")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("process.env.NEXT_PUBLIC_API_URL/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" })
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      {/* Header */}
      <section className="text-center py-20 px-4">
        <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1 rounded-full text-sm mb-6 inline-block">
          📬 Get In Touch
        </span>
        <h1 className="text-5xl font-extrabold mt-4 mb-4">Contact Us</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Have a question about our courses? We're here to help. Send us a message and we'll get back to you as soon as possible.
        </p>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-3xl">📧</div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <a href="mailto:Atoz96automation@gmail.com" className="text-blue-400 hover:underline font-medium">
                Atoz96automation@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-3xl">📞</div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Phone</p>
              <a href="tel:+4917661833596" className="text-blue-400 hover:underline font-medium">
                +49 176 61833596
              </a>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-3xl">⏱️</div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Response Time</p>
              <p className="font-medium">Within 24 hours</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/50 transition-all">
            <div className="text-3xl">🌍</div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Location</p>
              <p className="font-medium">Germany 🇩🇪</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">First Name *</label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email *</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Subject</label>
              <input
                type="text"
                placeholder="Question about PLC course..."
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Message *</label>
              <textarea
                rows={5}
                placeholder="How can we help you?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors mt-2"
            >
              {loading ? "Sending..." : "Send Message →"}
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        © 2025 A to Z Automation. All rights reserved.
      </footer>
    </main>
  )
}