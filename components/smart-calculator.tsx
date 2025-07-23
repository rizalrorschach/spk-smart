"use client"

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
  utilityScore?: number
  rank?: number
}
interface SMARTCalculatorProps {
  criteria: Criteria[]
  candidates: Candidate[]
  onCalculationComplete: (results: Candidate[]) => void
}

export function SMARTCalculator({ criteria, candidates, onCalculationComplete }: SMARTCalculatorProps) {
  const calculateSMART = () => {
    // Step 1: Normalize weights
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
    const normalizedWeights = criteria.reduce(
      (acc, c) => {
        acc[c.id] = c.weight / totalWeight
        return acc
      },
      {} as { [key: string]: number },
    )

    // Step 2: Find min/max for each criteria
    const minMaxValues = criteria.reduce(
      (acc, c) => {
        const values = candidates.map((candidate) => candidate.scores[c.id] || 0)
        acc[c.id] = {
          min: Math.min(...values),
          max: Math.max(...values),
        }
        return acc
      },
      {} as { [key: string]: { min: number; max: number } },
    )

    // Step 3: Calculate utility scores
    const results = candidates.map((candidate) => {
      let utilityScore = 0

      criteria.forEach((criterion) => {
        const score = candidate.scores[criterion.id] || 0
        const { min, max } = minMaxValues[criterion.id]

        // Normalize score (0-1)
        let normalizedScore = 0
        if (max !== min) {
          if (criterion.type === "benefit") {
            normalizedScore = (score - min) / (max - min)
          } else {
            normalizedScore = (max - score) / (max - min)
          }
        }

        // Apply weight
        utilityScore += normalizedScore * normalizedWeights[criterion.id]
      })

      return {
        ...candidate,
        utilityScore: utilityScore,
        normalizedWeights,
        minMaxValues,
      }
    })

    // Step 4: Rank candidates
    const rankedResults = results
      .sort((a, b) => b.utilityScore - a.utilityScore)
      .map((candidate, index) => ({
        ...candidate,
        rank: index + 1,
      }))

    onCalculationComplete(rankedResults)
  }

  return { calculateSMART }
}
