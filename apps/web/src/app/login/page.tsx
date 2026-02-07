import LoginForm from '../auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <LoginForm />
    </div>
  )
}
