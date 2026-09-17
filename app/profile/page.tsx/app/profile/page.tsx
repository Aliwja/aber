'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: string | null;
  created_at: string;
};

type Role = {
  code: string;
  name_ar: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData.session) {
          router.push('/login');
          return;
        }

        const userId = sessionData.session.user.id;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, locale, created_at')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('roles(code, name_ar)')
          .eq('user_id', userId);

        if (roleError) throw roleError;

        setProfile(profileData as Profile);
        setRoles(
          ((roleData ?? []) as any[])
            .map((r) => r.roles)
            .filter(Boolean) as Role[]
        );
      } catch (e: any) {
        setError(e.message || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient(supabaseUrl, supabaseAnon);
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <p>جاري التحميل...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ paddingTop: '60px' }}>
        <div className="card" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
          <h2 style={{ color: '#dc2626' }}>⚠️ خطأ</h2>
          <p>{error}</p>
          <p className="muted" style={{ marginTop: '12px' }}>
            <a href="/login" style={{ color: '#0ea5e9' }}>→ تسجيل الدخول</a>
          </p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="header-nav">
        <a href="/">← الرئيسية</a>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#0ea5e9',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
              {profile.full_name || 'بدون اسم'}
            </h1>
            <p className="muted" dir="ltr" style={{ textAlign: 'left' }}>
              {profile.email}
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>معلومات الحساب</h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">الاسم:</span>
              <strong>{profile.full_name || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">البريد:</span>
              <strong dir="ltr">{profile.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">الهاتف:</span>
              <strong dir="ltr">{profile.phone || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">اللغة:</span>
              <strong>{profile.locale === 'ar' ? 'العربية' : profile.locale || 'ar'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">تاريخ الانضمام:</span>
              <strong>{new Date(profile.created_at).toLocaleDateString('ar-SA')}</strong>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>الأدوار</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {roles.length === 0 && <p className="muted">لا توجد أدوار</p>}
            {roles.map((role) => (
              <span
                key={role.code}
                style={{
                  padding: '6px 12px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {role.name_ar} ({role.code})
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
