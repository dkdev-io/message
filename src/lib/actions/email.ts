'use server'

import { sendEmail } from '@/lib/services/email'
import { welcomeEmail, volunteerInviteEmail } from '@/lib/services/email-templates'

export async function sendWelcomeEmail(email: string, name: string) {
  const { subject, html } = welcomeEmail(name)
  await sendEmail({ to: email, subject, html })
}

export async function sendVolunteerInviteEmail(
  email: string,
  campaignName: string,
  inviterName: string,
  joinUrl: string
) {
  const { subject, html } = volunteerInviteEmail({ campaignName, inviterName, joinUrl })
  await sendEmail({ to: email, subject, html })
}
