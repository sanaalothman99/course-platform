"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../../components/Navbar"

export default function NewCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    hasLevels: false,
    comingSoon: false,
    image: null as File | null,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm({ ...form, image: file })
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      let imageUrl = ""
      if (form.image) {
        const formData = new FormData()
        formData.append("file", form.image)
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image/course-images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          level: form.level,
          hasLevels: form.hasLevels,
          comingSoon: form.comingSoon,
          thumbnail: imageUrl,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (form.hasLevels) {
          router.push(`/admin/courses/${data.id}`)
        } else {
          router.push("/admin")
        }
      } else {
        alert("Error creating course")
      }
    } catch {
      alert("Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">➕ Add New Course</h1>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Course Title *</label>
            <input
              type="text"
              placeholder="e.g. PLC Basic Course"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Description *</label>
            <textarea
              rows={4}
              placeholder="Describe what students will learn..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Price (USD) *</label>
            <input
              type="number"
              placeholder="79"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Level */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Level *</label>
            <input
              type="text"
              placeholder="e.g. Beginner, Advanced, Profibus..."
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-400 block">Course Options</label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasLevels}
                onChange={(e) => setForm({ ...form, hasLevels: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="text-sm">This course has multiple levels (Basic, Advanced...)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.comingSoon}
                onChange={(e) => setForm({ ...form, comingSoon: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="text-sm">Coming Soon — not available for purchase yet</span>
            </label>
          </div>

          {/* Image */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Course Image</label>
            {preview && (
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-3" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => router.push("/admin")}
              className="flex-1 border border-white/20 hover:border-white/40 text-white py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.title || !form.description || !form.price}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {loading ? "Creating..." : "Create Course →"}
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}