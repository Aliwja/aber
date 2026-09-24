'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Category = {
  id: string;
  code: string;
  name_ar: string;
};

type Country = {
  id: string;
  iso2: string;
  name_ar: string;
  flag_url: string | null;
};

type City = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  cover_image_url: string | null;
};

type Business = {
  id: string;
  display_name_ar: string;
  display_name_en: string | null;
  slug: string;
  description_ar: string | null;
  cover_image_url: string | null;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
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

        const [cats, cos, cts, biz] = await Promise.all([
          supabase
            .from('categories')
            .select('id, code, name_ar')
            .eq('is_active', true)
            .order('sort_order')
            .limit(18),
          supabase
            .from('countries')
            .select('id, iso2, name_ar, flag_url')
            .eq('is_active', true)
            .order('name_ar')
            .limit(12),
          supabase
            .from('cities')
            .select('id, name_ar, name_en, slug, cover_image_url')
            .eq('is_featured', true)
            .eq('is_active', true)
            .limit(6),
          supabase
            .from('businesses')
            .select('id, display_name_ar, display_name_en, slug, description_ar, cover_image_url, is_verified, rating_avg, rating_count')
            .eq('status', 'APPROVED')
            .is('deleted_at', null)
            .order('is_verified', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8),
        ]);

        if (cats.error) throw cats.error;
        if (cos.error) throw cos.error;
        if (cts.error) throw cts.error;
        if (biz.error) throw biz.error;

        setCategories((cats.data as Category[]) ?? []);
        setCountries((cos.data as Country[]) ?? []);
        setCities((cts.data as City[]) ?? []);
        setBusinesses((biz.data as Business[]) ?? []);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <header className="app-header">
        <a href="/" className="brand">
          <span className="brand-logo">✦</span>
          عابر
        </a>
        <div className="header-actions">
          {userEmail ? (
            <a href="/profile" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              حسابي
            </a>
          ) : (
            <>
              <a href="/login" style={{ color: 'var(--navy-500)', fontWeight: 600, fontSize: '14px', padding: '8px' }}>
                دخول
              </a>
              <a href="/signup" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                حساب جديد
              </a>
            </>
          )}
        </div>
      </header>

      {/* Search */}
      <div style={{ padding: '16px 20px 0' }}>
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="ابحث عن دولة، مدينة، فندق..." readOnly />
        </div>
      </div>

      {/* Categories (gradient icons) */}
      {categories.length > 0 && (
        <div className="cat-row">
          {categories.slice(0, 8).map((cat) => (
            <a
              key={cat.id}
              href={`/categories/${cat.code}`}
              className="cat-item"
              style={{ textDecoration: 'none' }}
            >
              <div className={`cat-icon ${getCategoryClass(cat.code)}`}>
                {getCategoryEmoji(cat.code)}
              </div>
              <span className="cat-label">{cat.name_ar}</span>
            </a>
          ))}
        </div>
      )}

      {/* Hero */}
      <div className="hero">
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80"
          alt="Hero"
        />
        <h2>إلى أين تريد أن تذهب؟</h2>
        <p>اكتشف العالم · 197 دولة بضغطة زر</p>
      </div>

      {/* Featured Businesses */}
      {businesses.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h3 className="section-title">🏢 أنشطة معتمدة</h3>
            <a className="section-link" href="/categories/hotels">عرض الكل ←</a>
          </div>
          <div className="grid-2">
            {businesses.slice(0, 4).map((biz) => (
              <a
                key={biz.id}
                href={`/businesses/${biz.slug}`}
                className="card"
                style={{ textDecoration: 'none' }}
              >
                <div className="card-img">
                  {biz.cover_image_url ? (
                    <img src={biz.cover_image_url} alt={biz.display_name_ar} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, var(--navy-500), var(--navy-700))',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '48px',
                    }}>🏢</div>
                  )}
                  {biz.is_verified && (
                    <span className="badge-verified">✓ موثّق</span>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">{biz.display_name_ar}</div>
                  <div className="card-sub">{biz.display_name_en || biz.slug}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured Cities */}
      {cities.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h3 className="section-title">🏙️ مدن مميزة</h3>
            <a className="section-link" href="/countries">عرض الكل ←</a>
          </div>
          <div className="h-scroll">
            {cities.map((city) => (
              <a
                key={city.id}
                href={`/cities/${city.slug || city.id}`}
                className="card"
                style={{ textDecoration: 'none' }}
              >
                <div className="card-img">
                  {city.cover_image_url ? (
                    <img src={city.cover_image_url} alt={city.name_ar} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, var(--navy-500), var(--navy-700))',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '42px',
                    }}>🏙️</div>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">{city.name_ar}</div>
                  <div className="card-sub">{city.name_en}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Countries */}
      {countries.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h3 className="section-title">🌍 استكشف الدول</h3>
            <a className="section-link" href="/countries">عرض الكل ←</a>
          </div>
          <div className="grid-2">
            {countries.slice(0, 4).map((country) => (
              <a
                key={country.id}
                href={`/countries/${country.iso2}`}
                className="card"
                style={{ textDecoration: 'none' }}
              >
                <div className="card-img" style={{ aspectRatio: '16/9' }}>
                  {country.flag_url ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'var(--navy-50)',
                      display: 'grid',
                      placeItems: 'center',
                    }}>
                      <img
                        src={country.flag_url}
                        alt={country.name_ar}
                        style={{
                          width: '80px',
                          height: '54px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid var(--border)',
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: '40px' }}>
                      🌍
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">{country.name_ar}</div>
                  <div className="card-sub">{country.iso2}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Loading/Error */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="muted">جاري التحميل...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '0 20px' }}>
          <div className="form-error">⚠️ {error}</div>
        </div>
      )}

      {/* AI CTA */}
      <a href="/ai" className="ai-cta" style={{ textDecoration: 'none' }}>
        <div style={{ fontSize: '32px' }}>✨</div>
        <div>
          <h3>خطط رحلتك بالذكاء الاصطناعي</h3>
          <p>دع الذكاء يصمم جدولك السياحي وميزانيتك بدقة</p>
        </div>
      </a>

      {/* Stats */}
      <section className="section">
        <div className="grid-2" style={{ gap: '12px' }}>
          <div style={{
            background: 'var(--surface)',
            padding: '20px',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy-500)' }}>
              {businesses.length}
            </div>
            <div className="muted" style={{ fontSize: '13px' }}>نشاط</div>
          </div>
          <div style={{
            background: 'var(--surface)',
            padding: '20px',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy-500)' }}>
              {countries.length}
            </div>
            <div className="muted" style={{ fontSize: '13px' }}>دولة</div>
          </div>
          <div style={{
            background: 'var(--surface)',
            padding: '20px',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--navy-500)' }}>
              {cities.length}+
            </div>
            <div className="muted" style={{ fontSize: '13px' }}>مدينة</div>
          </div>
          <div style={{
            background: 'var(--surface)',
            padding: '20px',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold-500)' }}>
              18
            </div>
            <div className="muted" style={{ fontSize: '13px' }}>فئة</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="brand-lg">عابر ✦ ABER</div>
        <p>العالم أقرب مما تتخيل</p>
        <p className="copyright">© 2026 ABER — جميع الحقوق محفوظة</p>
      </footer>
    </main>
  );
}

function getCategoryEmoji(code: string): string {
  const map: Record<string, string> = {
    hotels: '🏨', resorts: '🌴', apartments: '🏢',
    restaurants: '🍽️', cafes: '☕', activities: '🎯',
    experiences: '✨', tours: '🗺️', guides: '👤',
    transportation: '🚗', car_rental: '🔑', events: '🎪',
    shopping: '🛍️', beaches: '🏖️', nature: '🌲',
    history: '🏛️', family: '👨‍👩‍👧', adventure: '⛰️',
  };
  return map[code] || '📍';
}

function getCategoryClass(code: string): string {
  const map: Record<string, string> = {
    hotels: 'hotel',
    resorts: 'hotel',
    apartments: 'hotel',
    restaurants: 'rest',
    cafes: 'rest',
    activities: 'act',
    experiences: 'exp',
    tours: 'dest',
    guides: 'exp',
    transportation: 'dest',
    car_rental: 'dest',
    events: 'event',
    shopping: 'event',
    beaches: 'hosp',
    nature: 'hosp',
    history: 'dest',
    family: 'exp',
    adventure: 'act',
  };
  return map[code] || 'dest';
}
