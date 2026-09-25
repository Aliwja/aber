'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Country = { id: string; iso2: string; name_ar: string; flag_url: string | null };
type Region = { id: string; name_ar: string };
type City = { id: string; name_ar: string };

export default function CompleteProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    country_id: '',
    governorate: '',
    city_id: '',
    district: '',
    street: '',
    phone: '',
    passport_number: '',
    age: '',
  });

  // ============ LOAD ============
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnon);

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          router.push('/login');
          return;
        }

        const uid = sessionData.session.user.id;
        setUserId(uid);

        // تحقق هل أكمل الملف سابقًا؟
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', uid)
          .maybeSingle();

        if (profile?.profile_completed) {
          router.push('/');
          return;
        }

        // حمّل الدول
        const { data: countriesData } = await supabase
          .from('countries')
          .select('id, iso2, name_ar, flag_url')
          .eq('is_active', true)
          .order('name_ar');

        setCountries((countriesData as Country[]) ?? []);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // ============ LOAD REGIONS/STATES ============
  async function loadRegions(countryId: string) {
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const { data } = await supabase
      .from('regions')
      .select('id, name_ar')
      .eq('country_id', countryId)
      .order('name_ar');
    setRegions((data as Region[]) ?? []);
  }

  async function loadCities(countryId: string, regionId?: string) {
    const supabase = createClient(supabaseUrl, supabaseAnon);
    let query = supabase
      .from('cities')
      .select('id, name_ar')
      .eq('country_id', countryId)
      .eq('is_active', true)
      .order('name_ar');

    if (regionId) query = query.eq('region_id', regionId);

    const { data } = await query;
    setCities((data as City[]) ?? []);
  }

  // ============ AVATAR ============
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 3 ميجابايت');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('الملف يجب أن يكون صورة');
      return;
    }

    setAvatarFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ============ VALIDATION ============
  function validatePhone(phone: string): boolean {
    // يقبل: +9665XXXXXXXX أو +966 5X XXX XXXX
    const cleaned = phone.replace(/\s/g, '');
    return /^\+9665\d{8}$/.test(cleaned);
  }

  function validatePassport(passport: string): boolean {
    return /^[A-Z0-9]{6,12}$/i.test(passport);
  }

  function validateForm(): boolean {
    if (!form.country_id) {
      setError('اختر الدولة');
      return false;
    }
    if (!form.governorate) {
      setError('اختر المحافظة/المنطقة');
      return false;
    }
    if (!form.city_id) {
      setError('اختر المدينة');
      return false;
    }
    if (!form.district.trim()) {
      setError('اكتب الحي');
      return false;
    }
    if (!form.street.trim()) {
      setError('اكتب الشارع');
      return false;
    }
    if (!form.phone || !validatePhone(form.phone)) {
      setError('رقم الجوال غير صحيح (مثال: +966 50 123 4567)');
      return false;
    }
    if (!form.passport_number || !validatePassport(form.passport_number)) {
      setError('رقم الجواز غير صحيح (6-12 حرف/رقم)');
      return false;
    }
    const ageNum = parseInt(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('العمر يجب أن يكون بين 1 و 120');
      return false;
    }
    if (!avatarFile) {
      setError('ارفع صورة شخصية');
      return false;
    }
    return true;
  }

  // ============ SUBMIT ============
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !userId) return;

    setSubmitting(true);

    try {
      const supabase = createClient(supabaseUrl, supabaseAnon);

      // 1) رفع الصورة إلى Storage
      const fileExt = avatarFile!.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile!, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // 2) تحديث جدول profiles
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          country_id: form.country_id,
          governorate: form.governorate,
          city_id: form.city_id,
          district: form.district.trim(),
          street: form.street.trim(),
          phone: form.phone.replace(/\s/g, ''),
          passport_number: form.passport_number.toUpperCase(),
          age: parseInt(form.age),
          avatar_url: avatarUrl,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateErr) throw updateErr;

      // 3) اذهب للرئيسية
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  }

  // ============ LOADING ============
  if (loading) {
    return (
      <main
        style={{
          background: 'var(--bg)',
          minHeight: '100vh',
          paddingTop: '60px',
          textAlign: 'center',
        }}
      >
        <p className="muted">جاري التحميل...</p>
      </main>
    );
  }

  // ============ UI ============
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <header className="app-header">
        <a href="/" className="brand">
          <span className="brand-logo">✦</span>
          عابر
        </a>
        <span className="muted" style={{ fontSize: '12px' }}>
          الخطوة 2 من 2
        </span>
      </header>

      {/* Progress */}
      <div
        style={{
          maxWidth: '620px',
          margin: '20px auto 0',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            height: '6px',
            background: 'var(--border)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, var(--navy-500), var(--gold-500))',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '24px 20px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '6px',
          }}
        >
          أكمل بياناتك الشخصية 👤
        </h1>
        <p className="muted" style={{ marginBottom: '28px', fontSize: '14px' }}>
          نُحتاج هذه البيانات لتأمين رحلاتك وتوثيق هويتك مع شركائنا
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ========== Avatar ========== */}
          <div
            style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-card)',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '16px',
                color: 'var(--text)',
              }}
            >
              📷 الصورة الشخصية <span style={{ color: 'var(--danger)' }}>*</span>
            </label>

            <div
              style={{
                width: '110px',
                height: '110px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: avatarPreview
                  ? 'transparent'
                  : 'linear-gradient(135deg, var(--navy-500), var(--gold-500))',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                border: '3px solid var(--surface)',
                boxShadow: '0 8px 24px rgba(30, 58, 95, 0.2)',
                position: 'relative',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '36px', color: '#fff' }}>👤</span>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(30, 58, 95, 0.85)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '4px',
                  textAlign: 'center',
                }}
              >
                {avatarPreview ? 'تغيير' : 'إضافة'}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />

            <p className="muted" style={{ fontSize: '12px' }}>
              صورة واضحة، بحجم أقل من 3 ميجابايت
            </p>
          </div>

          {/* ========== Location ========== */}
          <div
            style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-card)',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                marginBottom: '16px',
                color: 'var(--navy-500)',
              }}
            >
              📍 الموقع
            </h3>

            {/* Country */}
            <div className="form-group">
              <label className="form-label">
                الدولة <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="input">
                <span>🌍</span>
                <select
                  value={form.country_id}
                  onChange={async (e) => {
                    const cid = e.target.value;
                    setForm({
                      ...form,
                      country_id: cid,
                      governorate: '',
                      city_id: '',
                    });
                    setRegions([]);
                    setCities([]);
                    if (cid) await loadRegions(cid);
                  }}
                  required
                  disabled={submitting}
                >
                  <option value="">اختر الدولة</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Governorate */}
            <div className="form-group">
              <label className="form-label">
                المحافظة / المنطقة <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="input">
                <span>🏛️</span>
                <select
                  value={form.governorate}
                  onChange={async (e) => {
                    const gname = e.target.value;
                    setForm({ ...form, governorate: gname, city_id: '' });
                    setCities([]);
                    if (gname && form.country_id) {
                      const region = regions.find((r) => r.name_ar === gname);
                      await loadCities(form.country_id, region?.id);
                    }
                  }}
                  required
                  disabled={submitting || !form.country_id}
                >
                  <option value="">
                    {form.country_id ? 'اختر المحافظة' : 'اختر الدولة أولًا'}
                  </option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.name_ar}>
                      {r.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label">
                المدينة <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="input">
                <span>🏙️</span>
                <select
                  value={form.city_id}
                  onChange={(e) => setForm({ ...form, city_id: e.target.value })}
                  required
                  disabled={submitting || !form.governorate}
                >
                  <option value="">
                    {form.governorate ? 'اختر المدينة' : 'اختر المحافظة أولًا'}
                  </option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* District + Street */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  الحي <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input">
                  <span>🏘️</span>
                  <input
                    value={form.district}
                    onChange={(e) =>
                      setForm({ ...form, district: e.target.value })
                    }
                    placeholder="مثال: النخيل"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  الشارع <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input">
                  <span>🛣️</span>
                  <input
                    value={form.street}
                    onChange={(e) =>
                      setForm({ ...form, street: e.target.value })
                    }
                    placeholder="مثال: طريق الملك فهد"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========== Identity ========== */}
          <div
            style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-card)',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                marginBottom: '16px',
                color: 'var(--navy-500)',
              }}
            >
              🪪 الهوية والتواصل
            </h3>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                رقم الجوال <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="input">
                <span>📱</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+966 50 123 4567"
                  required
                  disabled={submitting}
                  dir="ltr"
                />
              </div>
              <p
                className="muted"
                style={{ fontSize: '11px', marginTop: '4px' }}
              >
                للسعودية: يبدأ بـ +966 5 متبوعًا بـ 8 أرقام
              </p>
            </div>

            {/* Passport */}
            <div className="form-group">
              <label className="form-label">
                رقم الجواز <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="input">
                <span>🛂</span>
                <input
                  value={form.passport_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      passport_number: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="مثال: A1234567"
                  required
                  maxLength={12}
                  disabled={submitting}
                  dir="ltr"
                />
              </div>
              <p
                className="muted"
                style={{ fontSize: '11px', marginTop: '4px' }}
              >
                من 6 إلى 12 حرفًا أو رقمًا (إنجليزي)
              </p>
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label">
                العمر <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="input">
                <span>🎂</span>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="مثال: 25"
                  required
                  min={1}
                  max={120}
                  disabled={submitting}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Info note */}
          <div
            style={{
              background: 'var(--navy-50)',
              padding: '14px 16px',
              borderRadius: 'var(--r-md)',
              fontSize: '12px',
              color: 'var(--text-2)',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>🔒</span>
            <span>
              بياناتك محمية ولن تُشارك مع أي طرف ثالث. تُستخدم فقط لتوثيق
              هويتك في الحجوزات والفنادق.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="form-btn"
            disabled={submitting}
            style={{
              padding: '16px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {submitting ? 'جاري الحفظ...' : '✓ حفظ ومتابعة'}
          </button>
        </form>
      </div>
    </main>
  );
}
