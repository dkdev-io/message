'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react'

interface ValidationSummary {
  total_rows: number
  imported: number
  duplicates: number
  invalid_phones: number
  opt_outs: number
}

interface VoterUploadProps {
  campaignId: string
}

export default function VoterUpload({ campaignId }: VoterUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string; summary?: ValidationSummary } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.xlsx')) {
      setResult({ type: 'error', message: 'Only .xlsx files are supported.' })
      return
    }
    setFile(f)
    setResult(null)
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  async function handleUpload() {
    if (!file) return

    setUploading(true)
    setProgress(10)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('campaignId', campaignId)

      setProgress(30)

      const res = await fetch('/message/api/voters/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(80)

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed.')
      }

      setProgress(100)
      setResult({
        type: 'success',
        message: `Successfully imported ${data.summary.imported} voters.`,
        summary: data.summary,
      })
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''

      // Reload page to reflect new voter data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  function clearFile() {
    setFile(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
            : 'border-[var(--color-muted)]/30 hover:border-[var(--color-muted)]/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload size={28} className="mx-auto mb-3 text-[var(--color-muted)]" />
        <p className="text-sm text-[var(--color-text)] mb-1">
          Drop your .xlsx file here, or click to browse
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Excel files with columns: first_name, last_name, phone, email (optional)
        </p>
      </div>

      {/* Selected file */}
      {file && (
        <div className="flex items-center justify-between bg-[var(--color-bg)] rounded-lg px-4 py-3 border border-[var(--color-muted)]/20">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={18} className="text-green-500" />
            <div>
              <p className="text-sm text-[var(--color-text)]">{file.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-display transition-colors"
            >
              {uploading ? 'UPLOADING...' : 'UPLOAD'}
            </button>
            {!uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="w-full bg-[var(--color-muted)]/20 rounded-full h-2">
          <div
            className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div className={`rounded-lg px-4 py-3 ${
          result.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          <div className={`flex items-center gap-2 text-sm ${
            result.type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {result.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {result.message}
          </div>
          {result.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="text-center">
                <p className="text-lg font-display text-[var(--color-text)]">{result.summary.total_rows}</p>
                <p className="text-xs text-[var(--color-muted)]">Total Rows</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-display text-[var(--color-text)]">{result.summary.duplicates}</p>
                <p className="text-xs text-[var(--color-muted)]">Duplicates</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-display text-[var(--color-text)]">{result.summary.invalid_phones}</p>
                <p className="text-xs text-[var(--color-muted)]">Invalid Phones</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-display text-[var(--color-text)]">{result.summary.opt_outs}</p>
                <p className="text-xs text-[var(--color-muted)]">Opt-Outs</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
