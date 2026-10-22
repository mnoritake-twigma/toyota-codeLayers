-- Model-level reference images for the fictional demo.
alter table public.models add column photo_url text;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('model-photos', 'model-photos', true, 200000, array['image/jpeg'])
on conflict (id) do nothing;
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m01.jpg' where code='M01';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m02.jpg' where code='M02';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m03.jpg' where code='M03';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m04.jpg' where code='M04';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m05.jpg' where code='M05';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m06.jpg' where code='M06';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m07.jpg' where code='M07';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m08.jpg' where code='M08';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m09.jpg' where code='M09';
update public.models set photo_url='https://gvjkkwpirslrinkbtoms.supabase.co/storage/v1/object/public/model-photos/m10.jpg' where code='M10';
