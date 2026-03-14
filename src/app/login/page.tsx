import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-[var(--color-text)] mb-2">MESSAGE</h1>
          <p className="text-[var(--color-muted)]">Sign in to manage your campaigns</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
