import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Download } from "lucide-react"

export default function DataPelariToolbar() {
  const [filterBy, setFilterBy] = useState("Nama")
  const [status, setStatus] = useState("Semua Data")

  return (
    <div className="space-y-4">
      {/* ===== GARIS BIRU ATAS (Dropdown Kotama) ===== */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {status} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["Semua Data", "Aktif", "Tidak Aktif", "Selesai"].map(item => (
              <DropdownMenuItem
                key={item}
                onClick={() => setStatus(item)}
              >
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ===== GARIS BIRU BAWAH ===== */}
      <div className="flex items-center justify-between gap-4">
        {/* KIRI — Dropdown Cari Nama */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filterBy} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["Nama", "ID", "Email"].map(item => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => setFilterBy(item)}
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input placeholder={`Cari berdasarkan ${filterBy.toLowerCase()}...`} />
        </div>

        {/* KANAN — Kesatuan (Export) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export CSV</DropdownMenuItem>
            <DropdownMenuItem>Export PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
