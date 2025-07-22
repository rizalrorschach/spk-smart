import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { UserCircle } from "lucide-react"

export default function DataProfilPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      setEmail(data?.user?.email || null)
      setLoading(false)
    }
    getUser()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <UserCircle className="w-16 h-16 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold mb-1">Profil Pengguna</h1>
        <p className="text-slate-500 mb-6 text-center">Informasi akun Anda di aplikasi SPK SMART</p>
        <div className="w-full">
          <div className="mb-2 text-slate-700 font-medium">Email</div>
          {loading ? (
            <div className="text-slate-400">Memuat...</div>
          ) : (
            <div className="text-lg font-mono bg-slate-100 rounded px-3 py-2">{email}</div>
          )}
        </div>
      </div>
    </div>
  )
} 