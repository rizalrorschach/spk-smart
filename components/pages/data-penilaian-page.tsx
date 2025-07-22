import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DataPenilaianPage() {
  const {
    candidates,
    criteria,
    handleScoreChange,
    calculateSMART,
    calculatedCandidates,
    isCalculated,
    saveToDatabase,
  } = useSMARTCalculation()

  const [editing, setEditing] = useState<{ [key: string]: string }>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInput = (candidateId: string, criteriaId: string, value: string) => {
    setEditing((prev) => ({ ...prev, [`${candidateId}_${criteriaId}`]: value }))
  }

  const handleBlur = (candidateId: string, criteriaId: string, value: string) => {
    handleScoreChange(candidateId, criteriaId, value)
    setEditing((prev) => {
      const newState = { ...prev }
      delete newState[`${candidateId}_${criteriaId}`]
      return newState
    })
  }

  const handleCalculate = () => {
    calculateSMART()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Penilaian</h1>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Kandidat</th>
              {criteria.map((c) => (
                <th key={c.id} className="px-3 py-2 text-center">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b">
                <td className="px-3 py-2 font-medium">{candidate.name}</td>
                {criteria.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20 border rounded px-2 py-1 text-center"
                      value={
                        editing[`${candidate.id}_${c.id}`] !== undefined
                          ? editing[`${candidate.id}_${c.id}`]
                          : candidate.scores[c.id]
                      }
                      onChange={e => handleInput(candidate.id, c.id, e.target.value)}
                      onBlur={e => handleBlur(candidate.id, c.id, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button className="bg-blue-600 text-white" onClick={handleCalculate}>
          Hitung
        </Button>
      </div>
      {showSuccess && (
        <div className="mt-2 text-green-600 font-semibold text-right">Perhitungan selesai!</div>
      )}
      {isCalculated && calculatedCandidates.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Hasil Perhitungan</h2>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm mb-4">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Ranking</th>
                  <th className="px-3 py-2 text-left">Nama Kandidat</th>
                  {criteria.map((c) => (
                    <th key={c.id} className="px-3 py-2 text-center">{c.name}</th>
                  ))}
                  <th className="px-3 py-2 text-center">Nilai Utility</th>
                </tr>
              </thead>
              <tbody>
                {calculatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className={candidate.rank === 1 ? "bg-green-50" : ""}>
                    <td className="px-3 py-2 font-semibold">#{candidate.rank}</td>
                    <td className="px-3 py-2 font-medium">{candidate.name}</td>
                    {criteria.map((c) => (
                      <td key={c.id} className="px-3 py-2 text-center">{candidate.scores[c.id]}</td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold">{candidate.utilityScore.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-green-700 font-bold">
              Kandidat Terpilih: {calculatedCandidates[0]?.name}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="bg-green-600 text-white" onClick={saveToDatabase}>
              Simpan ke Database
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 