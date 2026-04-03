'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  loading: boolean
}

export function DropZone({ onFiles, loading }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter(
        (f) =>
          f.name.endsWith('.ofx') ||
          f.name.endsWith('.xlsx') ||
          f.name.endsWith('.xls')
      )
      if (valid.length === 0) return
      setSelectedFiles(valid)
    },
    []
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      handleFiles(Array.from(e.dataTransfer.files))
    },
    [handleFiles]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files))
  }

  const removeFile = (index: number) => {
    setSelectedFiles((f) => f.filter((_, i) => i !== index))
  }

  const handleImport = () => {
    if (selectedFiles.length > 0) onFiles(selectedFiles)
  }

  return (
    <div className="space-y-4">
      {/* Drop area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer',
          dragging
            ? 'border-accent-purple bg-accent-purple/5'
            : 'border-border hover:border-accent-purple/50 hover:bg-bg-elevated'
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".ofx,.xlsx,.xls"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center">
            <Upload size={24} className="text-accent-purple-light" />
          </div>
          <div>
            <p className="text-text-primary font-medium">
              Arraste os arquivos ou clique para selecionar
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Extrato Bradesco (.ofx) ou Fatura do Cartão (.xlsx)
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-bg-elevated border border-border rounded text-text-secondary">
              .OFX
            </span>
            <span className="text-xs px-2 py-0.5 bg-bg-elevated border border-border rounded text-text-secondary">
              .XLSX
            </span>
          </div>
        </div>
      </div>

      {/* Arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                  <FileText size={16} className="text-accent-purple-light" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{file.name}</p>
                  <p className="text-xs text-text-secondary">
                    {(file.size / 1024).toFixed(1)} KB ·{' '}
                    {file.name.endsWith('.ofx') ? 'Conta Corrente' : 'Cartão de Crédito'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                className="text-text-muted hover:text-text-secondary transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading ? 'Importando...' : `Importar ${selectedFiles.length} arquivo(s)`}
          </button>
        </div>
      )}
    </div>
  )
}
