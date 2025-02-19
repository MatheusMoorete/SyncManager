import { describe, it, expect, vi } from 'vitest'
import { signUp, signIn } from '@/lib/auth'
import { auth } from '@/lib/firebase'

vi.mock('@/lib/firebase', () => ({
  auth: {
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
  },
}))

describe('Authentication', () => {
  it('should handle signup correctly', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    vi.mocked(auth.createUserWithEmailAndPassword).mockResolvedValueOnce({
      user: mockUser,
    } as any)

    const result = await signUp('test@example.com', 'password123')
    expect(result.user).toBeTruthy()
    expect(result.error).toBeNull()
  })

  it('should handle signup error', async () => {
    vi.mocked(auth.createUserWithEmailAndPassword).mockRejectedValueOnce(new Error('Auth error'))

    const result = await signUp('test@example.com', 'password123')
    expect(result.user).toBeNull()
    expect(result.error).toBe('Erro ao criar conta')
  })

  it('should handle signin correctly', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    vi.mocked(auth.signInWithEmailAndPassword).mockResolvedValueOnce({
      user: mockUser,
    } as any)

    const result = await signIn('test@example.com', 'password123')
    expect(result.user).toBeTruthy()
    expect(result.error).toBeNull()
  })

  it('should handle signin error', async () => {
    vi.mocked(auth.signInWithEmailAndPassword).mockRejectedValueOnce(new Error('Auth error'))

    const result = await signIn('test@example.com', 'password123')
    expect(result.user).toBeNull()
    expect(result.error).toBe('Credenciais inválidas')
  })
})
