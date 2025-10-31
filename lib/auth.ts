import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist'
  phone?: string
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      console.error('User not found:', error)
      return null
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    
    if (!passwordMatch) {
      console.error('Password mismatch')
      return null
    }

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export async function createUser(
  email: string,
  name: string,
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist',
  password: string,
  phone?: string
): Promise<User | null> {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role,
        password_hash: passwordHash,
        phone
      })
      .select()
      .single()

    if (error || !user) {
      console.error('Error creating user:', error)
      return null
    }

    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error('Create user error:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null
  
  const userJson = localStorage.getItem('currentUser')
  if (!userJson) return null
  
  return JSON.parse(userJson) as User
}

export async function setCurrentUser(user: User | null): Promise<void> {
  if (typeof window === 'undefined') return
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentUser')
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single()

    if (error || !user) {
      // For security, don't reveal if email exists or not
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link shortly.'
      }
    }

    // Use Supabase Auth to send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (resetError) {
      console.error('Password reset error:', resetError)
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      }
    }

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.'
    }
  } catch (error) {
    console.error('Send password reset error:', error)
    return {
      success: false,
      message: 'An error occurred. Please try again later.'
    }
  }
}

export async function resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get current session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: 'Invalid or expired reset link.'
      }
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update password in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', user.email)

    if (updateError) {
      console.error('Password update error:', updateError)
      return {
        success: false,
        message: 'Failed to update password. Please try again.'
      }
    }

    // Sign out the user
    await supabase.auth.signOut()

    return {
      success: true,
      message: 'Password updated successfully. Please login with your new password.'
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      message: 'An error occurred. Please try again later.'
    }
  }
}
