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

// Phone type mapping from Twilio Lookup v2
type TwilioLineType = 'mobile' | 'landline' | 'voip' | 'fixedVoip' | 'nonFixedVoip' | 'tollFree' | 'unknown'
type PhoneType = 'mobile' | 'landline' | 'voip' | 'unknown'

function mapLineType(twilioType: TwilioLineType): PhoneType {
  switch (twilioType) {
    case 'mobile': return 'mobile'
    case 'landline': return 'landline'
    case 'voip':
    case 'fixedVoip':
    case 'nonFixedVoip': return 'voip'
    default: return 'unknown'
  }
}

export async function lookupPhoneType(
  phone: string,
  accountSid: string,
  authToken: string
): Promise<PhoneType> {
  const encoded = encodeURIComponent(phone)
  const response = await fetch(
    `https://lookups.twilio.com/v2/PhoneNumbers/${encoded}?Fields=line_type_intelligence`,
    {
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
    }
  )

  if (!response.ok) {
    console.error(`Twilio Lookup failed for ${phone}: ${response.status}`)
    return 'unknown'
  }

  const data = await response.json()
  const lineType = data.line_type_intelligence?.type as TwilioLineType | undefined
  return lineType ? mapLineType(lineType) : 'unknown'
}

// 10DLC Brand Registration via Twilio
export async function registerBrand(
  accountSid: string,
  authToken: string,
  brand: {
    brandName: string
    ein: string
    vertical: string
    contactEmail: string
    contactPhone: string
    websiteUrl?: string
  }
): Promise<{ brandSid: string; status: string }> {
  const response = await fetch(
    `https://messaging.twilio.com/v1/a2p/BrandRegistrations`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        CustomerProfileBundleSid: '', // Will be created via trust hub
        A2PProfileBundleSid: '',
        BrandType: 'STANDARD',
      }).toString(),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || `10DLC brand registration failed: ${response.status}`)
  }

  return { brandSid: data.sid, status: data.status }
}

// 10DLC Campaign Registration via Twilio
export async function registerCampaign(
  accountSid: string,
  authToken: string,
  params: {
    brandSid: string
    useCase: string
    description: string
    sampleMessages: string[]
    messagingServiceSid: string
  }
): Promise<{ campaignSid: string; status: string }> {
  const body = new URLSearchParams({
    BrandRegistrationSid: params.brandSid,
    UseCase: 'POLITICAL',
    Description: params.description,
    MessageFlow: params.useCase,
    MessagingServiceSid: params.messagingServiceSid,
    HasEmbeddedLinks: 'false',
    HasEmbeddedPhone: 'false',
  })

  params.sampleMessages.forEach((msg, i) => {
    body.append(`MessageSamples`, msg)
  })

  const response = await fetch(
    `https://messaging.twilio.com/v1/a2p/BrandRegistrations/${params.brandSid}/Campaigns`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || `10DLC campaign registration failed: ${response.status}`)
  }

  return { campaignSid: data.sid, status: data.status }
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
