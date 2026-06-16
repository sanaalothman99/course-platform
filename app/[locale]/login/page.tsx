import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function Login() {
  const t = useTranslations("login")
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-8">
      <Link href="/" className="mb-16">
        <Image src="/logo.jpg" alt="A to Z Automation" width={160} height={50} className="mix-blend-lighten" />
      </Link>
      <h1 className="text-4xl font-extrabold text-center mb-3 leading-tight">{t("title")}</h1>
      <p className="text-gray-400 italic text-center mb-10">{t("subtitle")}</p>
      <div className="flex items-center gap-4 w-full max-w-sm mb-8">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-3xl">🎓</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
      <Link href="/login/member" className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white text-xl font-semibold py-5 rounded-2xl text-center transition-colors">
        {t("memberBtn")}
      </Link>
      <div className="flex items-center gap-4 w-full max-w-sm mt-10 mb-8">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-3xl">✅</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
      <p className="text-gray-400 text-center text-sm max-w-xs">
        {t("notEnrolled")}{" "}
        <Link href="/courses" className="text-blue-400 underline hover:text-blue-300">{t("browseCourses")}</Link>{" "}
        {t("browseDesc")}
      </p>
    </main>
  )
}
