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
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-slate-800 p-2 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SPK SMART</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
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

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
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
  )
}
