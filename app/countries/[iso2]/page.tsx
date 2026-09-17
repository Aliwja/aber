'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Country = {
  id: string;
  iso2: string;
  name_ar: string;
  name_en: string;
  flag_url: string | null;
  currency_code: string | null;
};

type City = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  cover_image_url: string | null;
};

export default function CountryPage({ params }: { params: { iso2: string } }) {
  const iso2 = params.iso2?.toUpperCase();
  const [country, setCountry] = useState<Country | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { data: countryData, error: countryErr } = await supabase
          .from('countries')
          .select('*')
          .eq('iso2', iso2)
          .maybeSingle();

        if (countryErr) throw countryErr;
        if (!countryData) {
          setError('الدولة غير موجودة');
          setLoading(false);
          return;
        }

        setCountry(countryData as Country);

        const { data: citiesData, error: citiesErr } = await supabase
          .from('cities')
          .select('id, name_ar, name_en, slug, cover_image_url')
          .eq('country_id', countryData.id)
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('name_ar', { ascending: true });

        if (citiesErr) throw citiesErr;
        setCities((citiesData as City[]) ?? []);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [iso2]);

  if (loading) {
    return (
      <main style={{ background: '#f5efe6', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#7a6f5f' }}>جاري التحميل...</p>
      </main>
    );
  }

  if (error || !country) {
    return (
      <main style={{ background: '#f5efe6', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ color: '#1a2942', marginBottom: '16px' }}>
            {error || 'الدولة غير موجودة'}
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
        {country.flag_url && (
          <img
            src={country.flag_url}
            alt={country.name_ar}
            style={{
              width: '96px',
              height: '64px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '2px solid #e5dcc9',
              boxShadow: '0 4px 20px rgba(30,58,95,0.15)',
            }}
          />
        )}
        <h1 style={{ fontSize: '38px', color: '#1a2942', marginBottom: '8px', fontWeight: 800 }}>
          {country.name_ar}
        </h1>
        <p style={{ color: '#7a6f5f', fontSize: '17px' }}>
          {country.name_en}
        </p>
        {country.currency_code && (
          <p style={{ color: '#7a6f5f', fontSize: '14px', marginTop: '8px' }}>
            العملة: {country.currency_code}
          </p>
        )}
      </section>

      {/* Cities */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#1a2942', marginBottom: '24px' }}>
          🏙️ مدن {country.name_ar}
          <span style={{ color: '#7a6f5f', fontSize: '16px', marginRight: '12px', fontWeight: 400 }}>
            ({cities.length})
          </span>
        </h2>

        {cities.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5dcc9',
          }}>
            <p style={{ color: '#7a6f5f' }}>لا توجد مدن متاحة حاليًا</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {cities.map((city) => (
              <a
                key={city.id}
                href={`/cities/${city.slug || city.id}`}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e5dcc9',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {city.cover_image_url ? (
                  <img
                    src={city.cover_image_url}
                    alt={city.name_ar}
                    style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    height: '170px',
                    background: 'linear-gradient(135deg, #1e3a5f, #2d5080)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '50px',
                  }}>🏙️</div>
                )}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: '#1a2942', marginBottom: '4px' }}>
                    {city.name_ar}
                  </div>
                  <div style={{ color: '#7a6f5f', fontSize: '13px' }}>
                    {city.name_en}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
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
