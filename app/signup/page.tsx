'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient(supabaseUrl, supabaseAnon);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.push('/profile');
      } else {
        setError('تم إنشاء الحساب. تحقق من بريدك لتأكيد الحساب.');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في التسجيل');
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

        <h1 className="auth-title">انضم إلى عابر 🌍</h1>
        <p className="auth-sub">أنشئ حسابك وابدأ رحلتك حول العالم</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <div className="input">
              <span>👤</span>
              <input
                type="text"
                placeholder="محمد عبدالله"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="8 أحرف على الأقل"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                dir="ltr"
              />
            </div>
          </div>

          <label style={{
            display: 'flex',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-2)',
            margin: '12px 0 20px',
          }}>
            <input type="checkbox" required style={{ accentColor: 'var(--navy-500)', marginTop: '2px' }} />
            <span>
              أوافق على <a style={{ color: 'var(--navy-500)', fontWeight: 600, cursor: 'pointer' }}>الشروط والأحكام</a> و <a style={{ color: 'var(--navy-500)', fontWeight: 600, cursor: 'pointer' }}>سياسة الخصوصية</a>
            </span>
          </label>

          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="divider">
          <hr />
          <span>أو</span>
          <hr />
        </div>

        <p className="auth-footer" style={{ marginTop: '0', paddingTop: '0' }}>
          لديك حساب؟ <a href="/login">سجّل الدخول</a>
        </p>

        <p className="auth-footer">
          <a href="/" style={{ color: 'var(--text-2)' }}>← العودة للرئيسية</a>
        </p>
      </div>
    </main>
  );
}
