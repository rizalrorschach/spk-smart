"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface CandidateScoreCardProps {
  candidates: Candidate[]
  criteria: Criteria[]
  onScoreChange: (candidateId: string, criteriaId: string, value: string) => void
  onAdd: (name: string) => void
  onEdit: (id: string, updates: Partial<Candidate>) => void
  onDelete: (id: string) => void
}

export default function CandidateScoreCard({ candidates, criteria, onScoreChange, onAdd, onEdit, onDelete }: CandidateScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Penilaian Kandidat</CardTitle>
        <p className="text-sm text-slate-600">Masukkan nilai untuk setiap kandidat (0-100)</p>
        <button className="mt-2 text-blue-600 hover:underline" onClick={() => onAdd("")}>+ Tambah Kandidat</button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-slate-800">{candidate.name}</h4>
                <div className="flex gap-2">
                  <button className="text-xs text-yellow-600 hover:underline" onClick={() => onEdit(candidate.id, candidate)}>Edit</button>
                  <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(candidate.id)}>Delete</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <Label className="text-sm text-slate-600">{criterion.name}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={candidate.scores[criterion.id]}
                      onChange={(e) => onScoreChange(candidate.id, criterion.id, e.target.value)}
                      className="border-slate-300"
                      placeholder="0-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
