"use client"

import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Database,
  Users,
  ClipboardList,
  BarChart3,
  UserCircle,
  LogOut,
  Activity,
  X,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "data-kriteria", label: "Data Kriteria", icon: Database },
  { id: "data-alternatif", label: "Data Alternatif", icon: Users },
  { id: "data-penilaian", label: "Data Penilaian", icon: ClipboardList },
  { id: "data-hasil-akhir", label: "Data Hasil Akhir", icon: BarChart3 },
]

const bottomMenuItems = [
  { id: "data-profil", label: "Data Profil", icon: UserCircle },
]

export default function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setIsMobileMenuOpen(false) // Close mobile menu after selection
  }

  const handleLogout = () => {
    onLogout()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-4 py-3 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 text-white p-1.5 rounded-md">
            <Activity className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">SPK SMART</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <div className="relative bg-slate-800 text-white flex flex-col w-80 max-w-[85vw] shadow-xl h-full">
            {/* Mobile Header with Close Button */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-white text-slate-800 p-2 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">SPK SMART</h1>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 -mr-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Navigation - Scrollable */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-700",
                        currentPage === item.id && "bg-slate-700 text-white",
                      )}
                      onClick={() => handlePageChange(item.id)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700">
                <div className="space-y-2">
                  {bottomMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-700",
                          currentPage === item.id && "bg-slate-700 text-white",
                        )}
                        onClick={() => handlePageChange(item.id)}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </nav>

            {/* Mobile Logout - Always at Bottom */}
            <div className="p-4 border-t border-slate-700 flex-shrink-0 bg-slate-800">
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-red-400 hover:text-red-300 hover:bg-slate-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-slate-800 text-white flex-col h-screen fixed left-0 top-0">
        {/* Desktop Header */}
        <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-slate-800 p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SPK SMART</h1>
            </div>
          </div>
        </div>

        {/* Desktop Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-700",
                    currentPage === item.id && "bg-slate-700 text-white",
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="space-y-2">
              {bottomMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-700",
                      currentPage === item.id && "bg-slate-700 text-white",
                    )}
                    onClick={() => onPageChange(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Desktop Logout - Always at Bottom */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0 bg-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-left text-red-400 hover:text-red-300 hover:bg-slate-700"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
