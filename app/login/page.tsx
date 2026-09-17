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

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        router.push('/profile');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: '60px' }}>
      <div className="card form">
        <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
          مرحبًا بعودتك 👋
        </h1>
        <p className="muted" style={{ textAlign: 'center', marginBottom: '28px' }}>
          سجّل دخولك إلى عابر
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              dir="ltr"
            />
          </div>

          <button type="submit" className="form-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="form-link">
          ليس لديك حساب؟ <a href="/signup">أنشئ حسابًا جديدًا</a>
        </div>

        <div className="form-link">
          <a href="/">← العودة للرئيسية</a>
        </div>
      </div>
    </main>
  );
}
