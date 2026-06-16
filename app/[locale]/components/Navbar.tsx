"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter, usePathname } from "@/i18n/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("nav")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en"
    router.replace(pathname, { locale: next })
  }

  return (
    <nav className="flex justify-between items-center px-10 py-5 border-b border-white/10 bg-black sticky top-0 z-50">

      <Link href="/">
        <Image src="/logo.jpg" alt="A to Z Automation" width={180} height={60} className="logo-animate mix-blend-lighten" />
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex gap-8 text-sm text-gray-300 items-center font-medium">
        <Link href="/courses" className="hover:text-blue-400 transition-colors">{t("courses")}</Link>
        <Link href="/contact" className="hover:text-blue-400 transition-colors">{t("contact")}</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="hover:text-blue-400 transition-colors text-gray-300"
            >
              {user.role === "ADMIN" ? `⚙️ ${t("admin")}` : `👋 ${user.name}`}
            </Link>
            <button
              onClick={handleLogout}
              className="border border-white/20 hover:border-red-500/50 text-gray-400 hover:text-red-400 px-4 py-2 rounded-full text-sm transition-colors"
            >
              {t("logout")}
            </button>
          </div>
        ) : (
          <Link href="/login/member" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm transition-colors">
            {t("login")}
          </Link>
        )}

        {/* Language Toggle */}
        <button
          onClick={toggleLocale}
          className="border border-white/20 hover:border-blue-400 text-gray-300 hover:text-blue-400 px-3 py-1.5 rounded-full text-sm font-bold transition-colors"
        >
          {locale === "en" ? "AR" : "EN"}
        </button>
      </div>

      {/* Mobile Button */}
      <button className="md:hidden text-white text-2xl" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 flex flex-col px-8 py-6 gap-6 text-gray-300 md:hidden">
          <Link href="/courses" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">{t("courses")}</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition-colors">{t("contact")}</Link>
          {user ? (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-400 transition-colors"
              >
                {user.role === "ADMIN" ? `⚙️ ${t("admin")}` : `👋 ${user.name}`}
              </Link>
              <button onClick={handleLogout} className="text-red-400 text-left">{t("logout")}</button>
            </>
          ) : (
            <Link href="/login/member" onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-full text-sm text-center transition-colors">
              {t("login")}
            </Link>
          )}
          <button
            onClick={toggleLocale}
            className="border border-white/20 text-gray-300 px-4 py-2 rounded-full text-sm font-bold w-fit transition-colors"
          >
            {locale === "en" ? "🌐 العربية" : "🌐 English"}
          </button>
        </div>
      )}
    </nav>
  )
}
