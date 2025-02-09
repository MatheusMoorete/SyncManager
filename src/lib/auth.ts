import { auth } from './firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth'

export async function signIn(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error) {
    return {
      user: null,
      error: 'Credenciais inválidas',
    }
  }
}

export async function signUp(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error) {
    return {
      user: null,
      error: 'Erro ao criar conta',
    }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    return { error: 'Erro ao sair' }
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error) {
    return { error: 'Erro ao enviar email de recuperação' }
  }
}
