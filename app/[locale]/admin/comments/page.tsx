"use client"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import Navbar from "../../components/Navbar"

type Comment = {
  id: string; content: string; createdAt: string
  user: { name: string; email: string }
  lesson: { title: string }
  replies: { id: string; content: string; user: { name: string } }[]
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const t = useTranslations("adminComments")

  useEffect(() => { fetchComments() }, [])

  const fetchComments = async () => {
    const token = localStorage.getItem("token")
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/all`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setComments(data)
  }

  const sendReply = async (commentId: string, lessonId: string) => {
    if (!replyText[commentId]) return
    setLoading(commentId)
    try {
      const token = localStorage.getItem("token")
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/reply/${commentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyText[commentId], lessonId }),
      })
      setReplyText({ ...replyText, [commentId]: "" })
      fetchComments()
    } finally { setLoading(null) }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
        {comments.length === 0 && <div className="text-center text-gray-400 py-12">{t("empty")}</div>}
        <div className="flex flex-col gap-6">
          {(Array.isArray(comments) ? comments : []).map((comment) => (
            <div key={comment.id} className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-blue-400">{comment.user.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{comment.user.email}</span>
                </div>
                <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-500 text-xs mb-2">{t("lessonLabel")} {comment.lesson?.title}</p>
              <p className="text-gray-300 mb-4">{comment.content}</p>
              {comment.replies.length > 0 && (
                <div className="border-l-2 border-blue-500/30 pl-4 mb-4 flex flex-col gap-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-[#0a0f1e] rounded-xl p-3">
                      <span className="text-green-400 text-sm font-semibold">✅ {reply.user.name} {t("adminTag")}</span>
                      <p className="text-gray-300 text-sm mt-1">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <input type="text" placeholder={t("replyPlaceholder")} value={replyText[comment.id] || ""}
                  onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                  className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                <button onClick={() => sendReply(comment.id, comment.lesson?.title)} disabled={loading === comment.id || !replyText[comment.id]}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  {loading === comment.id ? "..." : t("replyBtn")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
