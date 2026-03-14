# Message

**P2P Political Messaging Platform — Open Source Alternative to Hustle & Scale to Win**

An AI-powered SMS platform for political campaigns, built on Twilio. Enables voter outreach with LLM-powered script generation, decision-tree conversations, and comprehensive TCPA/FCC compliance.

## Product

- **Company:** Dev/D (dkdev.io)
- **URL:** votercontact.io/message
- **Tagline:** "Don't Get Hustled"

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **SMS:** Twilio
- **AI:** Anthropic Claude API
- **Auth:** Supabase Auth
- **Database:** Supabase (PostgreSQL) / SQLite (self-hosted)
- **Payments:** Stripe (hosted version)
- **Hosting:** Vercel

## Dependencies

### Core Services
- Twilio (Messaging, Lookup, 10DLC APIs)
- Anthropic Claude API
- Supabase (Auth, Database, Real-time)

### Phase 4 Integrations
- VAN / EveryAction / VoteBuilder (REST API)
- NationBuilder (JSON:API v2, OAuth 2.0)
- DDX (file-based CSV export/import)

### Hosted Version
- Stripe (payment processing)

## Development

```bash
npm install
npm run dev
```

Dev server runs on port **3017**.

## Implementation Phases

1. **Core MVP** — Auth, campaigns, voter lists, messaging, compliance
2. **LLM Integration** — Script generation, decision trees, adaptive learning
3. **Analytics** — Campaign analytics, cross-campaign comparison, PDF export
4. **Integrations** — VAN, NationBuilder, DDX, Stripe, 10DLC
5. **Mobile & Scale** — Mobile app, volunteer rewards, performance
