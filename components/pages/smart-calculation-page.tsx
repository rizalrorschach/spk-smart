"use client"
import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Calculator, RotateCcw, Save, Download, FileSpreadsheet, Plus } from "lucide-react"
import CriteriaWeightCard from "@/components/smart/criteria-weight-card"
import CandidateScoreCard from "@/components/smart/candidate-score-card"
import ResultsTable from "@/components/smart/results-table"

interface Criteria {
  id: string
  name: string
  weight: number
  type: "benefit" | "cost"
}

interface Candidate {
  id: string
  name: string
  scores: { [criteriaId: string]: number }
  utilityScore: number
  rank: number
}

interface CalculationResult {
  id: string
  candidate_id: string
  utility_score: number
  rank: number
  calculation_date: string
  group_id: string
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

export default function SMARTCalculationPage() {
  const {
    criteria,
    candidates,
    calculatedCandidates,
    isCalculated,
    handleScoreChange,
    handleWeightChange,
    calculateSMART,
    resetCalculation,
    saveToDatabase,
    pastResults,
    fetchPastResults,
    addCriteria,
    updateCriteria,
    deleteCriteria,
    addCandidate,
    updateCandidate,
    deleteCandidate,
  } = useSMARTCalculation()

  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null)
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [showPastResults, setShowPastResults] = useState(false)

  // Criteria form state
  const [criteriaName, setCriteriaName] = useState("")
  const [criteriaWeight, setCriteriaWeight] = useState(3)
  const [criteriaType, setCriteriaType] = useState<"benefit" | "cost">("benefit")

  // Candidate form state
  const [candidateName, setCandidateName] = useState("")

  // Handlers for opening modals
  const openAddCriteria = () => {
    setEditCriteria(null)
    setCriteriaName("")
    setCriteriaWeight(3)
    setCriteriaType("benefit")
    setShowAddCriteria(true)
    setFormError("")
  }
  const openEditCriteria = (c: Criteria) => {
    setEditCriteria(c)
    setCriteriaName(c.name)
    setCriteriaWeight(c.weight)
    setCriteriaType(c.type)
    setShowAddCriteria(true)
    setFormError("")
  }
  const openAddCandidate = () => {
    setEditCandidate(null)
    setCandidateName("")
    setShowAddCandidate(true)
    setFormError("")
  }
  const openEditCandidate = (c: Candidate) => {
    setEditCandidate(c)
    setCandidateName(c.name)
    setShowAddCandidate(true)
    setFormError("")
  }

  // Handlers for submitting forms
  const handleCriteriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    try {
      if (editCriteria) {
        await updateCriteria(editCriteria.id, { name: criteriaName, weight: criteriaWeight, type: criteriaType })
      } else {
        await addCriteria(criteriaName, criteriaWeight, criteriaType)
      }
      setShowAddCriteria(false)
    } catch (err) {
      setFormError((err as Error).message || "Gagal menyimpan kriteria")
    }
    setFormLoading(false)
  }
  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    try {
      if (editCandidate) {
        await updateCandidate(editCandidate.id, { name: candidateName })
      } else {
        await addCandidate(candidateName)
      }
      setShowAddCandidate(false)
    } catch (err) {
      setFormError((err as Error).message || "Gagal menyimpan kandidat")
    }
    setFormLoading(false)
  }

  // Export PDF
  const handleExportPDF = () => {
    if (!isCalculated || calculatedCandidates.length === 0) return
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Hasil Perhitungan SMART", 14, 16)
    doc.setFontSize(12)
    let y = 28
    doc.text("Ranking | Nama Kandidat | Nilai Utility", 14, y)
    y += 8
    calculatedCandidates.forEach((c) => {
      doc.text(`#${c.rank}    | ${c.name}    | ${c.utilityScore.toFixed(2)}%`, 14, y)
      y += 8
    })
    doc.save("hasil-perhitungan-smart.pdf")
  }

  // Export Excel
  const handleExportExcel = () => {
    if (!isCalculated || calculatedCandidates.length === 0) return
    const wsData = [
      ["Ranking", "Nama Kandidat", "Nilai Utility"],
      ...calculatedCandidates.map((c) => [c.rank, c.name, c.utilityScore]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Hasil SMART")
    XLSX.writeFile(wb, "hasil-perhitungan-smart.xlsx")
  }

  useEffect(() => {
    fetchPastResults()
  }, [fetchPastResults])

  // Group past results by group_id
  const groupedResults: Record<string, CalculationResult[]> = Array.isArray(pastResults)
    ? pastResults.reduce((acc: Record<string, CalculationResult[]>, result: CalculationResult) => {
        if (!result.group_id) return acc
        if (!acc[result.group_id]) acc[result.group_id] = []
        acc[result.group_id].push(result)
        return acc
      }, {})
    : {}

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perhitungan Metode SMART</h1>
          <p className="text-slate-600 mt-1">
            Proses perhitungan untuk pemilihan karyawan terbaik menggunakan metode SMART
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={openAddCriteria}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kriteria
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openAddCandidate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kandidat
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Section: Criteria Weights & Scoring Form */}
        <div className="space-y-6">
          <CriteriaWeightCard
            criteria={criteria}
            onWeightChange={handleWeightChange}
            onAdd={openAddCriteria}
            onEdit={openEditCriteria}
            onDelete={deleteCriteria}
          />
          <CandidateScoreCard
            candidates={candidates}
            criteria={criteria}
            onScoreChange={handleScoreChange}
            onAdd={openAddCandidate}
            onEdit={openEditCandidate}
            onDelete={deleteCandidate}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={calculateSMART} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Hitung
            </Button>
            <Button variant="outline" onClick={resetCalculation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            {isCalculated && (
              <>
                <Button onClick={saveToDatabase} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan ke Database
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Results */}
        <div className="space-y-6">
          <ResultsTable criteria={criteria} calculatedCandidates={calculatedCandidates} isCalculated={isCalculated} />
        </div>
      </div>
      <div className="mt-10">
        <button
          className="text-blue-600 hover:underline mb-2"
          onClick={() => setShowPastResults((v) => !v)}
        >
          {showPastResults ? "Sembunyikan" : "Tampilkan"} Riwayat Hasil Perhitungan
        </button>
        {showPastResults && (
          <div className="bg-white rounded shadow p-4">
            {Object.keys(groupedResults).length === 0 && (
              <div className="text-slate-500">Belum ada riwayat hasil perhitungan.</div>
            )}
            {Object.entries(groupedResults).map(([groupId, results]) => {
              const sorted = results.slice().sort((a, b) => a.rank - b.rank)
              const date = new Date(results[0].calculation_date).toLocaleString()
              return (
                <div key={groupId} className="mb-6 border-b pb-4">
                  <div className="font-semibold text-slate-700 mb-2">
                    Perhitungan: {date}
                  </div>
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left px-2 py-1">Ranking</th>
                        <th className="text-left px-2 py-1">Kandidat</th>
                        <th className="text-left px-2 py-1">Nilai Utility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((r) => {
                        const candidate = candidates.find((c) => c.id === r.candidate_id)
                        return (
                          <tr key={r.candidate_id} className={r.rank === 1 ? "bg-green-50" : ""}>
                            <td className="px-2 py-1">#{r.rank}</td>
                            <td className="px-2 py-1">{candidate ? candidate.name : r.candidate_id}</td>
                            <td className="px-2 py-1">{Number(r.utility_score).toFixed(2)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div className="text-green-700 font-bold mt-2">
                    Kandidat Terpilih: {(() => {
                      const winner = sorted.find((r) => r.rank === 1)
                      const candidate = candidates.find((c) => c.id === winner?.candidate_id)
                      return candidate ? candidate.name : winner?.candidate_id
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Criteria Modal */}
      <Modal open={showAddCriteria} onClose={() => setShowAddCriteria(false)}>
        <form onSubmit={handleCriteriaSubmit} className="space-y-4">
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
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowAddCriteria(false)}>Batal</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={formLoading}>
              {formLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Candidate Modal */}
      <Modal open={showAddCandidate} onClose={() => setShowAddCandidate(false)}>
        <form onSubmit={handleCandidateSubmit} className="space-y-4">
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
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowAddCandidate(false)}>Batal</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={formLoading}>
              {formLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
