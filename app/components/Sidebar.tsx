'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Profile = {
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient(supabaseUrl, supabaseAnon);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data } = await supabase
        .from('profiles')
        .select('email, full_name, avatar_url')
        .eq('id', sessionData.session.user.id)
        .maybeSingle();

      if (data) setProfile(data as Profile);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient(supabaseUrl, supabaseAnon);
    await supabase.auth.signOut();
    router.push('/login');
  }

  const menuItems = [
    { href: '/', icon: '🏠', label: 'الرئيسية' },
    { href: '/bookings', icon: '🧳', label: 'حجوزاتي' },
    { href: '/favorites', icon: '❤️', label: 'المفضلة' },
    { href: '/settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  const initial = (profile?.full_name || profile?.email || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`aber-sidebar ${isOpen ? 'open' : ''}`}>
        {/* User */}
        <a
          href="/profile"
          className="sidebar-user"
          onClick={onClose}
        >
          <div className="sidebar-user-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'avatar'} />
            ) : (
              initial
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {profile?.full_name || 'بدون اسم'}
            </div>
            <div className="sidebar-user-email" dir="ltr">
              {profile?.email}
            </div>
          </div>
        </a>

        {/* Menu */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {menuItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-menu-item ${active ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 تسجيل الخروج
        </button>
      </aside>
    </>
  );
}
