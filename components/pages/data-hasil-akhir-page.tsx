import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ChevronDown, ChevronUp, Trophy, Calendar, User } from "lucide-react"

interface CalculationResult {
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
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Hasil Akhir</h1>
          <p className="text-sm text-gray-600 mt-1">Lihat riwayat hasil perhitungan SMART</p>
        </div>
      </div>

      {Object.keys(groupedResults).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Hasil</h3>
            <p className="text-gray-600 text-center">Belum ada hasil perhitungan yang tersimpan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedResults).map(([groupId, results]) => {
            const sorted = results.slice().sort((a, b) => a.rank - b.rank)
            const date = new Date(results[0].calculation_date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            const isExpanded = expanded === groupId

            return (
              <Card key={groupId} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-t-lg"
                    onClick={() => setExpanded(isExpanded ? null : groupId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">
                          Perhitungan SMART
                        </CardTitle>
                        <p className="text-sm text-gray-600">{date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {/* Winner Highlight */}
                    <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Trophy className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">Kandidat Terpilih</h4>
                          <p className="text-green-700">
                            {(() => {
                              const winner = sorted.find((r) => r.rank === 1)
                              const candidate = candidates.find((c) => c.id === winner?.candidate_id)
                              return candidate ? candidate.name : winner?.candidate_id
                            })()}
                          </p>
                          <p className="text-sm text-green-600">
                            Skor: {Number(sorted.find(r => r.rank === 1)?.utility_score).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-3">
                      {sorted.map((r) => {
                        const candidate = candidates.find((c) => c.id === r.candidate_id)
                        return (
                          <div 
                            key={r.candidate_id} 
                            className={`p-4 rounded-lg border ${
                              r.rank === 1 
                                ? 'bg-yellow-50 border-yellow-200' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge 
                                  className={`${
                                    r.rank === 1 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : r.rank === 2 
                                      ? 'bg-gray-100 text-gray-800'
                                      : r.rank === 3
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  #{r.rank}
                                </Badge>
                                {r.rank === 1 && <Trophy className="w-4 h-4 text-yellow-600" />}
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                {Number(r.utility_score).toFixed(2)}%
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="font-medium text-gray-900">
                                {candidate ? candidate.name : r.candidate_id}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ranking</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nama Kandidat</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Nilai Utility</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sorted.map((r) => {
                              const candidate = candidates.find((c) => c.id === r.candidate_id)
                              return (
                                <tr 
                                  key={r.candidate_id} 
                                  className={`hover:bg-gray-50 ${r.rank === 1 ? 'bg-green-50' : ''}`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        className={`${
                                          r.rank === 1 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : r.rank === 2 
                                            ? 'bg-gray-100 text-gray-800'
                                            : r.rank === 3
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        #{r.rank}
                                      </Badge>
                                      {r.rank === 1 && <Trophy className="w-4 h-4 text-yellow-600" />}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 bg-gray-100 rounded-full">
                                        <User className="w-4 h-4 text-gray-600" />
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {candidate ? candidate.name : r.candidate_id}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="font-semibold text-lg text-gray-900">
                                      {Number(r.utility_score).toFixed(2)}%
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 