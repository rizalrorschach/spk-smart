"use client"

import { useEffect, useState } from "react"
import LoginForm from "@/components/auth/login-form"
import DashboardLayout from "@/components/layout/dashboard-layout"
import SMARTCalculationPage from "@/components/pages/smart-calculation-page"
import DataKriteriaPage from "@/components/pages/data-kriteria-page"
import DataAlternatifPage from "@/components/pages/data-alternatif-page"
import DataPenilaianPage from "@/components/pages/data-penilaian-page"
import DataHasilAkhirPage from "@/components/pages/data-hasil-akhir-page"
import DataProfilPage from "@/components/pages/data-profil-page"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/auth-js"

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentPage, setCurrentPage] = useState("dashboard")

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }
    getSession()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case "data-kriteria":
        return <DataKriteriaPage />
      case "data-alternatif":
        return <DataAlternatifPage />
      case "data-penilaian":
        return <DataPenilaianPage />
      case "data-hasil-akhir":
        return <DataHasilAkhirPage />
      case "data-profil":
        return <DataProfilPage />
      default:
        return <SMARTCalculationPage />
    }
  }

  if (!session) {
    return <LoginForm />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </DashboardLayout>
  )
}
