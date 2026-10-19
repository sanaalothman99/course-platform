import { useTranslations } from "next-intl"
import Link from "next/link"

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-8xl mb-8">🔧</div>
        <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
        <p className="text-gray-400 text-lg mb-8">
          We're working hard to improve your experience. We'll be back shortly!
        </p>
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
          <p className="text-blue-400 text-sm">
            🚀 A to Z Automation — Professional PLC Training
          </p>
        </div>
      </div>
    </main>
  )
}