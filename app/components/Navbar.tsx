"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  const navLinks = [
    { href: "/courses", label: "Online Courses" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
  scrolled
    ? "bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-blue-500/20 shadow-lg shadow-blue-500/5"
    : "bg-transparent"
}`}>
  <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

    {/* Logo - أكبر ويسار */}
 <Link href="/">
  <div className="flex flex-col">
    <span className="text-2xl font-black text-white typewriter">
      A to Z Automation
    </span>
    <span className="text-xs tracking-[0.3em] text-blue-400 font-medium">
      PROFESSIONAL PLC TRAINING
    </span>
  </div>
</Link>
    {/* Desktop Menu - روابط أكبر */}
    <div className="hidden md:flex items-center gap-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`relative px-5 py-2 text-base font-semibold transition-all duration-300 rounded-full group ${
            pathname === link.href
              ? "text-blue-400"
              : "text-gray-300 hover:text-white"
          }`}
        >
          {link.label}
          <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-blue-400 transition-all duration-300 ${
            pathname === link.href ? "w-4/5" : "w-0 group-hover:w-4/5"
          }`} />
        </Link>
      ))}

            <div className="w-px h-5 bg-white/10 mx-2" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  {user.role === "ADMIN" ? "Admin" : user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 text-sm px-3 py-2 rounded-full hover:bg-red-400/10 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login/member"
                className="relative bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all"
          >
            <span className={`w-5 h-px bg-white transition-all duration-300 ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`w-5 h-px bg-white transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`w-5 h-px bg-white transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-[#0a0f1e]/98 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-white/5 my-2" />

            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  {user.role === "ADMIN" ? "Admin Panel" : user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 text-left transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login/member"
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-semibold text-center transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  )
}