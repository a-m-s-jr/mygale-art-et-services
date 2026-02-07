import Link from 'next/link'
import LoginForm from '../LoginForm'

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
      <LoginForm />

      <div className="mt-4 text-sm text-gray-400">
        Need an account?{' '}
        <Link href="/auth/signup" className="text-indigo-400">
          Sign up
        </Link>
      </div>
    </div>
  )
}
