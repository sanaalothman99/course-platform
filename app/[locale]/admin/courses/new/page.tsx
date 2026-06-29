"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import Navbar from "../../../components/Navbar"

export default function NewCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [translating, setTranslating] = useState<"title" | "description" | null>(null)
  const t = useTranslations("newCourse")
  const [form, setForm] = useState({
    title: "",
    description: "",
    titleAr: "",
    descriptionAr: "",
    price: "",
    level: "",
    hasLevels: false,
    comingSoon: false,
    image: null as File | null,
  })

  const translateField = async (field: "title" | "description") => {
    const text = field === "title" ? form.title : form.description
    if (!text) return
    setTranslating(field)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (field === "title") setForm((f) => ({ ...f, titleAr: data.translated }))
      else setForm((f) => ({ ...f, descriptionAr: data.translated }))
    } finally {
      setTranslating(null)
    }
  }

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
          titleAr: form.titleAr,
          descriptionAr: form.descriptionAr,
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
        alert(t("errorCreating"))
      }
    } catch {
      alert(t("error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t("courseTitle")}</label>
            <input
              type="text"
              placeholder={t("titlePlaceholder")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Title Arabic */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400 block">{t("titleAr")}</label>
              <button
                type="button"
                onClick={() => translateField("title")}
                disabled={!form.title || translating === "title"}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                {translating === "title" ? t("translating") : t("translateAuto")}
              </button>
            </div>
            <input
              type="text"
              dir="rtl"
              placeholder={t("titleArPlaceholder")}
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t("description")}</label>
            <textarea
              rows={4}
              placeholder={t("descPlaceholder")}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Description Arabic */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400 block">{t("descriptionAr")}</label>
              <button
                type="button"
                onClick={() => translateField("description")}
                disabled={!form.description || translating === "description"}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                {translating === "description" ? t("translating") : t("translateAuto")}
              </button>
            </div>
            <textarea
              rows={4}
              dir="rtl"
              placeholder={t("descArPlaceholder")}
              value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t("price")}</label>
            <input
              type="number"
              placeholder={t("pricePlaceholder")}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Level */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t("level")}</label>
            <input
              type="text"
              placeholder={t("levelPlaceholder")}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-400 block">{t("courseOptions")}</label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasLevels}
                onChange={(e) => setForm({ ...form, hasLevels: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="text-sm">{t("hasLevelsLabel")}</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.comingSoon}
                onChange={(e) => setForm({ ...form, comingSoon: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="text-sm">{t("comingSoonLabel")}</span>
            </label>
          </div>

          {/* Image */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t("courseImage")}</label>
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
              {t("cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.title || !form.description || !form.price}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {loading ? t("creating") : t("createCourse")}
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
