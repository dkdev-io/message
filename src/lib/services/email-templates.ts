const BRAND_COLOR = '#5170FF'
const BRAND_COLOR_HOVER = '#3D5CE6'

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND_COLOR}; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Message</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #eaeaea; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 13px;">Message &mdash; P2P Campaign Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function welcomeEmail(userName: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0] || userName

  const content = `
    <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px; font-weight: 600;">Welcome aboard, ${firstName}!</h2>
    <p style="margin: 0 0 16px; color: #4a4a68; font-size: 15px; line-height: 1.6;">
      Thanks for signing up for <strong>Message</strong>. You now have access to our P2P campaign platform where you can create campaigns, manage volunteers, and reach voters at scale.
    </p>
    <p style="margin: 0 0 24px; color: #4a4a68; font-size: 15px; line-height: 1.6;">
      Here's what you can do next:
    </p>
    <ul style="margin: 0 0 24px; padding-left: 20px; color: #4a4a68; font-size: 15px; line-height: 1.8;">
      <li>Create your first campaign</li>
      <li>Upload a voter contact list</li>
      <li>Invite volunteers to your team</li>
      <li>Draft and send messages</li>
    </ul>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
          <a href="#" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">Get Started</a>
        </td>
      </tr>
    </table>
  `

  return {
    subject: 'Welcome to Message!',
    html: baseLayout(content),
  }
}

export function volunteerInviteEmail(params: {
  campaignName: string
  inviterName: string
  joinUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px; font-weight: 600;">You've been invited!</h2>
    <p style="margin: 0 0 16px; color: #4a4a68; font-size: 15px; line-height: 1.6;">
      <strong>${params.inviterName}</strong> has invited you to volunteer for the <strong>${params.campaignName}</strong> campaign on Message.
    </p>
    <p style="margin: 0 0 24px; color: #4a4a68; font-size: 15px; line-height: 1.6;">
      As a volunteer, you'll be able to send messages to voters, track responses, and help make this campaign a success.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
          <a href="${params.joinUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">Join Campaign</a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0; color: #999999; font-size: 13px; text-align: center;">
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>
  `

  return {
    subject: `You're invited to volunteer for ${params.campaignName}`,
    html: baseLayout(content),
  }
}

export function campaignSummaryEmail(params: {
  campaignName: string
  messagesSent: number
  responses: number
  optOuts: number
}): { subject: string; html: string } {
  const responseRate = params.messagesSent > 0
    ? ((params.responses / params.messagesSent) * 100).toFixed(1)
    : '0.0'

  const content = `
    <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px; font-weight: 600;">Daily Summary</h2>
    <p style="margin: 0 0 24px; color: #4a4a68; font-size: 15px; line-height: 1.6;">
      Here's the daily summary for <strong>${params.campaignName}</strong>:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #f8f9fc; border-radius: 8px; text-align: center; width: 33%;">
          <p style="margin: 0 0 4px; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 700;">${params.messagesSent.toLocaleString()}</p>
          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Messages Sent</p>
        </td>
        <td style="width: 8px;"></td>
        <td style="padding: 16px; background-color: #f8f9fc; border-radius: 8px; text-align: center; width: 33%;">
          <p style="margin: 0 0 4px; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 700;">${params.responses.toLocaleString()}</p>
          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Responses</p>
        </td>
        <td style="width: 8px;"></td>
        <td style="padding: 16px; background-color: #f8f9fc; border-radius: 8px; text-align: center; width: 33%;">
          <p style="margin: 0 0 4px; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 700;">${params.optOuts.toLocaleString()}</p>
          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Opt-Outs</p>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 24px; color: #4a4a68; font-size: 15px; line-height: 1.6;">
      Response rate: <strong>${responseRate}%</strong>
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
          <a href="#" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">View Full Report</a>
        </td>
      </tr>
    </table>
  `

  return {
    subject: `Campaign Summary: ${params.campaignName}`,
    html: baseLayout(content),
  }
}
