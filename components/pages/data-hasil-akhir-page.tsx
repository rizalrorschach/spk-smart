import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useEffect, useState } from "react"

interface CalculationResult {
  id: string
  candidate_id: string
  utility_score: number
  rank: number
  calculation_date: string
  group_id: string
}

export default function DataHasilAkhirPage() {
  const { candidates, pastResults, fetchPastResults } = useSMARTCalculation()
  const [expanded, setExpanded] = useState<string | null>(null)

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
      <h1 className="text-2xl font-bold mb-4">Riwayat Hasil Akhir</h1>
      {Object.keys(groupedResults).length === 0 ? (
        <div className="text-slate-500">Belum ada hasil perhitungan yang tersimpan.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([groupId, results]) => {
            const sorted = results.slice().sort((a, b) => a.rank - b.rank)
            const date = new Date(results[0].calculation_date).toLocaleString()
            return (
              <div key={groupId} className="border rounded-lg shadow bg-white">
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-slate-50"
                  onClick={() => setExpanded(expanded === groupId ? null : groupId)}
                >
                  <span className="font-semibold text-slate-700">Perhitungan: {date}</span>
                  <span className="text-blue-600 font-bold">{expanded === groupId ? "▲" : "▼"}</span>
                </button>
                {expanded === groupId && (
                  <div className="px-6 pb-6">
                    <table className="w-full border text-sm mb-2">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Ranking</th>
                          <th className="px-3 py-2 text-left">Nama Kandidat</th>
                          <th className="px-3 py-2 text-center">Nilai Utility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((r) => {
                          const candidate = candidates.find((c) => c.id === r.candidate_id)
                          return (
                            <tr key={r.candidate_id} className={r.rank === 1 ? "bg-green-50" : ""}>
                              <td className="px-3 py-2 font-semibold">#{r.rank}</td>
                              <td className="px-3 py-2 font-medium">{candidate ? candidate.name : r.candidate_id}</td>
                              <td className="px-3 py-2 text-center font-semibold">{Number(r.utility_score).toFixed(2)}%</td>
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
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 