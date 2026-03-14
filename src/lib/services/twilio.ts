interface SendSmsParams {
  accountSid: string
  authToken: string
  from: string
  to: string
  body: string
  statusCallback?: string
}

interface TwilioMessageResponse {
  sid: string
  status: string
  error_code: string | null
  error_message: string | null
}

export async function sendSms(params: SendSmsParams): Promise<TwilioMessageResponse> {
  const { accountSid, authToken, from, to, body, statusCallback } = params

  const formBody = new URLSearchParams({
    From: from,
    To: to,
    Body: body,
  })

  if (statusCallback) {
    formBody.append('StatusCallback', statusCallback)
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `Twilio error: ${response.status}`)
  }

  return data
}

export async function validateTwilioCredentials(accountSid: string, authToken: string): Promise<boolean> {
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
    {
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
    }
  )
  return response.ok
}
