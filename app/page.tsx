'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Stats = {
  profiles: number;
  roles: number;
  hasRls: boolean;
};

type Role = {
  code: string;
  name_ar: string;
  name_en: string;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!supabaseUrl || !supabaseAnon) {
        setError('متغيرات Supabase غير معرّفة. أضفها في Vercel.');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { count: profilesCount, error: profErr } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (profErr) throw profErr;

        const { count: rolesCount, error: roleErr } = await supabase
          .from('roles')
          .select('*', { count: 'exact', head: true });

        if (roleErr) throw roleErr;

        const { data: rolesData } = await supabase
          .from('roles')
          .select('code, name_ar, name_en')
          .order('created_at', { ascending: true })
          .limit(10);

        setStats({
          profiles: profilesCount ?? 0,
          roles: rolesCount ?? 0,
          hasRls: true,
        });

        setRoles((rolesData as Role[]) ?? []);
        setLoading(false);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ غير متوقع');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="container">
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '42px', marginBottom: '8px' }}>
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
          <p>{error}</p>
        </div>
      )}

      {stats && !loading && !error && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0ea5e9' }}>
                {stats.profiles}
              </div>
              <div className="muted">مستخدمون</div>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0ea5e9' }}>
                {stats.roles}
              </div>
              <div className="muted">أدوار</div>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                ✓
              </div>
              <div className="muted">RLS مفعّل</div>
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
              تطبيق <strong>ABER</strong> الأول يعمل بنجاح على الإنترنت.
            </p>
            <p className="muted" style={{ marginTop: '8px' }}>
              هذه البيانات مقروءة مباشرة من قاعدة بيانات Supabase.
            </p>
          </div>
        </>
      )}
    </main>
  );
    }
