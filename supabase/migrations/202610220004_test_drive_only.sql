-- Preserve historical selections before removing registrations or updating seed grades.
alter table public.test_drive_requests add column selected_vehicle_snapshot jsonb;
update public.test_drive_requests r set selected_vehicle_snapshot=to_jsonb(v)
from public.dealer_vehicles v where r.vehicle_id=v.id;
comment on column public.test_drive_requests.selected_vehicle_snapshot is '登録削除・シード更新前の選択車両。履歴保存用、anonからは読み書き不可';
alter table public.test_drive_requests drop constraint request_vehicle_matches;
alter table public.test_drive_requests add constraint request_vehicle_matches
 foreign key(vehicle_id,dealer_id,model_code) references public.dealer_vehicles(id,dealer_id,model_code)
 on delete set null (vehicle_id);
drop policy requests_insert on public.test_drive_requests;
delete from public.dealer_vehicles where kind='display';
alter table public.dealer_vehicles drop column kind;
create policy requests_insert on public.test_drive_requests for insert to anon with check (
 status='requested' and preferred_1>now() and preferred_2>now() and vehicle_id is not null and
 exists(select 1 from public.dealer_vehicles v where v.id=vehicle_id
 and v.dealer_id=test_drive_requests.dealer_id and v.model_code=test_drive_requests.model_code)
);
comment on table public.dealer_vehicles is '店舗に登録された試乗車（グレード・色）まで。空き枠・仮押さえではない';
