import { useSMARTCalculation } from "@/hooks/use-smart-calculation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClipboardList, Calculator, CheckCircle2, Trophy, Save, Download, FileSpreadsheet } from "lucide-react"

export default function DataPenilaianPage() {
  const {
    candidates,
    criteria,
    calculatedCandidates,
    isCalculated,
    handleScoreChange,
    calculateSMART,
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
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Export functions (similar to dashboard)
  const handleExportPDF = async () => {
    if (!isCalculated || calculatedCandidates.length === 0) return
    
    // Import jsPDF dynamically
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Hasil Perhitungan SMART", 20, 20)
    
    doc.setFontSize(12)
    let yPos = 40
    doc.text("Ranking Kandidat:", 20, yPos)
    
    calculatedCandidates.forEach((candidate) => {
      yPos += 10
      doc.text(`${candidate.rank}. ${candidate.name} - ${candidate.utilityScore.toFixed(2)}%`, 20, yPos)
    })
    
    doc.save("hasil-penilaian-smart.pdf")
  }

  const handleExportExcel = async () => {
    if (!isCalculated || calculatedCandidates.length === 0) return
    
    // Import XLSX dynamically
    const XLSX = await import("xlsx")
    const wsData = [
      ["Ranking", "Nama Kandidat", "Nilai Utility"],
      ...calculatedCandidates.map((c) => [c.rank, c.name, c.utilityScore.toFixed(2)]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Penilaian")
    XLSX.writeFile(wb, "hasil-penilaian-smart.xlsx")
  }

  if (candidates.length === 0 || criteria.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ClipboardList className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Penilaian</h1>
            <p className="text-sm text-gray-600 mt-1">Berikan nilai untuk setiap kandidat dan kriteria</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data Belum Lengkap</h3>
            <p className="text-gray-600 text-center mb-4">
              {candidates.length === 0 && criteria.length === 0 && "Silakan tambahkan kriteria dan kandidat terlebih dahulu"}
              {candidates.length === 0 && criteria.length > 0 && "Silakan tambahkan kandidat terlebih dahulu"}
              {candidates.length > 0 && criteria.length === 0 && "Silakan tambahkan kriteria terlebih dahulu"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ClipboardList className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Penilaian</h1>
            <p className="text-sm text-gray-600 mt-1">Berikan nilai untuk setiap kandidat dan kriteria (0-100)</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleCalculate}
            className="bg-orange-600 hover:bg-orange-700 order-2 sm:order-1"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Hitung SMART
          </Button>
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 order-1 sm:order-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Perhitungan selesai!</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded">
                  <ClipboardList className="w-4 h-4 text-orange-600" />
                </div>
                {candidate.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">
                      {criterion.name}
                    </Label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {criterion.type === 'benefit' ? 'Benefit' : 'Cost'}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      editing[`${candidate.id}_${criterion.id}`] !== undefined
                        ? editing[`${candidate.id}_${criterion.id}`]
                        : candidate.scores[criterion.id] || ""
                    }
                    onChange={(e) => handleInput(candidate.id, criterion.id, e.target.value)}
                    onBlur={(e) => handleBlur(candidate.id, criterion.id, e.target.value)}
                    placeholder="0-100"
                    className="text-center"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kandidat</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-[120px]">
                        <div className="space-y-1">
                          <div>{c.name}</div>
                          <div className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {c.type === 'benefit' ? 'Benefit' : 'Cost'}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <ClipboardList className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">Kandidat</div>
                          </div>
                        </div>
                      </td>
                      {criteria.map((c) => (
                        <td key={c.id} className="px-4 py-4 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 text-center mx-auto"
                            value={
                              editing[`${candidate.id}_${c.id}`] !== undefined
                                ? editing[`${candidate.id}_${c.id}`]
                                : candidate.scores[c.id] || ""
                            }
                            onChange={(e) => handleInput(candidate.id, c.id, e.target.value)}
                            onBlur={(e) => handleBlur(candidate.id, c.id, e.target.value)}
                            placeholder="0-100"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Calculation Results */}
      {isCalculated && calculatedCandidates.length > 0 && (
        <div className="space-y-6">
          {/* Winner Highlight */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Kandidat Terpilih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-green-900 text-xl">
                      {calculatedCandidates[0]?.name}
                    </div>
                    <div className="text-green-700">
                      Skor Utility: {calculatedCandidates[0]?.utilityScore.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete Results Table */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Hasil Perhitungan Lengkap
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Ranking semua kandidat berdasarkan metode SMART
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="flex gap-2 order-2 sm:order-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportPDF}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportExcel}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={saveToDatabase} 
                    className="bg-green-600 hover:bg-green-700 order-1 sm:order-2 w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Simpan ke Database
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile Results Cards */}
              <div className="block lg:hidden space-y-3">
                {calculatedCandidates.map((candidate) => (
                  <Card 
                    key={candidate.id} 
                    className={`border-l-4 shadow-sm ${
                      candidate.rank === 1 
                        ? 'border-l-green-500 bg-green-50/50' 
                        : candidate.rank === 2 
                        ? 'border-l-yellow-500 bg-yellow-50/50'
                        : candidate.rank === 3
                        ? 'border-l-orange-500 bg-orange-50/50'
                        : 'border-l-gray-400 bg-white'
                    }`}
                  >
                    <CardContent className="p-3">
                      {/* Top Row: Rank, Name, and Score */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge 
                            className={`text-xs font-semibold shrink-0 ${
                              candidate.rank === 1 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : candidate.rank === 2 
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : candidate.rank === 3
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            #{candidate.rank}
                          </Badge>
                          {candidate.rank === 1 && <Trophy className="w-4 h-4 text-green-600 shrink-0" />}
                          <div className="font-semibold text-gray-900 truncate">
                            {candidate.name}
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-lg font-bold text-gray-900">
                            {candidate.utilityScore.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <Progress 
                          value={candidate.utilityScore} 
                          className="h-2 w-full"
                        />
                      </div>
                      
                      {/* Criteria Scores */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">Skor per Kriteria:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {criteria.map(c => (
                            <div key={c.id} className="flex justify-between text-xs bg-white rounded px-2 py-1 border">
                              <span className="font-medium text-gray-600 truncate pr-1">
                                {c.name}:
                              </span>
                              <span className="font-semibold text-gray-900 shrink-0">
                                {candidate.scores[c.id]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Results Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ranking</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Kandidat</th>
                        {criteria.map((criterion) => (
                          <th key={criterion.id} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                            {criterion.name}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Nilai Utility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {calculatedCandidates.map((candidate) => (
                        <tr 
                          key={candidate.id} 
                          className={`hover:bg-gray-50 ${candidate.rank === 1 ? 'bg-green-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${
                                  candidate.rank === 1 
                                    ? 'bg-green-100 text-green-800' 
                                    : candidate.rank === 2 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : candidate.rank === 3
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                #{candidate.rank}
                              </Badge>
                              {candidate.rank === 1 && <Trophy className="w-4 h-4 text-green-600" />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {candidate.name}
                              {candidate.rank === 1 && (
                                <Badge className="ml-2 bg-green-600 hover:bg-green-700 text-xs">
                                  Terpilih
                                </Badge>
                              )}
                            </div>
                          </td>
                          {criteria.map((criterion) => (
                            <td key={criterion.id} className="px-4 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {candidate.scores[criterion.id]}
                              </span>
                            </td>
                          ))}
                          <td className="px-6 py-4 text-center">
                            <div className="space-y-2">
                              <div className="font-bold text-lg text-gray-900">
                                {candidate.utilityScore.toFixed(2)}%
                              </div>
                              <Progress value={candidate.utilityScore} className="h-2 w-24 mx-auto" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculation Info */}
              <Card className="bg-slate-50 border-slate-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-800">
                    Informasi Perhitungan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-slate-700">Bobot Ternormalisasi:</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {criteria.map((criterion) => {
                        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
                        const normalizedWeight = ((criterion.weight / totalWeight) * 100).toFixed(1)
                        return (
                          <div key={criterion.id} className="flex justify-between bg-white rounded px-3 py-2">
                            <span>{criterion.name}:</span>
                            <span className="font-mono font-bold">{normalizedWeight}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 pt-2 border-t">
                    <p className="mb-1">
                      <strong>Metode:</strong> SMART (Simple Multi-Attribute Rating Technique)
                    </p>
                    <p className="mb-1">
                      <strong>Formula:</strong> Nilai Ternormalisasi × Bobot = Nilai Utility
                    </p>
                    <p>
                      <strong>Ranking:</strong> Berdasarkan nilai utility tertinggi
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 