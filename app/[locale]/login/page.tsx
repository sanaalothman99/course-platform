import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

export default async function Login() {
  const t = await getTranslations("loginLanding")

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-8">

      {/* Logo */}
      <Link href="/" className="mb-16">
        <Image src="/logo.jpg" alt="A to Z Automation" width={160} height={50} className="mix-blend-lighten"/>
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-center mb-3 leading-tight">
        {t("title1")} <br /> {t("title2")}
      </h1>
      <p className="text-gray-400 italic text-center mb-10">
        {t("subtitle")}
      </p>

      {/* Divider + icon */}
      <div className="flex items-center gap-4 w-full max-w-sm mb-8">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-3xl">🎓</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Login Button */}
      <Link
        href="/login/member"
        className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white text-xl font-semibold py-5 rounded-2xl text-center transition-colors"
      >
        {t("loginButton")}
      </Link>

      {/* Divider + icon */}
      <div className="flex items-center gap-4 w-full max-w-sm mt-10 mb-8">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-3xl">✅</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Not enrolled */}
      <p className="text-gray-400 text-center text-sm max-w-xs">
        {t("notEnrolled")}
        <Link href="/courses" className="text-blue-400 underline hover:text-blue-300">
          {t("browseLink")}
        </Link>
        {t("notEnrolledEnd")}
      </p>

    </main>
  )
}
