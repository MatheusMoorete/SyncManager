-- Add points column to clients table
alter table public.clients
add column points integer default 0;

-- Create points history table
create table public.points_history (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid references auth.users(id) not null,
    client_id uuid references public.clients(id) not null,
    appointment_id uuid references public.appointments(id),
    points integer not null,
    type varchar(20) not null check (type in ('earned', 'spent', 'expired', 'adjusted')),
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on points_history
alter table public.points_history enable row level security;

-- Create RLS policies for points_history
create policy "Owners can view their points history"
on public.points_history for select
using (auth.uid() = owner_id);

create policy "Owners can insert points history"
on public.points_history for insert
with check (auth.uid() = owner_id);

-- Create index for faster queries
create index points_history_client_id_idx on public.points_history(client_id);
create index points_history_appointment_id_idx on public.points_history(appointment_id); 