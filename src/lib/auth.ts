import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient'
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
  role: 'admin' | 'doctor' | 'patient',
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
