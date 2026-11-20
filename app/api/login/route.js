export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { turso } from '../../../lib/turso';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ status: 'error', msg: 'Username dan Password wajib diisi!' });
    }

    const inputUser = String(username).trim();
    const inputPass = String(password).trim();

    // Bisa login menggunakan Username atau NISN
    const res = await turso.execute({
      sql: `SELECT * FROM Users 
            WHERE LOWER(TRIM(COALESCE(Username, username, ''))) = LOWER(?) 
               OR TRIM(COALESCE(NISN, nisn, '')) = ? 
            LIMIT 1`,
      args: [inputUser, inputUser]
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ status: 'error', msg: 'Username atau NISN tidak ditemukan!' });
    }

    const user = res.rows[0];
    const dbPass = String(user.Password ?? user.password ?? '').trim();

    if (dbPass !== inputPass) {
      return NextResponse.json({ status: 'error', msg: 'Password salah!' });
    }

    return NextResponse.json({
      status: 'success',
      data: user,
      logo: 'https://lh3.googleusercontent.com/d/1U1RMuR5nBSVumM7zCr-ZX0QHYLWxXXUJ'
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', msg: error.message }, { status: 500 });
  }
}
