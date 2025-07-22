"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface Criteria {
  id: string
  name: string
  weight: number
  type: "benefit" | "cost"
}

interface CriteriaWeightCardProps {
  criteria: Criteria[]
  onWeightChange: (criteriaId: string, weight: number[]) => void
  onAdd: (name: string, weight: number, type: "benefit" | "cost") => void
  onEdit: (id: string, updates: Partial<Criteria>) => void
  onDelete: (id: string) => void
}

export default function CriteriaWeightCard({ criteria, onWeightChange, onAdd, onEdit, onDelete }: CriteriaWeightCardProps) {
  const getWeightLabel = (weight: number) => {
    switch (weight) {
      case 1:
        return "Tidak Penting"
      case 2:
        return "Kurang Penting"
      case 3:
        return "Cukup Penting"
      case 4:
        return "Penting"
      case 5:
        return "Sangat Penting"
      default:
        return "Cukup Penting"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Bobot Kriteria</CardTitle>
        <p className="text-sm text-slate-600">Atur bobot kepentingan setiap kriteria (1-5)</p>
        <button className="mt-2 text-blue-600 hover:underline" onClick={() => onAdd("", 3, "benefit")}>+ Tambah Kriteria</button>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-3 border-b pb-4">
            <div className="flex justify-between items-center">
              <Label className="font-medium text-slate-700">{criterion.name}</Label>
              <div className="flex gap-2">
                <button className="text-xs text-yellow-600 hover:underline" onClick={() => onEdit(criterion.id, criterion)}>Edit</button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(criterion.id)}>Delete</button>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getWeightLabel(criterion.weight)}
              </Badge>
            </div>
            <Slider
              value={[criterion.weight]}
              onValueChange={(value) => onWeightChange(criterion.id, value)}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tidak Penting</span>
              <span>Sangat Penting</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
