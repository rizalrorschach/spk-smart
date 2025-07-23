"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator } from "lucide-react"

interface Candidate {
  id: string
  name: string
  scores: { [criteriaId: string]: number }
  utilityScore: number
  rank: number
}

interface Criteria {
  id: string
  name: string
  weight: number
  type: "benefit" | "cost"
}

interface ResultsTableProps {
  criteria: Criteria[]
  calculatedCandidates: Candidate[]
  isCalculated: boolean
}

export default function ResultsTable({ criteria, calculatedCandidates, isCalculated }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Hasil Perhitungan</CardTitle>
        {isCalculated && calculatedCandidates.length > 0 && (
          <p className="text-sm text-slate-600">
            Kandidat terpilih: <span className="font-semibold text-green-600">{calculatedCandidates[0]?.name}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isCalculated ? (
          <div className="space-y-6">
            {/* Results Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Ranking</TableHead>
                    <TableHead className="font-semibold">Nama Alternatif</TableHead>
                    {criteria.map((criterion) => (
                      <TableHead key={criterion.id} className="font-semibold text-center">
                        {criterion.name}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-center">Nilai Utility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculatedCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className={candidate.rank === 1 ? "bg-green-50" : ""}>
                      <TableCell>
                        <Badge
                          variant={candidate.rank === 1 ? "default" : "secondary"}
                          className={candidate.rank === 1 ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          #{candidate.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {candidate.name}
                        {candidate.rank === 1 && (
                          <Badge className="ml-2 bg-green-600 hover:bg-green-700 text-xs">Terpilih</Badge>
                        )}
                      </TableCell>
                      {criteria.map((criterion) => (
                        <TableCell key={criterion.id} className="text-center">
                          {candidate.scores[criterion.id]}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <div className="space-y-2">
                          <div className="font-semibold">{candidate.utilityScore.toFixed(4)}</div>
                          <Progress value={candidate.utilityScore * 100} className="h-2 w-20 mx-auto" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Calculation Breakdown */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800">Breakdown Perhitungan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="font-medium text-slate-700">Bobot Ternormalisasi:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {criteria.map((criterion) => {
                      const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
                      const normalizedWeight = ((criterion.weight / totalWeight) * 100).toFixed(1)
                      return (
                        <div key={criterion.id} className="flex justify-between">
                          <span>{criterion.name}:</span>
                          <span className="font-mono">{normalizedWeight}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="text-xs text-slate-600 pt-2 border-t">
                  <p>
                    <strong>Formula:</strong> Normalisasi &times; Bobot = Nilai Utility
                  </p>
                  <p>
                    <strong>Ranking:</strong> Berdasarkan nilai utility tertinggi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Klik tombol &quot;Hitung&quot; untuk melihat hasil perhitungan SMART</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
