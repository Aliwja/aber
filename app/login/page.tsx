'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient(supabaseUrl, supabaseAnon);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data.session) router.push('/profile');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="auth-wrap">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" className="brand" style={{ justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
            <span className="brand-logo" style={{ width: '36px', height: '36px', fontSize: '18px' }}>✦</span>
            عابر
          </a>
        </div>

        <h1 className="auth-title">مرحبًا بعودتك 👋</h1>
        <p className="auth-sub">سجّل دخولك إلى عابر</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div className="input">
              <span>✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div className="input">
              <span>🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className="form-btn" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="divider">
          <hr />
          <span>أو</span>
          <hr />
        </div>

        <p className="auth-footer" style={{ marginTop: '0', paddingTop: '0' }}>
          ليس لديك حساب؟ <a href="/signup">سجّل الآن</a>
        </p>

        <p className="auth-footer">
          <a href="/" style={{ color: 'var(--text-2)' }}>← العودة للرئيسية</a>
        </p>
      </div>
    </main>
  );
}
