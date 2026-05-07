import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { requireAdminAuth } from '@/lib/auth'

export async function GET() {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('social_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const body = await req.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('social_leads')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
