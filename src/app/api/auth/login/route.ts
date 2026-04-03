import { NextRequest, NextResponse } from 'next/server'

const USERS: Record<string, string | undefined> = {
  'gustavobduarte0@gmail.com': process.env.AUTH_PASS_GUSTAVO,
  'nathaliateixeirae@gmail.com': process.env.AUTH_PASS_NATHALIA,
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const expected = USERS[normalizedEmail]

    if (!expected || password !== expected) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, email: normalizedEmail })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
