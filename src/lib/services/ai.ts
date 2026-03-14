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
