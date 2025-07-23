import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Plus, Edit, Trash2 } from "lucide-react"

interface Candidate {
  id: string
  name: string
  scores?: { [criteriaId: string]: number }
  utilityScore?: number
  rank?: number
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl leading-none" 
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default function DataAlternatifPage() {
  const {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
  } = useSMARTCalculation()

  const [showModal, setShowModal] = useState(false)
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [candidateName, setCandidateName] = useState("")

  const openAdd = () => {
    setEditCandidate(null)
    setCandidateName("")
    setShowModal(true)
    setFormError("")
  }
  const openEdit = (c: Candidate) => {
    setEditCandidate(c)
    setCandidateName(c.name)
    setShowModal(true)
    setFormError("")
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    try {
      if (editCandidate) {
        await updateCandidate(editCandidate.id, { name: candidateName })
      } else {
        await addCandidate(candidateName)
      }
      setShowModal(false)
    } catch (err) {
      setFormError((err as Error).message || "Gagal menyimpan kandidat")
    }
    setFormLoading(false)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Alternatif</h1>
            <p className="text-sm text-gray-600 mt-1">Kelola kandidat yang akan dinilai</p>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kandidat
        </Button>
      </div>

      {/* Data Display */}
      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kandidat</h3>
            <p className="text-gray-600 text-center mb-4">Mulai dengan menambahkan kandidat pertama yang akan dinilai</p>
            <Button onClick={openAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kandidat Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {candidates.map((c: Candidate) => (
              <Card key={c.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
                        <p className="text-sm text-gray-600">Kandidat</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(c)}
                      className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCandidate(c.id)}
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Kandidat</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {candidates.map((c: Candidate) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-full">
                                <Users className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{c.name}</div>
                                <div className="text-sm text-gray-500">Kandidat</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(c)}
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCandidate(c.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="pr-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {editCandidate ? "Edit Kandidat" : "Tambah Kandidat"}
            </h2>
            <p className="text-sm text-gray-600">
              {editCandidate ? "Ubah informasi kandidat" : "Tambahkan kandidat baru untuk dinilai"}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kandidat
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                placeholder="Masukkan nama kandidat"
                required
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowModal(false)}
              className="order-2 sm:order-1"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={formLoading}
              className="bg-green-600 hover:bg-green-700 order-1 sm:order-2 flex-1"
            >
              {formLoading ? "Menyimpan..." : (editCandidate ? "Update" : "Simpan")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 