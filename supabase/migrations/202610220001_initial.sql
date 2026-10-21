create table public.models (code text primary key, name text not null, category text not null, tagline text not null);
create table public.prefectures (code text primary key, name text not null);
create table public.dealers (id text primary key, code text unique not null, prefecture_code text not null references public.prefectures(code), name text not null, address text not null, postal_code text not null, lat double precision not null, lng double precision not null, phone text not null, business_hours text not null);
create table public.dealer_test_cars (dealer_id text references public.dealers(id), model_code text references public.models(code), primary key(dealer_id,model_code));
create table public.test_drive_requests (
 id uuid primary key default gen_random_uuid(),
 receipt_number text unique not null default ('LM-' || upper(replace(gen_random_uuid()::text,'-',''))),
 model_code text not null references public.models(code), dealer_id text not null references public.dealers(id),
 name text not null check(length(name) between 1 and 100), kana text not null check(length(kana) between 1 and 100),
 email text not null check(length(email) between 3 and 254), phone text not null check(length(phone) between 10 and 20),
 preferred_1 timestamptz not null, preferred_2 timestamptz not null, notes text not null default '' check(length(notes)<=2000),
 status text not null default 'requested' check(status='requested'), created_at timestamptz not null default now(),
 check(preferred_1<>preferred_2)
);
comment on column public.test_drive_requests.preferred_1 is '第1希望。日時確定・枠確保ではありません';
comment on column public.test_drive_requests.preferred_2 is '第2希望。日時確定・枠確保ではありません';
alter table public.models enable row level security;
alter table public.prefectures enable row level security;
alter table public.dealers enable row level security;
alter table public.dealer_test_cars enable row level security;
alter table public.test_drive_requests enable row level security;
revoke all on public.models,public.prefectures,public.dealers,public.dealer_test_cars,public.test_drive_requests from anon,authenticated;
grant select on public.models,public.prefectures,public.dealers,public.dealer_test_cars to anon;
grant insert (receipt_number,model_code,dealer_id,name,kana,email,phone,preferred_1,preferred_2,notes) on public.test_drive_requests to anon;
create policy models_read on public.models for select to anon using(true);
create policy prefectures_read on public.prefectures for select to anon using(true);
create policy dealers_read on public.dealers for select to anon using(true);
create policy test_cars_read on public.dealer_test_cars for select to anon using(true);
create policy requests_insert on public.test_drive_requests for insert to anon with check(status='requested' and preferred_1>now() and preferred_2>now());
create index dealers_prefecture_idx on public.dealers(prefecture_code);
