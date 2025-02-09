-- Create loyalty_config table
create table public.loyalty_config (
    id bigint primary key default 1,
    owner_id uuid references auth.users(id) not null,
    enabled boolean default false,
    points_per_currency numeric(10,2) default 1.0,
    minimum_for_points numeric(10,2) default 0.0,
    service_rules jsonb default '[]'::jsonb,
    levels jsonb default '[]'::jsonb,
    createdAt timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint single_config_per_owner unique (owner_id),
    constraint check_id check (id = 1)
);

-- Create RLS policies
alter table public.loyalty_config enable row level security;

create policy "Owners can view their loyalty config"
on public.loyalty_config for select
using (auth.uid() = owner_id);

create policy "Owners can update their loyalty config"
on public.loyalty_config for update
using (auth.uid() = owner_id);

create policy "Owners can insert their loyalty config"
on public.loyalty_config for insert
with check (auth.uid() = owner_id);

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create trigger for updated_at
create trigger set_updated_at
    before update on public.loyalty_config
    for each row
    execute function public.handle_updated_at(); 