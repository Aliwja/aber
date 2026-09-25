'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (password !== password2) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseAnon);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        // جلسة فورية → انتقل لصفحة إكمال الملف
        router.push('/complete-profile');
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a
            href="/"
            className="brand"
            style={{
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '16px',
              display: 'inline-flex',
            }}
          >
            <span
              className="brand-logo"
              style={{ width: '36px', height: '36px', fontSize: '18px' }}
            >
              ✦
            </span>
            عابر
          </a>
        </div>

        <h1 className="auth-title">انضم إلى عابر 🌍</h1>
        <p className="auth-sub">
          الخطوة 1 من 2 — أنشئ حسابك ثم أكمل بياناتك الشخصية
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSignup}>
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

          <div className="form-group">
            <label className="form-label">تأكيد كلمة المرور</label>
            <div className="input">
              <span>🔒</span>
              <input
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                dir="ltr"
              />
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              background: 'var(--navy-50)',
              borderRadius: 'var(--r-md)',
              fontSize: '12px',
              color: 'var(--text-2)',
              marginBottom: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>ℹ️</span>
            <span>
              بعد التسجيل، ستُطلب منك إكمال بياناتك (الدولة، المدينة، رقم الجوال،
              الجواز، صورة شخصية).
            </span>
          </div>

          <button
            type="submit"
            className="form-btn"
            disabled={loading}
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="auth-footer">
          لديك حساب؟ <a href="/login">سجّل الدخول</a>
        </p>
      </div>
    </main>
  );
}
