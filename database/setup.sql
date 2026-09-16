-- ============================================================
-- ABER | عابر — إعداد قاعدة البيانات الكامل
-- ============================================================

-- الجزء 1: جدول profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  locale text default 'ar',
  bio text,
  is_active boolean not null default true,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);

-- الجزء 2: تفعيل RLS على profiles
alter table public.profiles enable row level security;

drop policy if exists users_can_view_own_profile on public.profiles;
create policy users_can_view_own_profile
on public.profiles for select
using (auth.uid() = id);

drop policy if exists users_can_update_own_profile on public.profiles;
create policy users_can_update_own_profile
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists users_can_insert_own_profile on public.profiles;
create policy users_can_insert_own_profile
on public.profiles for insert
with check (auth.uid() = id);

-- الجزء 3: جدول roles
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_ar text not null,
  name_en text not null,
  description text,
  created_at timestamptz not null default now()
);

-- الجزء 4: جدول user_roles
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- الجزء 5: الأدوار الأساسية
insert into public.roles (code, name_ar, name_en, description) values
  ('TOURIST','مسافر','Tourist','المستخدم الافتراضي'),
  ('BUSINESS_OWNER','صاحب نشاط','Business Owner','يملك نشاطًا'),
  ('BUSINESS_STAFF','موظف نشاط','Business Staff','موظف في نشاط'),
  ('MODERATOR','مشرف','Moderator','يراجع المحتوى'),
  ('VERIFICATION_MANAGER','مدير التوثيق','Verification Manager','يوافق على الأنشطة'),
  ('FINANCE','المالية','Finance','يدير العمولات'),
  ('SUPPORT','الدعم','Support','يتعامل مع التذاكر'),
  ('CONTENT_MANAGER','مدير المحتوى','Content Manager','يدير الأماكن'),
  ('ADMIN','مدير','Admin','مدير المنصة'),
  ('SUPER_ADMIN','مدير عام','Super Admin','كامل الصلاحيات')
on conflict (code) do nothing;

-- الجزء 6: تفعيل RLS على roles و user_roles
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists roles_public_read on public.roles;
create policy roles_public_read on public.roles
  for select using (true);

drop policy if exists user_roles_self_read on public.user_roles;
create policy user_roles_self_read on public.user_roles
  for select using (user_id = auth.uid());

-- الجزء 7: دالة إنشاء profile تلقائيًا
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'locale', 'ar')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role_id)
  select new.id, r.id from public.roles r where r.code = 'TOURIST'
  on conflict do nothing;

  return new;
end;
$$;

-- الجزء 8: الزناد التلقائي
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ✅ انتهى الإعداد
select 'تم إعداد قاعدة بيانات ABER بنجاح ✅' as النتيجة;
