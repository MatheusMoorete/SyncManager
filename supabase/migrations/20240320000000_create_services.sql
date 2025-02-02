create table "public"."services" (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  name text not null,
  description text,
  price text not null default '0',
  duration text not null default '60',
  category text not null,
  is_active boolean not null default true,
  points_earned text not null default '0',
  constraint services_pkey primary key (id)
);

alter table "public"."services" enable row level security;

create policy "Enable read access for all users" on "public"."services"
  for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users" on "public"."services"
  for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users" on "public"."services"
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Enable delete access for authenticated users" on "public"."services"
  for delete
  to authenticated
  using (true);

create function "public"."handle_updated_at"()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger "services_handle_updated_at"
  before update on "public"."services"
  for each row
  execute procedure "public"."handle_updated_at"(); 