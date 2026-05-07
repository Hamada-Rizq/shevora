import { NextResponse } from 'next/server'
import { verifyAdminCredentials, setAdminSession, clearAdminSession } from '@/lib/auth'

export async function POST(req: Request) {
  const { username, password, action } = await req.json()

  if (action === 'logout') {
    await clearAdminSession()
    return NextResponse.json({ success: true })
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'بيانات مطلوبة' }, { status: 400 })
  }

  const valid = await verifyAdminCredentials(username, password)

  if (!valid) {
    return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
  }

  await setAdminSession()
  return NextResponse.json({ success: true })
}
