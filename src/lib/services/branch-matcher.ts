export interface BranchMatch {
  id: string
  label: string
  response_body: string
}

export interface Branch {
  id: string
  label: string
  keywords: string[]
  response_body: string
}

export function matchBranch(
  inboundMessage: string,
  branches: Branch[]
): BranchMatch | null {
  const normalized = inboundMessage.toLowerCase().trim()

  for (const branch of branches) {
    for (const keyword of branch.keywords) {
      const kw = keyword.toLowerCase().trim()
      if (kw && normalized.includes(kw)) {
        return { id: branch.id, label: branch.label, response_body: branch.response_body }
      }
    }
  }

  return null
}
