"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

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

export function useSMARTCalculation() {
  const [criteriaList, setCriteriaList] = useState<Array<Criteria>>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [calculatedCandidates, setCalculatedCandidates] = useState<Candidate[]>([])
  const [isCalculated, setIsCalculated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pastResults, setPastResults] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  // Fetch criteria and candidates from Supabase with user filtering
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) return
      
      setLoading(true)
      setError("")
      
      try {
        // Fetch criteria for current user
        const { data: criteriaData, error: criteriaError } = await supabase
          .from("criteria")
          .select("id, name, weight, type")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: true })

        // Fetch candidates for current user
        const { data: candidateData, error: candidateError } = await supabase
          .from("candidates")
          .select("id, name")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: true })

        // Fetch scores for current user
        const { data: scoresData, error: scoresError } = await supabase
          .from("scores")
          .select("id, candidate_id, criteria_id, score")
          .eq("user_id", currentUserId)

        if (criteriaError) throw criteriaError
        if (candidateError) throw candidateError
        if (scoresError) throw scoresError

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
      } catch (err) {
        setError((err as Error).message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      fetchData()
    }
  }, [currentUserId])

  const handleScoreChange = async (candidateId: string, criteriaId: string, value: string) => {
    if (!currentUserId) return
    
    // Parse the score more carefully
    const numValue = parseFloat(value)
    const score = isNaN(numValue) ? 0 : Math.min(Math.max(Math.round(numValue), 0), 100)
    
    // Update local state immediately for better UX
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, scores: { ...c.scores, [criteriaId]: score } } : c
      )
    )
    
    try {
      const { error } = await supabase
        .from("scores")
        .upsert({
          user_id: currentUserId,
          candidate_id: candidateId,
          criteria_id: criteriaId,
          score: score,
        }, {
          onConflict: 'user_id,candidate_id,criteria_id'
        })
      if (error) throw error
    } catch (err) {
      console.error("Error updating score:", err)
      // Revert local state on error
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, scores: { ...c.scores, [criteriaId]: 0 } } : c
        )
      )
    }
  }

  const handleWeightChange = async (criteriaId: string, weight: number[]) => {
    if (!currentUserId) return
    
    try {
      const { data, error } = await supabase
        .from("criteria")
        .update({ weight: weight[0] })
        .eq("id", criteriaId)
        .eq("user_id", currentUserId)
        .select()
        .single()
      if (error) throw error
      setCriteriaList((prev) => prev.map((c) => (c.id === criteriaId ? { ...c, weight: weight[0] } : c)))
    } catch (err) {
      console.error("Error updating weight:", err)
    }
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
      utilityScore: utilityScore, // Keep as decimal (0-1 range)
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

  // Save calculation results to Supabase with user isolation
  const saveToDatabase = async () => {
    if (!isCalculated || calculatedCandidates.length === 0 || !currentUserId) return
    
    try {
      const calculationGroupId = uuidv4()
      const calculationDate = new Date().toISOString()
      const rows = calculatedCandidates.map((c) => ({
        user_id: currentUserId,
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
    } catch (err) {
      console.error("Error saving results:", err)
      alert('Gagal menyimpan hasil perhitungan!')
    }
  }

  // Fetch past calculation results for current user
  const fetchPastResults = async () => {
    if (!currentUserId) return
    
    try {
      const { data, error } = await supabase
        .from('calculation_results')
        .select('*')
        .eq('user_id', currentUserId)
        .order('calculation_date', { ascending: false })
      if (error) throw error
      setPastResults(data || [])
    } catch (err) {
      console.error("Error fetching past results:", err)
    }
  }

  // Add criteria with user association
  const addCriteria = async (name: string, weight: number, type: "benefit" | "cost") => {
    if (!currentUserId) return
    
    try {
      const { data, error } = await supabase
        .from("criteria")
        .insert({
          user_id: currentUserId,
          name,
          weight,
          type,
        })
        .select()
        .single()
      if (error) throw error
      
      setCriteriaList((prev) => [...prev, data])
    } catch (err) {
      throw new Error((err as Error).message || "Failed to add criteria")
    }
  }

  // Update criteria (with user verification)
  const updateCriteria = async (id: string, updates: Partial<Criteria>) => {
    if (!currentUserId) return
    
    try {
      const { data, error } = await supabase
        .from("criteria")
        .update(updates)
        .eq("id", id)
        .eq("user_id", currentUserId)
        .select()
        .single()
      if (error) throw error
      
      setCriteriaList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    } catch (err) {
      throw new Error((err as Error).message || "Failed to update criteria")
    }
  }

  // Delete criteria (with user verification)
  const deleteCriteria = async (id: string) => {
    if (!currentUserId) return
    
    try {
      const { error } = await supabase
        .from("criteria")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUserId)
      if (error) throw error
      
      setCriteriaList((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error("Error deleting criteria:", err)
    }
  }

  // Add candidate with user association
  const addCandidate = async (name: string) => {
    if (!currentUserId) return
    
    try {
      const { data, error } = await supabase
        .from("candidates")
        .insert({
          user_id: currentUserId,
          name,
        })
        .select()
        .single()
      if (error) throw error
      
      const newCandidate: Candidate = {
        id: data.id,
        name: data.name,
        scores: {},
        utilityScore: 0,
        rank: 0,
      }
      
      setCandidates((prev) => [...prev, newCandidate])
    } catch (err) {
      throw new Error((err as Error).message || "Failed to add candidate")
    }
  }

  // Update candidate (with user verification)
  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    if (!currentUserId) return
    
    try {
      const { data, error } = await supabase
        .from("candidates")
        .update(updates)
        .eq("id", id)
        .eq("user_id", currentUserId)
        .select()
        .single()
      if (error) throw error
      
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    } catch (err) {
      throw new Error((err as Error).message || "Failed to update candidate")
    }
  }

  // Delete candidate (with user verification)
  const deleteCandidate = async (id: string) => {
    if (!currentUserId) return
    
    try {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUserId)
      if (error) throw error
      
      setCandidates((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error("Error deleting candidate:", err)
    }
  }

  return {
    criteria: criteriaList,
    candidates,
    calculatedCandidates,
    isCalculated,
    loading,
    error,
    currentUserId,
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
