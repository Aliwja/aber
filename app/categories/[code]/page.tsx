'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Category = {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  icon: string | null;
  cover_image_url: string | null;
};

export default function CategoryPage({ params }: { params: { code: string } }) {
  const code = params.code;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { data, error: err } = await supabase
          .from('categories')
          .select('*')
          .eq('code', code)
          .maybeSingle();

        if (err) throw err;
        if (!data) {
          setError('التصنيف غير موجود');
          setLoading(false);
          return;
        }

        setCategory(data as Category);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  if (loading) {
    return (
      <main style={{ background: '#f5efe6', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#7a6f5f' }}>جاري التحميل...</p>
      </main>
    );
  }

  if (error || !category) {
    return (
      <main style={{ background: '#f5efe6', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ color: '#1a2942', marginBottom: '16px' }}>
            {error || 'التصنيف غير موجود'}
          </h1>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#1e3a5f',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 600,
          }}>← العودة للرئيسية</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#f5efe6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: '#faf6ef',
        borderBottom: '1px solid #e5dcc9',
      }}>
        <a href="/" style={{ color: '#1e3a5f', fontWeight: 600, fontSize: '14px' }}>
          ← الرئيسية
        </a>
        <span style={{ color: '#1e3a5f', fontWeight: 800, fontSize: '18px' }}>عابر 🌍</span>
      </div>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '50px 20px',
        background: 'linear-gradient(135deg, #f5efe6 0%, #e5dcc9 100%)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {getCategoryEmoji(category.code)}
        </div>
        <h1 style={{ fontSize: '38px', color: '#1a2942', marginBottom: '8px', fontWeight: 800 }}>
          {category.name_ar}
        </h1>
        <p style={{ color: '#7a6f5f', fontSize: '17px' }}>
          {category.name_en}
        </p>
      </section>

      {/* Placeholder for listings */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <div style={{
          padding: '60px 40px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5dcc9',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>
            {getCategoryEmoji(category.code)}
          </div>
          <h2 style={{ color: '#1a2942', marginBottom: '12px', fontSize: '22px' }}>
            قريبًا
          </h2>
          <p style={{ color: '#7a6f5f', fontSize: '15px', marginBottom: '24px' }}>
            ستُعرض هنا جميع {category.name_ar} في الدول المختلفة
          </p>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#1e3a5f',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 600,
          }}>
            ← تصفح الأقسام الأخرى
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1e3a5f',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          عابر 🌍
        </div>
        <p style={{ opacity: 0.8, fontSize: '14px' }}>العالم أقرب مما تتخيل</p>
        <p style={{ opacity: 0.5, fontSize: '12px', marginTop: '20px' }}>
          © 2026 ABER — جميع الحقوق محفوظة
        </p>
      </footer>
    </main>
  );
}

function getCategoryEmoji(code: string): string {
  const map: Record<string, string> = {
    hotels: '🏨',
    resorts: '🌴',
    apartments: '🏢',
    restaurants: '🍽️',
    cafes: '☕',
    activities: '🎢',
    experiences: '⭐',
    tours: '🗺️',
    guides: '👤',
    transportation: '🚗',
    car_rental: '🔑',
    events: '🎉',
    shopping: '🛍️',
    beaches: '🏖️',
    nature: '🌲',
    history: '🏛️',
    family: '👨‍👩‍👧',
    adventure: '⛰️',
  };
  return map[code] || '📍';
}
