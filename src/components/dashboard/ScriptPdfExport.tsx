'use client'

import { Printer } from 'lucide-react'

interface Branch {
  id: string
  label: string
  keywords: string[]
  response_body: string
}

interface ScriptPdfExportProps {
  campaignName: string
  campaignDescription?: string
  activeScript: string | null
  branches: Branch[]
}

export default function ScriptPdfExport({
  campaignName,
  campaignDescription,
  activeScript,
  branches,
}: ScriptPdfExportProps) {
  function handlePrint() {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const branchesHtml = branches
      .map(
        (b, i) => `
        <div style="margin-bottom: 18px; padding: 14px 16px; border: 1px solid #ddd; border-radius: 6px;">
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
            <div style="width: 18px; height: 18px; border: 2px solid #333; border-radius: 3px; flex-shrink: 0; margin-top: 2px;"></div>
            <div>
              <strong style="font-size: 14px;">Branch ${i + 1}: ${b.label}</strong>
              <div style="font-size: 11px; color: #666; margin-top: 2px;">Keywords: ${b.keywords.join(', ')}</div>
            </div>
          </div>
          <div style="margin-left: 28px; padding: 10px 12px; background: #f9f9f9; border-radius: 4px; font-size: 13px; line-height: 1.5;">
            ${b.response_body}
          </div>
        </div>`
      )
      .join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${campaignName} — Script Export</title>
  <style>
    @page { margin: 0.75in; size: letter; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 0; font-size: 13px; line-height: 1.5; }
    .header { border-bottom: 3px solid #5170FF; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0 0 4px; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
    .header .meta { font-size: 12px; color: #666; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin: 0 0 14px; }
    .initial-script { padding: 14px 16px; border: 1px solid #ddd; border-radius: 6px; }
    .initial-script .checkbox-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .initial-script .checkbox { width: 18px; height: 18px; border: 2px solid #333; border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
    .initial-script .body { padding: 10px 12px; background: #f9f9f9; border-radius: 4px; margin-left: 28px; font-size: 13px; line-height: 1.6; }
    .approval-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; }
    .approval-section h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 20px; }
    .approval-box { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 13px; }
    .approval-box .checkbox { width: 18px; height: 18px; border: 2px solid #333; border-radius: 3px; flex-shrink: 0; }
    .signature-section { margin-top: 48px; }
    .sig-line { border-bottom: 1px solid #333; width: 280px; margin-bottom: 6px; height: 32px; }
    .sig-label { font-size: 11px; color: #666; }
    .sig-row { display: flex; gap: 48px; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${campaignName}</h1>
    ${campaignDescription ? `<div class="meta">${campaignDescription}</div>` : ''}
    <div class="meta">Exported: ${today}</div>
  </div>

  <div class="section">
    <h2>Initial Script</h2>
    <div class="initial-script">
      <div class="checkbox-row">
        <div class="checkbox"></div>
        <strong>Approved</strong>
      </div>
      <div class="body">${activeScript || '<em>No active script</em>'}</div>
    </div>
  </div>

  ${branches.length > 0 ? `
  <div class="section">
    <h2>Response Branches</h2>
    ${branchesHtml}
  </div>
  ` : ''}

  <div class="approval-section">
    <h2>Campaign Approval</h2>
    <div class="approval-box">
      <div class="checkbox"></div>
      <span>All scripts reviewed and approved for voter contact</span>
    </div>
    <div class="approval-box">
      <div class="checkbox"></div>
      <span>TCPA compliance verified — opt-out language included</span>
    </div>
    <div class="approval-box">
      <div class="checkbox"></div>
      <span>10DLC registration complete (if applicable)</span>
    </div>
    <div class="approval-box">
      <div class="checkbox"></div>
      <span>Quiet hours configuration reviewed</span>
    </div>
  </div>

  <div class="signature-section">
    <div class="sig-row">
      <div>
        <div class="sig-line"></div>
        <div class="sig-label">Campaign Manager Signature</div>
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-label">Date</div>
      </div>
    </div>
  </div>

  <div class="footer">
    ${campaignName} — Generated by Message Platform — ${today}
  </div>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-muted)]/30 rounded-lg px-3 py-2 text-sm transition-colors"
    >
      <Printer size={14} />
      Export PDF
    </button>
  )
}
