'use client'

import { useState } from 'react'
import { Upload, Trash2, FileText, Sparkles, Check, AlertCircle, Loader2, Plus } from 'lucide-react'
import { uploadDocument, deleteDocument } from '@/lib/actions/documents'
import { generateScriptsFromDocs } from '@/lib/actions/ai'
import { saveScript } from '@/lib/actions/scripts'
import { saveBranch } from '@/lib/actions/branches'

interface Document {
  id: string
  campaign_id: string
  name: string
  content: string
  doc_type: string
  created_at: string
}

interface GeneratedBranch {
  label: string
  keywords: string[]
  responseBody: string
}

interface GeneratedResult {
  initialScript: string
  branches: GeneratedBranch[]
}

interface CampaignDocumentsProps {
  campaignId: string
  initialDocuments: Document[]
}

export default function CampaignDocuments({ campaignId, initialDocuments }: CampaignDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [pasteName, setPasteName] = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [instruction, setInstruction] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null)

  const [isApplying, setIsApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)

  async function handlePasteSubmit() {
    if (!pasteName.trim() || !pasteContent.trim()) {
      setUploadError('Name and content are required.')
      return
    }

    setIsUploading(true)
    setUploadError('')
    try {
      const doc = await uploadDocument(campaignId, pasteName.trim(), pasteContent.trim(), 'paste')
      setDocuments((prev) => [doc, ...prev])
      setPasteName('')
      setPasteContent('')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload document.')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
      setUploadError(`For .${ext} files, please copy and paste the text content directly for best results. Client-side parsing is not yet supported.`)
      e.target.value = ''
      return
    }

    if (ext !== 'txt') {
      setUploadError('Unsupported file type. Please use .txt files or paste text directly.')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    setUploadError('')
    try {
      const text = await file.text()
      const doc = await uploadDocument(campaignId, file.name, text, 'txt')
      setDocuments((prev) => [doc, ...prev])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(docId: string) {
    try {
      await deleteDocument(docId, campaignId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to delete document.')
    }
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setGenerateError('')
    setGeneratedResult(null)
    setApplySuccess(false)
    try {
      const result = await generateScriptsFromDocs(campaignId, instruction || undefined)
      setGeneratedResult(result)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate scripts.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleApply() {
    if (!generatedResult) return

    setIsApplying(true)
    try {
      // Save the initial script
      await saveScript(campaignId, generatedResult.initialScript)

      // Save each branch
      for (let i = 0; i < generatedResult.branches.length; i++) {
        const branch = generatedResult.branches[i]
        await saveBranch(campaignId, {
          label: branch.label,
          keywords: branch.keywords,
          responseBody: branch.responseBody,
          sortOrder: i + 1,
        })
      }

      setApplySuccess(true)
      setGeneratedResult(null)

      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to apply scripts.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Paste Text Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--color-text)]">Paste Campaign Materials</h3>
        <input
          type="text"
          value={pasteName}
          onChange={(e) => setPasteName(e.target.value)}
          placeholder="Document name (e.g. Policy Brief)"
          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
        />
        <textarea
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
          placeholder="Paste campaign material text here..."
          rows={4}
          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 resize-y"
        />
        <button
          onClick={handlePasteSubmit}
          disabled={isUploading || !pasteName.trim() || !pasteContent.trim()}
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-4 py-2 text-sm font-display transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {isUploading ? 'ADDING...' : 'ADD DOCUMENT'}
        </button>
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--color-text)]">Upload File</h3>
        <p className="text-xs text-[var(--color-muted)]">
          Upload .txt files directly. For PDF and DOCX files, paste the text content above for best results.
        </p>
        <label className="inline-flex items-center gap-2 border border-[var(--color-muted)]/30 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)]/30 rounded-lg px-4 py-2 text-sm font-display transition-colors cursor-pointer">
          <Upload size={14} />
          CHOOSE FILE
          <input
            type="file"
            accept=".txt,.doc,.docx,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={14} />
          {uploadError}
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-text)]">Uploaded Documents ({documents.length})</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-[var(--color-accent)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--color-text)] truncate">{doc.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {doc.doc_type.toUpperCase()} &middot; {doc.content.length.toLocaleString()} chars
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-[var(--color-muted)] hover:text-red-400 transition-colors shrink-0 ml-2"
                  title="Delete document"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Scripts Section */}
      {documents.length > 0 && (
        <div className="border-t border-[var(--color-muted)]/20 pt-6 space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text)]">Generate Scripts from Documents</h3>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Optional instruction (e.g. Focus on healthcare policy)"
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                GENERATE SCRIPTS FROM DOCUMENTS
              </>
            )}
          </button>

          {generateError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              {generateError}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="space-y-4 bg-[var(--color-bg)] border border-[var(--color-accent)]/30 rounded-xl p-5">
              <h4 className="font-display text-sm text-[var(--color-accent)]">GENERATED PREVIEW</h4>

              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Initial Script</p>
                <div className="bg-[var(--color-surface)] border border-[var(--color-muted)]/20 rounded-lg p-3 text-sm text-[var(--color-text)] whitespace-pre-wrap">
                  {generatedResult.initialScript}
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {generatedResult.initialScript.length} characters
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[var(--color-muted)]">Response Branches ({generatedResult.branches.length})</p>
                {generatedResult.branches.map((branch, idx) => (
                  <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-muted)]/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-[var(--color-text)] mb-1">{branch.label}</p>
                    <p className="text-xs text-[var(--color-muted)] mb-2">
                      Keywords: {branch.keywords.join(', ')}
                    </p>
                    <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{branch.responseBody}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      APPLYING...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      APPLY SCRIPTS
                    </>
                  )}
                </button>
                <button
                  onClick={() => setGeneratedResult(null)}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {applySuccess && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check size={14} />
              Scripts applied successfully! Reloading...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
