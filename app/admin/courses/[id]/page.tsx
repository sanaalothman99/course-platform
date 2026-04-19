"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Navbar from "../../../components/Navbar"

type Lesson = {
  id: string
  title: string
  position: number
  videoUrl?: string
  description?: string
  pdfUrl?: string
  chapterId?: string
}

type Chapter = {
  id: string
  title: string
  position: number
  lessons: Lesson[]
}

type SubCourse = {
  id: string
  title: string
  level: string
  price: number
  description: string
  thumbnail?: string
  lessons: Lesson[]
}
function UserSearch({ onGrant }: { onGrant: (userId: string) => void }) {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const searchUsers = async (query: string) => {
    setSearch(query)
    if (!query) { setUsers([]); return }
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("process.env.NEXT_PUBLIC_API_URL/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const filtered = (Array.isArray(data) ? data : []).filter((u: any) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
      setUsers(filtered)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => searchUsers(e.target.value)}
        className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
      />

      {loading && <p className="text-gray-400 text-sm">Searching...</p>}

      {users.length > 0 && !selectedUser && (
        <div className="flex flex-col gap-2 mb-3">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => { setSelectedUser(user); setUsers([]) }}
              className="bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-500/50 transition-all flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                {user.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="bg-[#0a0f1e] border border-blue-500/30 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {selectedUser.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{selectedUser.name}</p>
              <p className="text-gray-400 text-xs">{selectedUser.email}</p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedUser(null); setSearch("") }}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <button
        onClick={() => selectedUser && onGrant(selectedUser.id)}
        disabled={!selectedUser}
        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 w-full py-3 rounded-xl font-semibold transition-colors"
      >
        Grant Access
      </button>
    </div>
  )
}

export default function ManageCourse() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string

  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [subCourses, setSubCourses] = useState<SubCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null)
  const [uploadingPreview, setUploadingPreview] = useState(false)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [editingChapter, setEditingChapter] = useState<string | null>(null)
  const [newLesson, setNewLesson] = useState({ title: "", position: 1 })
  const [newChapter, setNewChapter] = useState({ title: "", position: 1 })
  const [editForm, setEditForm] = useState({ title: "", description: "" })
  const [editChapterTitle, setEditChapterTitle] = useState("")
  const [addingLessonToChapter, setAddingLessonToChapter] = useState<string | null>(null)
  const [chapterLesson, setChapterLesson] = useState({ title: "", position: 1 })
  const [grantForm, setGrantForm] = useState({ userId: "" })
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantSuccess, setGrantSuccess] = useState("")
  const [showSubCourseForm, setShowSubCourseForm] = useState(false)
  const [subCourseForm, setSubCourseForm] = useState({
    title: "",
    level: "",
    price: "",
    description: "",
    image: null as File | null,
    preview: "",
  })

  useEffect(() => {
    if (!courseId) return
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    const token = localStorage.getItem("token")
    const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setCourse(data)
    setLessons(data.lessons || [])
    setChapters(data.chapters || [])
    setNewLesson(prev => ({ ...prev, position: (data.lessons?.length || 0) + 1 }))
    setNewChapter(prev => ({ ...prev, position: (data.chapters?.length || 0) + 1 }))

    if (data.hasLevels) {
      const subRes = await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}/sub-courses`)
      const subData = await subRes.json()
      setSubCourses(Array.isArray(subData) ? subData : [])
    }
  }

  const uploadPreviewVideo = async (file: File) => {
    setUploadingPreview(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/upload/video/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}/preview`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ previewUrl: data.url }),
        })
        fetchCourse()
        alert("Preview video uploaded!")
      }
    } finally {
      setUploadingPreview(false)
    }
  }

  const addChapter = async () => {
    if (!newChapter.title) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newChapter),
      })
      setNewChapter({ title: "", position: chapters.length + 2 })
      fetchCourse()
    } finally {
      setLoading(false)
    }
  }

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("Delete this chapter and all its lessons?")) return
    const token = localStorage.getItem("token")
    await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/chapters/${chapterId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCourse()
  }

  const addLessonToChapter = async (chapterId: string) => {
    if (!chapterLesson.title) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/chapters/${chapterId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...chapterLesson, courseId }),
      })
      setChapterLesson({ title: "", position: 1 })
      setAddingLessonToChapter(null)
      fetchCourse()
    } finally {
      setLoading(false)
    }
  }

  const addLesson = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/${courseId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLesson),
      })
      if (res.ok) {
        setNewLesson({ title: "", position: lessons.length + 2 })
        fetchCourse()
      }
    } finally {
      setLoading(false)
    }
  }

  const updateLesson = async (lessonId: string) => {
    const token = localStorage.getItem("token")
    await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/lessons/${lessonId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    })
    setEditingLesson(null)
    fetchCourse()
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return
    const token = localStorage.getItem("token")
    await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/lessons/${lessonId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCourse()
  }

  const uploadVideo = async (lessonId: string, file: File) => {
    setUploadingLesson(lessonId)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/upload/video/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/lessons/${lessonId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ videoUrl: data.url }),
        })
        fetchCourse()
      }
    } finally {
      setUploadingLesson(null)
    }
  }

  const uploadPdf = async (lessonId: string, file: File) => {
    setUploadingPdf(lessonId)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/upload/pdf/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/lessons/${lessonId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pdfUrl: data.url }),
        })
        fetchCourse()
      }
    } finally {
      setUploadingPdf(null)
    }
  }

 const grantAccess = async (userId?: string) => {
  const id = userId || grantForm.userId
  if (!id) return
  setGrantLoading(true)
  try {
    const token = localStorage.getItem("token")
    const res = await fetch("process.env.NEXT_PUBLIC_API_URL/orders/grant-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: id, courseId }),
    })
    const data = await res.json()
    setGrantSuccess(data.message || "Access granted!")
  } finally {
    setGrantLoading(false)
  }
}

  const addSubCourse = async () => {
    if (!subCourseForm.title) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      let imageUrl = ""
      if (subCourseForm.image) {
        const formData = new FormData()
        formData.append("file", subCourseForm.image)
        const uploadRes = await fetch(`process.env.NEXT_PUBLIC_API_URL/upload/image/${courseId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      await fetch("process.env.NEXT_PUBLIC_API_URL/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: subCourseForm.title,
          description: subCourseForm.description,
          price: parseFloat(subCourseForm.price) || course.price,
          level: subCourseForm.level,
          hasLevels: false,
          parentId: courseId,
          thumbnail: imageUrl,
        }),
      })
      setSubCourseForm({ title: "", level: "", price: "", description: "", image: null, preview: "" })
      setShowSubCourseForm(false)
      fetchCourse()
    } finally {
      setLoading(false)
    }
  }

  const LessonCard = ({ lesson }: { lesson: Lesson }) => (
    <div className="bg-[#0d1426] border border-white/5 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-blue-400 text-xs font-bold mr-2">#{lesson.position}</span>
          <span className="text-sm font-medium">{lesson.title}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingLesson(lesson.id)
              setEditForm({ title: lesson.title, description: lesson.description || "" })
            }}
            className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 border border-blue-400/30 rounded-lg"
          >
            ✏️
          </button>
          <button
            onClick={() => deleteLesson(lesson.id)}
            className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/30 rounded-lg"
          >
            🗑️
          </button>
        </div>
      </div>

      {editingLesson === lesson.id && (
        <div className="bg-[#111827] rounded-xl p-3 mb-3 flex flex-col gap-2">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="Lesson title..."
          />
          <textarea
            rows={2}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Description..."
          />
          <div className="flex gap-2">
            <button onClick={() => updateLesson(lesson.id)} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-xs font-semibold">Save</button>
            <button onClick={() => setEditingLesson(null)} className="border border-white/20 px-3 py-1 rounded-lg text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-2">
        {lesson.videoUrl ? <span className="text-green-400 text-xs">✅ Video</span> : <span className="text-yellow-400 text-xs">⚠️ No video</span>}
        {lesson.pdfUrl ? <span className="text-green-400 text-xs">✅ PDF</span> : <span className="text-gray-500 text-xs">📄 No PDF</span>}
      </div>

      <div className="flex gap-2">
        <label className="cursor-pointer bg-[#111827] border border-white/10 hover:border-blue-500 px-3 py-1 rounded-lg text-xs transition-colors">
          {uploadingLesson === lesson.id ? "Uploading..." : "📹 Video"}
          <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(lesson.id, f) }} />
        </label>
        <label className="cursor-pointer bg-[#111827] border border-white/10 hover:border-purple-500 px-3 py-1 rounded-lg text-xs transition-colors">
          {uploadingPdf === lesson.id ? "Uploading..." : "📄 PDF"}
          <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPdf(lesson.id, f) }} />
        </label>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white text-sm mb-2 block">
            ← Back to Admin
          </button>
          <h1 className="text-3xl font-bold">{course?.title || "Loading..."}</h1>
        </div>

        {/* Preview Video */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-2">🎬 Preview Video</h2>
          <p className="text-gray-400 text-sm mb-4">Free video visible to all visitors before purchase</p>
          {course?.previewUrl && (
            <video src={course.previewUrl} controls className="w-full rounded-xl mb-4 max-h-48" />
          )}
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-semibold transition-colors inline-block">
            {uploadingPreview ? "Uploading..." : "📹 Upload Preview Video"}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPreviewVideo(f) }}
            />
          </label>
        </div>
              {/* Grant Access */}
<div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-8">
  <h2 className="text-xl font-bold mb-4">🎁 Grant Free Access</h2>
  {grantSuccess && (
    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
      ✅ {grantSuccess}
    </div>
  )}
<UserSearch onGrant={(userId) => {
  grantAccess(userId)
}} />
</div>
   

        {/* إذا كورس فيه مستويات */}
        {course?.hasLevels ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">📚 Course Levels</h2>
              <button
                onClick={() => setShowSubCourseForm(!showSubCourseForm)}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                ➕ Add Level
              </button>
            </div>

            {showSubCourseForm && (
              <div className="bg-[#111827] border border-blue-500/30 rounded-2xl p-6 mb-6 flex flex-col gap-4">
                <h3 className="font-bold text-blue-400">➕ New Level</h3>
                <input type="text" placeholder="Level title" value={subCourseForm.title} onChange={(e) => setSubCourseForm({ ...subCourseForm, title: e.target.value })} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                <input type="text" placeholder="Level type e.g. Beginner, Profibus..." value={subCourseForm.level} onChange={(e) => setSubCourseForm({ ...subCourseForm, level: e.target.value })} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                <textarea rows={3} placeholder="Level description..." value={subCourseForm.description} onChange={(e) => setSubCourseForm({ ...subCourseForm, description: e.target.value })} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
                <input type="number" placeholder={`Price (default: $${course?.price})`} value={subCourseForm.price} onChange={(e) => setSubCourseForm({ ...subCourseForm, price: e.target.value })} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Level Image</label>
                  {subCourseForm.preview && <img src={subCourseForm.preview} alt="Preview" className="w-full h-40 object-contain rounded-xl mb-3 bg-[#0a0f1e]" />}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSubCourseForm({ ...subCourseForm, image: f, preview: URL.createObjectURL(f) }) }} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-3">
                  <button onClick={addSubCourse} disabled={loading || !subCourseForm.title} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-colors">{loading ? "Adding..." : "Add Level"}</button>
                  <button onClick={() => setShowSubCourseForm(false)} className="border border-white/20 px-6 py-3 rounded-xl transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subCourses.length === 0 && <p className="text-gray-400 col-span-2 text-center py-8">No levels yet</p>}
              {subCourses.map((sub) => (
                <div key={sub.id} className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all">
                  {sub.thumbnail && <img src={sub.thumbnail} alt={sub.title} className="w-full h-32 object-contain bg-[#0a0f1e]" />}
                  <div className="p-5">
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{sub.level}</span>
                    <h3 className="font-bold mt-3 mb-1">{sub.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{sub.description}</p>
                    <p className="text-gray-400 text-sm mb-4">${sub.price} · {sub.lessons?.length || 0} lessons</p>
                    <button onClick={() => router.push(`/admin/courses/${sub.id}`)} className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Manage Level →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Chapters Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📚 Chapters & Lessons</h2>
              </div>

              {/* Add Chapter */}
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="font-bold mb-4">➕ Add Chapter</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Chapter title..."
                    value={newChapter.title}
                    onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                    className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Position"
                    value={newChapter.position}
                    onChange={(e) => setNewChapter({ ...newChapter, position: parseInt(e.target.value) })}
                    className="w-24 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={addChapter}
                    disabled={loading || !newChapter.title}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {loading ? "..." : "Add"}
                  </button>
                </div>
              </div>

              {/* Chapters List */}
              {chapters.length > 0 && (
                <div className="flex flex-col gap-4 mb-8">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-[#111827] border border-white/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400 font-bold">#{chapter.position}</span>
                          {editingChapter === chapter.id ? (
                            <input
                              type="text"
                              value={editChapterTitle}
                              onChange={(e) => setEditChapterTitle(e.target.value)}
                              className="bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <h3 className="font-bold text-lg">{chapter.title}</h3>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingChapter === chapter.id ? (
                            <>
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem("token")
                                  await fetch(`process.env.NEXT_PUBLIC_API_URL/courses/chapters/${chapter.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token }`},
                                    body: JSON.stringify({ title: editChapterTitle }),
                                  })
                                  setEditingChapter(null)
                                  fetchCourse()
                                }}
                                className="bg-blue-600 px-3 py-1 rounded-lg text-xs"
                              >Save</button>
                              <button onClick={() => setEditingChapter(null)} className="border border-white/20 px-3 py-1 rounded-lg text-xs">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingChapter(chapter.id); setEditChapterTitle(chapter.title) }}
                                className="text-blue-400 text-sm px-3 py-1 border border-blue-400/30 rounded-lg"
                              >✏️</button>
                              <button
                                onClick={() => deleteChapter(chapter.id)}
                                className="text-red-400 text-sm px-3 py-1 border border-red-400/30 rounded-lg"
                              >🗑️</button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Chapter Lessons */}
                      <div className="flex flex-col gap-3 mb-4">
                        {chapter.lessons.length === 0 && (
                          <p className="text-gray-500 text-sm">No lessons yet</p>
                        )}
                        {chapter.lessons
                          .sort((a, b) => a.position - b.position)
                          .map((lesson) => (
                            <LessonCard key={lesson.id} lesson={lesson} />
                          ))}
                      </div>

                      {/* Add Lesson to Chapter */}
                      {addingLessonToChapter === chapter.id ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Lesson title..."
                            value={chapterLesson.title}
                            onChange={(e) => setChapterLesson({ ...chapterLesson, title: e.target.value })}
                            className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => addLessonToChapter(chapter.id)}
                            disabled={loading || !chapterLesson.title}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-semibold"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setAddingLessonToChapter(null)}
                            className="border border-white/20 px-4 py-2 rounded-xl text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingLessonToChapter(chapter.id); setChapterLesson({ title: "", position: chapter.lessons.length + 1 }) }}
                          className="text-blue-400 hover:text-blue-300 text-sm border border-blue-400/30 hover:border-blue-400 px-4 py-2 rounded-xl transition-colors"
                        >
                          ➕ Add Lesson
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Lessons without chapter */}
              {lessons.length > 0 && (
                <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold mb-4">📄 Lessons without chapter</h3>
                  <div className="flex flex-col gap-3">
                    {lessons.sort((a, b) => a.position - b.position).map((lesson) => (
                      <LessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                </div>
              )}

              {/* Add Standalone Lesson */}
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold mb-4">➕ Add Standalone Lesson</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Lesson title..."
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Position"
                    value={newLesson.position}
                    onChange={(e) => setNewLesson({ ...newLesson, position: parseInt(e.target.value) })}
                    className="w-24 bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={addLesson}
                    disabled={loading || !newLesson.title}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {loading ? "..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}