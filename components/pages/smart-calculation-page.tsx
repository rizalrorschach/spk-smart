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
  const openEditCriteria = (id: string, updates: Partial<Criteria>) => {
    const c = updates as Criteria  // The component passes the full criteria object as updates
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
  const openEditCandidate = (id: string, updates: Partial<Candidate>) => {
    const c = updates as Candidate  // The component passes the full candidate object as updates
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
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Perhitungan Metode SMART</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Proses perhitungan untuk pemilihan karyawan terbaik
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto lg:w-auto">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white order-2 sm:order-1" 
            onClick={openAddCriteria}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kriteria
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white order-1 sm:order-2" 
            onClick={openAddCandidate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kandidat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Criteria and Candidates Section */}
        <div className="space-y-6 order-2 xl:order-1">
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
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Aksi Perhitungan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={calculateSMART} 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Hitung SMART
              </Button>
              <Button 
                variant="outline" 
                onClick={resetCalculation}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            
            {isCalculated && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Ekspor Hasil</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button 
                    onClick={saveToDatabase} 
                    className="bg-green-600 hover:bg-green-700 text-white text-sm"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Simpan
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportPDF}
                    className="text-sm"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportExcel}
                    className="text-sm"
                    size="sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6 order-1 xl:order-2">
          <ResultsTable criteria={criteria} calculatedCandidates={calculatedCandidates} isCalculated={isCalculated} />
        </div>
      </div>
      {/* Past Results Section */}
      <div className="bg-white p-4 lg:p-6 rounded-lg border shadow-sm">
        <Button
          variant="ghost"
          onClick={() => setShowPastResults((v) => !v)}
          className="p-0 h-auto text-blue-600 hover:text-blue-700 hover:bg-transparent mb-4"
        >
          {showPastResults ? "Sembunyikan" : "Tampilkan"} Riwayat Hasil Perhitungan
        </Button>
        {showPastResults && (
          <div className="mt-4">
            {Object.keys(groupedResults).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada riwayat hasil perhitungan.</p>
              </div>
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
