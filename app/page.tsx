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
};

type Country = {
  id: string;
  iso2: string;
  name_ar: string;
  name_en: string;
  flag_url: string | null;
};

type City = {
  id: string;
  name_ar: string;
  name_en: string;
  cover_image_url: string | null;
  is_featured: boolean;
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user.email) {
          setUserEmail(sessionData.session.user.email);
        }

        const [cats, cos, cts] = await Promise.all([
          supabase
            .from('categories')
            .select('id, code, name_ar, name_en, icon')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(18),
          supabase
            .from('countries')
            .select('id, iso2, name_ar, name_en, flag_url')
            .eq('is_active', true)
            .order('name_ar', { ascending: true })
            .limit(12),
          supabase
            .from('cities')
            .select('id, name_ar, name_en, cover_image_url, is_featured')
            .eq('is_featured', true)
            .eq('is_active', true)
            .limit(6),
        ]);

        if (cats.error) throw cats.error;
        if (cos.error) throw cos.error;
        if (cts.error) throw cts.error;

        setCategories((cats.data as Category[]) ?? []);
        setCountries((cos.data as Country[]) ?? []);
        setCities((cts.data as City[]) ?? []);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <strong style={{ color: '#1e3a5f', fontSize: '20px' }}>عابر</strong>
          <span style={{ fontSize: '18px' }}>🌍</span>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {userEmail ? (
            <a href="/profile" style={{
              padding: '8px 16px',
              background: '#1e3a5f',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
            }}>حسابي</a>
          ) : (
            <>
              <a href="/login" style={{ color: '#1e3a5f', fontWeight: 600, fontSize: '14px' }}>دخول</a>
              <a href="/signup" style={{
                padding: '8px 14px',
                background: '#1e3a5f',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
              }}>حساب جديد</a>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '50px 20px 70px',
        background: 'linear-gradient(135deg, #f5efe6 0%, #e5dcc9 100%)',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>🌍</div>
        <h1 style={{
          fontSize: '40px',
          marginBottom: '12px',
          lineHeight: '1.2',
          color: '#1a2942',
          fontWeight: 800,
        }}>
          العالم أقرب مما <span style={{ color: '#1e3a5f' }}>تتخيل</span>
        </h1>
        <p style={{ color: '#7a6f5f', fontSize: '17px', marginBottom: '32px' }}>
          اكتشف أجمل الوجهات، احجز بسهولة، وعش تجارب لا تُنسى
        </p>
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 4px 20px rgba(30, 58, 95, 0.1)',
          display: 'flex',
          gap: '8px',
        }}>
          <input
            type="text"
            placeholder="🔍 ابحث عن وجهة، فندق، مطعم..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontFamily: 'inherit',
              background: 'transparent',
              color: '#1a2942',
            }}
          />
          <button
            style={{
              padding: '12px 24px',
              background: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ابحث
          </button>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#7a6f5f' }}>جاري تحميل البيانات...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            color: '#7f1d1d',
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a2942' }}>
                  📋 تصفح حسب الفئة
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '12px',
                }}>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        padding: '20px 12px',
                        background: 'white',
                        borderRadius: '14px',
                        border: '1px solid #e5dcc9',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                        {getCategoryEmoji(cat.code)}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a2942' }}>
                        {cat.name_ar}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Countries */}
            {countries.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a2942' }}>
                  🌍 استكشف الدول
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '12px',
                }}>
                  {countries.map((country) => (
                    <div
                      key={country.id}
                      style={{
                        padding: '16px 12px',
                        background: 'white',
                        borderRadius: '14px',
                        border: '1px solid #e5dcc9',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {country.flag_url && (
                        <img
                          src={country.flag_url}
                          alt={country.name_ar}
                          style={{
                            width: '48px',
                            height: '32px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: '1px solid #e5dcc9',
                          }}
                        />
                      )}
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a2942' }}>
                        {country.name_ar}
                      </div>
                      <div style={{ color: '#7a6f5f', fontSize: '12px' }}>
                        {country.iso2}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cities */}
            {cities.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a2942' }}>
                  🏙️ مدن مميزة
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '16px',
                }}>
                  {cities.map((city) => (
                    <div
                      key={city.id}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid #e5dcc9',
                        cursor: 'pointer',
                      }}
                    >
                      {city.cover_image_url ? (
                        <img
                          src={city.cover_image_url}
                          alt={city.name_ar}
                          style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          height: '140px',
                          background: 'linear-gradient(135deg, #1e3a5f, #2d5080)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '40px',
                        }}>🏙️</div>
                      )}
                      <div style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px', color: '#1a2942' }}>
                          {city.name_ar}
                        </div>
                        <div style={{ color: '#7a6f5f', fontSize: '13px' }}>
                          {city.name_en}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Stats */}
            <section style={{ marginBottom: '48px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
              }}>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e5dcc9',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a5f' }}>
                    {countries.length}
                  </div>
                  <div style={{ color: '#7a6f5f', fontSize: '14px' }}>دولة</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e5dcc9',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a5f' }}>
                    {cities.length}+
                  </div>
                  <div style={{ color: '#7a6f5f', fontSize: '14px' }}>مدينة</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e5dcc9',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a5f' }}>
                    {categories.length}
                  </div>
                  <div style={{ color: '#7a6f5f', fontSize: '14px' }}>فئة</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e5dcc9',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#c9a961' }}>
                    ✓
                  </div>
                  <div style={{ color: '#7a6f5f', fontSize: '14px' }}>متصل</div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

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
        <p style={{ opacity: 0.8, fontSize: '14px' }}>
          العالم أقرب مما تتخيل
        </p>
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
