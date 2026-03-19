interface CategorizeReplyResult {
  category: 'positive' | 'negative' | 'question' | 'opt_out' | 'scheduling' | 'wrong_number' | 'other'
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
}

export async function categorizeReply(message: string): Promise<CategorizeReplyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      system: `You categorize inbound SMS replies from voters in a political campaign. Respond with JSON only, no other text.

Categories: positive, negative, question, opt_out, scheduling, wrong_number, other
Sentiment: positive, negative, neutral
Confidence: 0.0 to 1.0

Format: {"category":"...","sentiment":"...","confidence":0.0}`,
      messages: [
        { role: 'user', content: `Categorize this voter reply:\n"${message}"` },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`AI categorization failed: ${response.status}`)
  }

  const data = await response.json()
  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text')
  if (!textBlock?.text) {
    throw new Error('No text returned from AI categorization.')
  }

  return JSON.parse(textBlock.text.trim())
}

interface GenerateScriptParams {
  campaignName: string
  campaignDescription: string
  currentScript?: string
  instruction: string
}

const SYSTEM_PROMPT = `You are an AI assistant for a peer-to-peer (P2P) SMS political campaign tool called "Message." Your job is to help campaign staff write effective SMS scripts that volunteers will send to voters.

Guidelines for SMS scripts:
- Keep messages conversational and personal — these are sent by real volunteers, not bots
- Ideal length is under 160 characters per SMS segment (1600 characters absolute max)
- Always include opt-out language: "Reply STOP to opt out" (or similar compliant phrasing)
- Use {first_name} as a merge tag for voter personalization
- Avoid ALL CAPS, excessive punctuation, or aggressive language
- Be persuasive but respectful — voters should feel heard, not pressured
- Include a clear call to action when appropriate (voting reminder, event RSVP, survey question, etc.)
- Follow TCPA compliance best practices for political SMS

Return ONLY the script text. No explanations, no markdown formatting, no quotes around the text.`

export async function generateScriptSuggestion(params: GenerateScriptParams): Promise<string> {
  const { campaignName, campaignDescription, currentScript, instruction } = params

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  let userMessage = `Campaign: ${campaignName}\nDescription: ${campaignDescription}\n\n`

  if (currentScript) {
    userMessage += `Current script:\n${currentScript}\n\n`
  }

  userMessage += `Instruction: ${instruction}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Anthropic API error:', response.status, errorBody)
    throw new Error(`AI service error (${response.status}). Please try again.`)
  }

  const data = await response.json()

  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text')
  if (!textBlock?.text) {
    throw new Error('No text returned from AI service.')
  }

  return textBlock.text.trim()
}

interface GenerateCampaignScriptsParams {
  campaignName: string
  campaignDescription: string
  documentContent: string
  instruction?: string
}

interface GeneratedBranch {
  label: string
  keywords: string[]
  responseBody: string
}

interface GeneratedScripts {
  initialScript: string
  branches: GeneratedBranch[]
}

const CAMPAIGN_SCRIPTS_SYSTEM_PROMPT = `You are an AI assistant for a peer-to-peer (P2P) SMS political campaign tool called "Message." Your job is to generate a complete SMS script package: an initial outbound message and a decision-tree of branched responses for volunteers.

Guidelines for SMS scripts:
- Keep messages conversational and personal — these are sent by real volunteers, not bots
- Ideal length is under 160 characters per SMS segment (1600 characters absolute max)
- Always include opt-out language in the initial script: "Reply STOP to opt out"
- Use {first_name} as a merge tag for voter personalization
- Avoid ALL CAPS, excessive punctuation, or aggressive language
- Be persuasive but respectful — voters should feel heard, not pressured
- Follow TCPA compliance best practices for political SMS

Decision-tree structure:
- The initial_script is the first outbound message sent to voters
- Branches are suggested responses for volunteers based on voter reply categories
- Each branch has a label (e.g. "Positive / Supportive"), keywords that help match voter replies, and a response_body for the volunteer to send
- Include branches for: positive/supportive, negative/opposed, has questions, undecided/neutral, and optionally other relevant categories

You MUST respond with valid JSON only. No markdown, no code fences, no explanation. Use this exact structure:
{
  "initial_script": "The outbound SMS text...",
  "branches": [
    {
      "label": "Positive / Supportive",
      "keywords": ["support", "yes", "agree", "great"],
      "response_body": "Response text for the volunteer to send..."
    }
  ]
}`

export async function generateCampaignScripts(params: GenerateCampaignScriptsParams): Promise<GeneratedScripts> {
  const { campaignName, campaignDescription, documentContent, instruction } = params

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  let userMessage = `Campaign: ${campaignName}\nDescription: ${campaignDescription}\n\n`
  userMessage += `Campaign Materials / Context:\n${documentContent}\n\n`

  if (instruction) {
    userMessage += `Additional instruction: ${instruction}\n\n`
  }

  userMessage += `Generate the initial outbound SMS script and branched response suggestions based on the campaign materials above. Return valid JSON only.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: CAMPAIGN_SCRIPTS_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Anthropic API error:', response.status, errorBody)
    throw new Error(`AI service error (${response.status}). Please try again.`)
  }

  const data = await response.json()

  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text')
  if (!textBlock?.text) {
    throw new Error('No text returned from AI service.')
  }

  let parsed: { initial_script: string; branches: Array<{ label: string; keywords: string[]; response_body: string }> }
  try {
    parsed = JSON.parse(textBlock.text.trim())
  } catch {
    throw new Error('Failed to parse AI response as JSON. Please try again.')
  }

  if (!parsed.initial_script || !Array.isArray(parsed.branches)) {
    throw new Error('AI response missing required fields. Please try again.')
  }

  return {
    initialScript: parsed.initial_script,
    branches: parsed.branches.map((b) => ({
      label: b.label,
      keywords: b.keywords,
      responseBody: b.response_body,
    })),
  }
}
