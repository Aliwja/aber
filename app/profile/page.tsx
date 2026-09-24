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
        setRoles(((roleData ?? []) as any[]).map((r) => r.roles).filter(Boolean) as Role[]);
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
      <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
        <p className="muted">جاري التحميل...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          <div className="form-error">⚠️ {error}</div>
          <a href="/login" className="btn btn-primary btn-full mt-4">تسجيل الدخول</a>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const initial = (profile.full_name || profile.email).charAt(0).toUpperCase();

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="app-header">
        <a href="/" className="brand">
          <span className="brand-logo">✦</span>
          عابر
        </a>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          🚪 خروج
        </button>
      </header>

      {/* Profile Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy-500), var(--navy-900))',
        padding: '40px 20px 30px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--gold-500)',
          display: 'grid',
          placeItems: 'center',
          fontSize: '32px',
          fontWeight: 800,
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(193, 154, 78, 0.4)',
        }}>
          {initial}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>
          {profile.full_name || 'بدون اسم'}
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.8 }} dir="ltr">
          {profile.email}
        </p>
      </section>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>

        {/* Info Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-card)',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '16px',
            color: 'var(--navy-500)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            ℹ️ معلومات الحساب
          </h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            <InfoRow label="الاسم" value={profile.full_name || '—'} />
            <InfoRow label="البريد" value={profile.email} ltr />
            <InfoRow label="الهاتف" value={profile.phone || '—'} ltr />
            <InfoRow label="اللغة" value={profile.locale === 'ar' ? 'العربية' : profile.locale || 'ar'} />
            <InfoRow
              label="تاريخ الانضمام"
              value={new Date(profile.created_at).toLocaleDateString('ar-SA')}
            />
          </div>
        </div>

        {/* Roles Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-card)',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '16px',
            color: 'var(--navy-500)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            🎭 الأدوار
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {roles.length === 0 && <p className="muted">لا توجد أدوار</p>}
            {roles.map((role) => (
              <span
                key={role.code}
                style={{
                  padding: '6px 14px',
                  background: 'var(--navy-50)',
                  color: 'var(--navy-500)',
                  borderRadius: 'var(--r-pill)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {role.name_ar} ({role.code})
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-card)',
          overflow: 'hidden',
        }}>
          <MenuLink icon="🧳" label="رحلاتي" href="/trips" />
          <MenuLink icon="📅" label="حجوزاتي" href="/bookings" />
          <MenuLink icon="❤️" label="المفضلة" href="/favorites" />
          <MenuLink icon="🌐" label="الدول" href="/countries" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-full"
          style={{
            marginTop: '16px',
            background: 'transparent',
            color: 'var(--danger)',
            border: '1.5px solid #fee2e2',
          }}
        >
          🚪 تسجيل الخروج
        </button>
      </div>
    </main>
  );
}

function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>{label}</span>
      <strong style={{ fontSize: '13px', color: 'var(--text)' }} dir={ltr ? 'ltr' : 'rtl'}>
        {value}
      </strong>
    </div>
  );
}

function MenuLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        fontSize: '14px',
        color: 'var(--text)',
        textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--text-3)', fontSize: '14px' }}>←</span>
    </a>
  );
}
