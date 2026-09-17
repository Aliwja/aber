'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type City = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  country_id: string;
};

type Country = {
  iso2: string;
  name_ar: string;
  flag_url: string | null;
};

export default function CityPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [city, setCity] = useState<City | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        // Try slug first, then id
        let cityQuery = supabase.from('cities').select('*');
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        if (isUuid) {
          cityQuery = cityQuery.eq('id', slug);
        } else {
          cityQuery = cityQuery.eq('slug', slug);
        }

        const { data: cityData, error: cityErr } = await cityQuery.maybeSingle();

        if (cityErr) throw cityErr;
        if (!cityData) {
          setError('المدينة غير موجودة');
          setLoading(false);
          return;
        }

        setCity(cityData as City);

        const { data: countryData, error: countryErr } = await supabase
          .from('countries')
          .select('iso2, name_ar, flag_url')
          .eq('id', cityData.country_id)
          .maybeSingle();

        if (countryErr) throw countryErr;
        setCountry(countryData as Country);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <main style={{ background: '#f5efe6', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#7a6f5f' }}>جاري التحميل...</p>
      </main>
    );
  }

  if (error || !city) {
    return (
      <main style={{ background: '#f5efe6', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ color: '#1a2942', marginBottom: '16px' }}>
            {error || 'المدينة غير موجودة'}
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

      {/* Cover */}
      {city.cover_image_url ? (
        <img
          src={city.cover_image_url}
          alt={city.name_ar}
          style={{ width: '100%', height: '300px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          height: '300px',
          background: 'linear-gradient(135deg, #1e3a5f, #2d5080)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
        }}>🏙️</div>
      )}

      {/* Info */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '38px', color: '#1a2942', marginBottom: '8px', fontWeight: 800 }}>
          {city.name_ar}
        </h1>
        <p style={{ color: '#7a6f5f', fontSize: '17px', marginBottom: '24px' }}>
          {city.name_en}
        </p>

        {country && (
          <a href={`/countries/${country.iso2}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5dcc9',
            textDecoration: 'none',
          }}>
            {country.flag_url && (
              <img
                src={country.flag_url}
                alt={country.name_ar}
                style={{ width: '28px', height: '20px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <span style={{ color: '#1a2942', fontWeight: 600, fontSize: '14px' }}>
              {country.name_ar}
            </span>
          </a>
        )}

        {city.latitude && city.longitude && (
          <p style={{ color: '#7a6f5f', fontSize: '13px', marginTop: '16px' }}>
            📍 {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
          </p>
        )}

        {/* Placeholder for future content */}
        <div style={{
          marginTop: '40px',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5dcc9',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🏨</div>
          <h2 style={{ color: '#1a2942', marginBottom: '8px' }}>
            قريبًا
          </h2>
          <p style={{ color: '#7a6f5f', fontSize: '15px' }}>
            ستُعرض هنا الفنادق والمطاعم والأنشطة في {city.name_ar}
          </p>
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
