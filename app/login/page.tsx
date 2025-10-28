'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, setCurrentUser, sendPasswordResetEmail } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState({ email: false, password: false })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

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
      }
    } catch (err) {
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
    } catch (err) {
      setResetMessage('An error occurred. Please try again.')
      setResetSuccess(false)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#EAEBED' }}>
      {/* Modern Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#006989] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#008bb3] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[#004d6b] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#006989 1px, transparent 1px),
                           linear-gradient(90deg, #006989 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="max-w-sm w-full mx-4 relative z-10">
        {/* Main Card with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="px-8 pt-10 pb-6 text-center relative overflow-hidden" style={{ 
            background: 'linear-gradient(135deg, #006989 0%, #008bb3 50%, #004d6b 100%)' 
          }}>
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            
            {/* Animated Icon Container */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm border border-white/30 shadow-lg">
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
              <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-white/90 text-xs font-light tracking-wide">
              Sign in to your Hospital Management System
            </p>
          </div>
          
          {/* Form Section */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start space-x-2 animate-in fade-in duration-300">
                  <div className="flex-shrink-0 w-4 h-4 mt-0.5">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                    onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                    className="peer block w-full px-4 py-3 text-sm bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006989]/20 focus:border-[#006989] transition-all duration-200 placeholder-transparent"
                    placeholder="Enter your email"
                  />
                  <label 
                    htmlFor="email"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${isFocused.email || email ? 'top-1.5 text-xs text-[#006989]' : 'top-3 text-sm text-gray-500'}
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#006989]`}
                  >
                    Email Address
                  </label>
                  <div className="absolute right-3 top-3">
                    <svg className={`w-4 h-4 transition-colors duration-200 ${isFocused.email ? 'text-[#006989]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                    onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                    className="peer block w-full px-4 py-3 text-sm bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006989]/20 focus:border-[#006989] transition-all duration-200 placeholder-transparent"
                    placeholder="Enter your password"
                  />
                  <label 
                    htmlFor="password"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${isFocused.password || password ? 'top-1.5 text-xs text-[#006989]' : 'top-3 text-sm text-gray-500'}
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#006989]`}
                  >
                    Password
                  </label>
                  <div className="absolute right-3 top-3">
                    <svg className={`w-4 h-4 transition-colors duration-200 ${isFocused.password ? 'text-[#006989]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ 
                  background: 'linear-gradient(135deg, #006989 0%, #008bb3 100%)',
                  boxShadow: '0 4px 15px 0 rgba(0, 105, 137, 0.25)'
                }}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#008bb3] to-[#004d6b] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button Content */}
                <div className="relative flex items-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-[#006989] hover:text-[#008bb3] transition-colors duration-200 font-medium"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-white/40 border-t border-white/20">
            <p className="text-center text-xs text-gray-600 font-medium">
              © 2025 Hospital Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-6 text-center" style={{ 
              background: 'linear-gradient(135deg, #006989 0%, #008bb3 100%)' 
            }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-white/80 text-sm mt-2">
                Enter your email to receive a password reset link
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6">
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {/* Success/Error Message */}
                {resetMessage && (
                  <div className={`border rounded-xl px-5 py-4 flex items-start space-x-3 ${
                    resetSuccess 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                      {resetSuccess ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      resetSuccess ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {resetMessage}
                    </span>
                  </div>
                )}

                {/* Email Input */}
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full px-5 py-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006989]/20 focus:border-[#006989] transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute right-4 top-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmail('')
                      setResetMessage('')
                    }}
                    className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 px-5 py-3 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                    style={{ 
                      background: 'linear-gradient(135deg, #006989 0%, #008bb3 100%)',
                    }}
                  >
                    {resetLoading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}