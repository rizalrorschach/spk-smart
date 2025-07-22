import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState } from "react"

interface Criteria {
  id: string
  name: string
  weight: number
  type: "benefit" | "cost"
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

export default function DataKriteriaPage() {
  const {
    criteria,
    addCriteria,
    updateCriteria,
    deleteCriteria,
  } = useSMARTCalculation()

  const [showModal, setShowModal] = useState(false)
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [criteriaName, setCriteriaName] = useState("")
  const [criteriaWeight, setCriteriaWeight] = useState(3)
  const [criteriaType, setCriteriaType] = useState<"benefit" | "cost">("benefit")

  const openAdd = () => {
    setEditCriteria(null)
    setCriteriaName("")
    setCriteriaWeight(3)
    setCriteriaType("benefit")
    setShowModal(true)
    setFormError("")
  }
  const openEdit = (c: Criteria) => {
    setEditCriteria(c)
    setCriteriaName(c.name)
    setCriteriaWeight(c.weight)
    setCriteriaType(c.type)
    setShowModal(true)
    setFormError("")
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    try {
      if (editCriteria) {
        await updateCriteria(editCriteria.id, { name: criteriaName, weight: criteriaWeight, type: criteriaType })
      } else {
        await addCriteria(criteriaName, criteriaWeight, criteriaType)
      }
      setShowModal(false)
    } catch (err) {
      setFormError((err as Error).message || "Gagal menyimpan kriteria")
    }
    setFormLoading(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Data Kriteria</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openAdd}>+ Tambah Kriteria</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">Bobot</th>
              <th className="px-3 py-2 text-left">Tipe</th>
              <th className="px-3 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((c: Criteria) => (
              <tr key={c.id} className="border-b">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.weight}</td>
                <td className="px-3 py-2 capitalize">{c.type}</td>
                <td className="px-3 py-2">
                  <button className="text-yellow-600 hover:underline mr-2" onClick={() => openEdit(c)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => deleteCriteria(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-bold mb-2">{editCriteria ? "Edit Kriteria" : "Tambah Kriteria"}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Kriteria</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={criteriaName}
              onChange={e => setCriteriaName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bobot</label>
            <input
              type="number"
              min={1}
              max={5}
              className="w-full border rounded px-3 py-2"
              value={criteriaWeight}
              onChange={e => setCriteriaWeight(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipe</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={criteriaType}
              onChange={e => setCriteriaType(e.target.value as "benefit" | "cost")}
              required
            >
              <option value="benefit">Benefit</option>
              <option value="cost">Cost</option>
            </select>
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