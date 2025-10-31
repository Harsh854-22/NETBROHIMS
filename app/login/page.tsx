'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, setCurrentUser, sendPasswordResetEmail } from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icons } from '@/components/Icons'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)

      if (!user) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      await setCurrentUser(user)

      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'doctor') {
        router.push('/doctor')
      } else if (user.role === 'patient') {
        router.push('/patient')
      } else if (user.role === 'pharmacist') {
        router.push('/pharmacist')
      } else if (user.role === 'staff') {
        router.push('/staff')
      } else {
        setError('Invalid user role')
        setLoading(false)
      }
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage('')
    setResetLoading(true)
    setResetSuccess(false)

    try {
      const result = await sendPasswordResetEmail(resetEmail)
      setResetMessage(result.message)
      setResetSuccess(result.success)

      if (result.success) {
        setTimeout(() => {
          setShowForgotPassword(false)
          setResetEmail('')
          setResetMessage('')
        }, 3000)
      }
    } catch {
      setResetMessage('An error occurred. Please try again.')
      setResetSuccess(false)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 shadow-2xl">
            <Icons.hospital className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your HIMS account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <Icons.warning className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Icons.mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="your.email@hospital.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Icons.lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <Icons.eyeOff className="w-4 h-4" />
                  ) : (
                    <Icons.eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <Icons.arrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              © 2025 NetBro HIMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            {/* Modal Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 shadow-lg">
                <Icons.key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {/* Message */}
              {resetMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                  resetSuccess
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  {resetSuccess ? (
                    <Icons.checkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <Icons.warning className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    resetSuccess
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {resetMessage}
                  </span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                    <Icons.mail className="w-4 h-10" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-11 pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="your.email@hospital.com"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setResetMessage('')
                    setResetSuccess(false)
                  }}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-5 rounded-xl transition-all hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-semibold py-3 px-5 rounded-xl hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-md"
                >
                  {resetLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Send Reset Link</span>
                      <Icons.send className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setResetMessage('')
                    setResetSuccess(false)
                  }}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
