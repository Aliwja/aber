'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Role = {
  code: string;
  name_ar: string;
  name_en: string;
};

export default function HomePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user.email) {
          setUserEmail(sessionData.session.user.email);
        }

        const { data: rolesData, error: roleErr } = await supabase
          .from('roles')
          .select('code, name_ar, name_en')
          .order('created_at', { ascending: true })
          .limit(20);

        if (roleErr) throw roleErr;

        setRoles((rolesData as Role[]) ?? []);
        setConnected(true);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="container">
      <div className="header-nav">
        <strong style={{ color: '#0ea5e9', fontSize: '18px' }}>عابر 🌍</strong>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {userEmail ? (
            <a href="/profile">حسابي</a>
          ) : (
            <>
              <a href="/login">تسجيل الدخول</a>
              <a href="/signup">حساب جديد</a>
            </>
          )}
        </div>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '38px', marginBottom: '8px' }}>
          مرحبًا بك في <span style={{ color: '#0ea5e9' }}>عابر</span> 🌍
        </h1>
        <p className="muted" style={{ fontSize: '18px' }}>
          العالم أقرب مما تتخيل
        </p>
      </header>

      {loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>جاري التحميل...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
          <h2 style={{ color: '#dc2626' }}>⚠️ خطأ</h2>
          <p style={{ wordBreak: 'break-word' }}>{error}</p>
        </div>
      )}

      {!loading && !error && connected && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0ea5e9' }}>
                {roles.length}
              </div>
              <div className="muted">أدوار</div>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                ✓
              </div>
              <div className="muted">متصل بـ Supabase</div>
            </div>
          </div>

          <div className="card">
            <h2>الأدوار في النظام</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              {roles.map((role) => (
                <div
                  key={role.code}
                  style={{
                    padding: '12px 16px',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontWeight: '700' }}>{role.name_ar}</div>
                  <div className="muted" style={{ fontSize: '12px' }}>
                    {role.code}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <h2>🎉 مبروك!</h2>
            <p>
              تطبيق <strong>ABER</strong> متصل بـ Supabase بنجاح.
            </p>
            <p className="muted" style={{ marginTop: '12px' }}>
              جرّب: <a href="/signup" style={{ color: '#0ea5e9', fontWeight: 600 }}>أنشئ حسابًا جديدًا</a> ←
            </p>
          </div>
        </>
      )}
    </main>
  );
}
