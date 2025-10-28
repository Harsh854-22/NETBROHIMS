'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await resetPassword(newPassword)
      
      if (result.success) {
        setSuccess(result.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EAEBED' }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="px-10 pt-12 pb-8 text-center" style={{ 
            background: 'linear-gradient(135deg, #006989 0%, #008bb3 50%, #004d6b 100%)' 
          }}>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-5 backdrop-blur-sm border border-white/30 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Reset Password
            </h1>
            <p className="text-white/90 text-sm font-light tracking-wide">
              Enter your new password below
            </p>
          </div>
          
          {/* Form Section */}
          <div className="px-10 py-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-700 text-sm font-medium">{success}</p>
                    <p className="text-green-600 text-xs mt-1">Redirecting to login...</p>
                  </div>
                </div>
              )}
              
              {/* New Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-5 py-4 text-sm bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006989]/20 focus:border-[#006989] transition-all duration-200"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-[#006989] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-5 py-4 text-sm bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006989]/20 focus:border-[#006989] transition-all duration-200"
                    placeholder="Confirm your new password"
                    minLength={6}
                  />
                  <div className="absolute right-4 top-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-blue-800 mb-2">Password Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-center space-x-2">
                    <svg className={`w-4 h-4 ${newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>At least 6 characters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className={`w-4 h-4 ${newPassword === confirmPassword && newPassword !== '' ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Passwords match</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success !== ''}
                className="w-full group relative flex justify-center items-center py-4 px-5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ 
                  background: 'linear-gradient(135deg, #006989 0%, #008bb3 100%)',
                  boxShadow: '0 4px 15px 0 rgba(0, 105, 137, 0.25)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#008bb3] to-[#004d6b] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : success ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Success!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span>Reset Password</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => router.push('/login')}
                className="text-sm text-[#006989] hover:text-[#008bb3] transition-colors duration-200 font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Login</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-5 bg-white/40 border-t border-white/20">
            <p className="text-center text-xs text-gray-600 font-medium">
              © 2025 Hospital Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
