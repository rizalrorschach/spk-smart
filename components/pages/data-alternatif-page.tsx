import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState } from "react"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
        <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={onClose}>&times;</button>
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Data Alternatif</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openAdd}>+ Tambah Kandidat</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c: Candidate) => (
              <tr key={c.id} className="border-b">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">
                  <button className="text-yellow-600 hover:underline mr-2" onClick={() => openEdit(c)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => deleteCandidate(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-bold mb-2">{editCandidate ? "Edit Kandidat" : "Tambah Kandidat"}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Kandidat</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={candidateName}
              onChange={e => setCandidateName(e.target.value)}
              required
            />
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={formLoading}>
              {formLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 