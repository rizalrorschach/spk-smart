"use client"

import type { ReactNode } from "react"
import Sidebar from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
}

export default function DashboardLayout({ children, currentPage, onPageChange, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 lg:ml-64">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
