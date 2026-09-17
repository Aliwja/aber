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
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        // تم التسجيل تلقائيًا (Email confirmation معطّل)
        router.push('/profile');
      } else {
        // يحتاج تأكيد بريد
        setError('تم إنشاء الحساب. تحقق من بريدك لتأكيد الحساب.');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: '60px' }}>
      <div className="card form">
        <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
          انضم إلى عابر 🌍
        </h1>
        <p
          className="muted"
          style={{ textAlign: 'center', marginBottom: '28px' }}
        >
          أنشئ حسابك وابدأ رحلتك
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              الاسم الكامل
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="محمد عبدالله"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              البريد الإلكتروني
            </label>
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
            <label className="form-label" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="8 أحرف على الأقل"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="form-btn"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="form-link">
          لديك حساب؟ <a href="/login">سجّل الدخول</a>
        </div>

        <div className="form-link">
          <a href="/">← العودة للرئيسية</a>
        </div>
      </div>
    </main>
  );
}
