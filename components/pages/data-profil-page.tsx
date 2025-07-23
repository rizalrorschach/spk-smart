import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { UserCircle, Mail, Shield, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DataProfilPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMetadata, setUserMetadata] = useState<{ full_name?: string; [key: string]: unknown } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      setEmail(data?.user?.email || null)
      setUserMetadata(data?.user?.user_metadata || {})
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <UserCircle className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
          <p className="text-sm text-gray-600 mt-1">Informasi akun Anda di SPK SMART</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-4 bg-indigo-100 rounded-full w-fit">
                  <UserCircle className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl text-gray-900">
                    {userMetadata?.full_name || "Pengguna SPK SMART"}
                  </CardTitle>
                  <p className="text-gray-600">Pengguna Sistem</p>
                  <Badge variant="outline" className="w-fit">
                    <Shield className="w-3 h-3 mr-1" />
                    Aktif
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </Label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5 border">
                    <span className="text-gray-900 font-mono text-sm">
                      {email || "Tidak tersedia"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Status
                  </Label>
                  <div className="bg-green-50 rounded-lg px-3 py-2.5 border border-green-200">
                    <span className="text-green-800 font-medium text-sm">
                      Akun Aktif
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">SMART</div>
                <div className="text-sm text-blue-700">Metode Perhitungan</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">SPK</div>
                  <div className="text-xs text-gray-600">Sistem</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">2025</div>
                  <div className="text-xs text-gray-600">Tahun</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">Tentang SPK SMART</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">SMART</strong> (Simple Multi-Attribute Rating Technique) 
                  adalah metode pengambilan keputusan multi-kriteria.
                </p>
                <p>
                  Sistem ini membantu dalam pemilihan karyawan terbaik berdasarkan 
                  kriteria yang telah ditentukan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper component for labels
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string
  children: React.ReactNode
}) {
  return <label className={className} {...props}>{children}</label>
} 