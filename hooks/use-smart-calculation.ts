"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid'

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

export function useSMARTCalculation() {
  const [criteriaList, setCriteriaList] = useState<Array<Criteria>>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [calculatedCandidates, setCalculatedCandidates] = useState<Candidate[]>([])
  const [isCalculated, setIsCalculated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pastResults, setPastResults] = useState<any[]>([])

  // Fetch criteria and candidates from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      // Fetch criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from("criteria")
        .select("id, name, weight, type")
        .order("created_at", { ascending: true })
      // Fetch candidates
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .select("id, name")
        .order("created_at", { ascending: true })
      // Fetch scores
      const { data: scoresData, error: scoresError } = await supabase
        .from("scores")
        .select("id, candidate_id, criteria_id, score")
      if (criteriaError || candidateError || scoresError) {
        setError(
          criteriaError?.message || candidateError?.message || scoresError?.message || "Unknown error"
        )
        setLoading(false)
        return
      }
      // Map scores to candidates
      const safeCriteria = Array.isArray(criteriaData) ? criteriaData : []
      const safeCandidates = Array.isArray(candidateData) ? candidateData : []
      const safeScores = Array.isArray(scoresData) ? scoresData : []
      const candidatesWithScores: Candidate[] = safeCandidates.map((candidate) => {
        const scores: { [criteriaId: string]: number } = {}
        safeCriteria.forEach((c: Criteria) => {
          const scoreObj = safeScores.find(
            (s) => s.candidate_id === candidate.id && s.criteria_id === c.id
          )
          scores[c.id] = scoreObj ? scoreObj.score : 0
        })
        return {
          id: candidate.id,
          name: candidate.name,
          scores,
          utilityScore: 0,
          rank: 0,
        }
      })
      setCriteriaList(safeCriteria)
      setCandidates(candidatesWithScores)
      setLoading(false)
    }
    fetchData()
  }, [])

  // CRUD for Criteria
  const addCriteria = async (name: string, weight: number, type: "benefit" | "cost") => {
    const { data, error } = await supabase
      .from("criteria")
      .insert([{ name, weight, type }])
      .select()
      .single()
    if (error) throw error
    setCriteriaList((prev) => [...prev, data])
  }
  const updateCriteria = async (id: string, updates: Partial<Criteria>) => {
    const { data, error } = await supabase
      .from("criteria")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    setCriteriaList((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }
  const deleteCriteria = async (id: string) => {
    const { error } = await supabase.from("criteria").delete().eq("id", id)
    if (error) throw error
    setCriteriaList((prev) => prev.filter((c) => c.id !== id))
  }

  // CRUD for Candidates
  const addCandidate = async (name: string) => {
    const { data, error } = await supabase
      .from("candidates")
      .insert([{ name }])
      .select()
      .single()
    if (error) throw error
    // Add default scores for new candidate
    const scores: { [criteriaId: string]: number } = {}
    for (let i = 0; i < criteriaList.length; i++) {
      const c: Criteria = criteriaList[i]
      scores[c.id] = 0
    }
    setCandidates((prev) => [...prev, { ...data, scores, utilityScore: 0, rank: 0 }])
  }
  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    const { data, error } = await supabase
      .from("candidates")
      .update({ name: updates.name })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, scores: c.scores } : c))
    )
  }
  const deleteCandidate = async (id: string) => {
    const { error } = await supabase.from("candidates").delete().eq("id", id)
    if (error) throw error
    setCandidates((prev) => prev.filter((c) => c.id !== id))
  }

  // Score update
  const handleScoreChange = async (candidateId: string, criteriaId: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, Number.parseInt(value) || 0))
    // Update in Supabase
    const { data, error } = await supabase
      .from("scores")
      .upsert({ candidate_id: candidateId, criteria_id: criteriaId, score: numValue }, { onConflict: "candidate_id,criteria_id" })
      .select()
      .single()
    if (error) throw error
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, scores: { ...candidate.scores, [criteriaId]: numValue } }
          : candidate,
      ),
    )
  }

  const handleWeightChange = async (criteriaId: string, weight: number[]) => {
    const { data, error } = await supabase
      .from("criteria")
      .update({ weight: weight[0] })
      .eq("id", criteriaId)
      .select()
      .single()
    if (error) throw error
    setCriteriaList((prev) => prev.map((c) => (c.id === criteriaId ? { ...c, weight: weight[0] } : c)))
  }

  const calculateSMART = () => {
    // Step 1: Normalize weights
    const totalWeight = criteriaList.reduce((sum, c) => sum + c.weight, 0)
    const normalizedWeights = criteriaList.reduce(
      (acc, c) => {
        acc[c.id] = c.weight / totalWeight
        return acc
      },
      {} as { [key: string]: number },
    )

    // Step 2: Find min/max for each criteria for normalization
    const minMaxValues = criteriaList.reduce(
      (acc, c) => {
        const values = candidates.map((candidate) => candidate.scores[c.id])
        acc[c.id] = {
          min: Math.min(...values),
          max: Math.max(...values),
        }
        return acc
      },
      {} as { [key: string]: { min: number; max: number } },
    )

    // Step 3: Calculate utility scores
    const calculatedResults = candidates.map((candidate) => {
      let utilityScore = 0

      criteriaList.forEach((criterion) => {
        const score = candidate.scores[criterion.id]
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
        utilityScore: utilityScore * 100, // Convert to percentage
      }
    })

    // Step 4: Rank candidates
    const rankedResults = calculatedResults
      .sort((a, b) => b.utilityScore - a.utilityScore)
      .map((candidate, index) => ({
        ...candidate,
        rank: index + 1,
      }))

    setCalculatedCandidates(rankedResults)
    setIsCalculated(true)
  }

  const resetCalculation = () => {
    setIsCalculated(false)
    setCalculatedCandidates([])
  }

  // Save calculation results to Supabase
  const saveToDatabase = async () => {
    if (!isCalculated || calculatedCandidates.length === 0) return
    const calculationGroupId = uuidv4()
    const calculationDate = new Date().toISOString()
    const rows = calculatedCandidates.map((c) => ({
      candidate_id: c.id,
      utility_score: c.utilityScore,
      rank: c.rank,
      calculation_date: calculationDate,
      group_id: calculationGroupId,
    }))
    const { error } = await supabase.from('calculation_results').insert(rows)
    if (error) throw error
    alert('Hasil perhitungan berhasil disimpan!')
    fetchPastResults()
  }

  // Fetch past calculation results
  const fetchPastResults = async () => {
    const { data, error } = await supabase
      .from('calculation_results')
      .select('*')
      .order('calculation_date', { ascending: false })
    if (error) throw error
    setPastResults(data || [])
  }

  return {
    criteria: criteriaList,
    candidates,
    calculatedCandidates,
    isCalculated,
    loading,
    error,
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
  }
}
