-- Add individual vehicle registrations without changing historical requests.
alter table public.dealers add column closed_days text not null default '火曜日・年末年始';
create table public.dealer_vehicles (
 id text primary key,
 dealer_id text not null references public.dealers(id),
 model_code text not null references public.models(code),
 kind text not null check(kind in ('test_drive','display')),
 grade text not null, body_color text not null, interior_color text not null,
 unique(id,dealer_id,model_code)
);
alter table public.dealer_vehicles enable row level security;
revoke all on public.dealer_vehicles from anon,authenticated;
grant select on public.dealer_vehicles to anon;
create policy vehicles_read on public.dealer_vehicles for select to anon using(true);
create index vehicles_dealer_model_idx on public.dealer_vehicles(dealer_id,model_code);
alter table public.test_drive_requests add column vehicle_id text;
alter table public.test_drive_requests add constraint request_vehicle_matches foreign key(vehicle_id,dealer_id,model_code) references public.dealer_vehicles(id,dealer_id,model_code);
grant insert(vehicle_id) on public.test_drive_requests to anon;
drop policy requests_insert on public.test_drive_requests;
create policy requests_insert on public.test_drive_requests for insert to anon with check (
 status='requested' and preferred_1>now() and preferred_2>now() and vehicle_id is not null and
 exists(select 1 from public.dealer_vehicles v where v.id=vehicle_id and v.dealer_id=test_drive_requests.dealer_id and v.model_code=test_drive_requests.model_code and v.kind='test_drive')
);
-- Legacy requests retain their old selection; new requests must include a vehicle through RLS.
comment on column public.test_drive_requests.vehicle_id is '選択した試乗車。過去の申し込みはNULLを保持';
drop table public.dealer_test_cars;
