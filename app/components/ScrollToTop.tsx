"use client"
import { useState, useEffect } from "react"

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-colors z-50"
    >
      ↑
    </button>
  )
}