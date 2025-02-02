-- Schema SQL para Supabase (arquivo schema.supabase.sql)

-- Tabela principal de clientes
create table clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null, -- Dono do estúdio
  full_name text not null,
  phone varchar(20) unique not null,
  email text,
  birth_date date,
  avatar_url text, -- URL da foto no Supabase Storage
  preferences jsonb not null default '{
    "preferred_services": [],
    "avoided_times": [],
    "sensitivity_level": 1
  }',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

-- Tabela de serviços oferecidos
create table services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name varchar(50) not null,
  description text,
  base_price numeric(10,2) not null,
  duration interval not null default '30 minutes',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tabela de agendamentos
create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  service_id uuid references services(id) not null,
  scheduled_time timestamptz not null,
  actual_duration interval,
  final_price numeric(10,2) not null,
  discount numeric(3,2) default 0, -- 0-1 representando %
  status varchar(20) not null default 'scheduled' check (
    status in ('scheduled', 'completed', 'canceled', 'no_show')
  ),
  notes text,
  created_at timestamptz not null default now()
);

-- Tabela de transações financeiras
create table transactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  type varchar(10) not null check (type in ('income', 'expense')),
  category varchar(50) not null, -- 'service', 'product', 'rent', etc
  amount numeric(10,2) not null,
  payment_method varchar(20) check (
    payment_method in ('cash', 'credit_card', 'debit_card', 'pix')
  ),
  receipt_url text, -- Comprovante no Storage
  transaction_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- Tabela de programa de fidelidade
create table loyalty_points (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  points_earned integer not null,
  points_redeemed integer not null default 0,
  expiration_date timestamptz,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Tabela de despesas recorrentes
create table expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name varchar(100) not null,
  category varchar(50) not null,
  amount numeric(10,2) not null,
  frequency varchar(20) check (
    frequency in ('daily', 'weekly', 'monthly', 'yearly', 'once')
  ),
  next_payment_date timestamptz,
  created_at timestamptz not null default now()
);

-- Tabela de perfis de usuário
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Índices para otimização
create index idx_clients_owner on clients(owner_id);
create index idx_appointments_client on appointments(client_id);
create index idx_transactions_date on transactions(transaction_date);
create index idx_loyalty_client on loyalty_points(client_id);

-- RLS Policies
alter table clients enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table transactions enable row level security;
alter table loyalty_points enable row level security;
alter table expenses enable row level security;
alter table profiles enable row level security;

-- Policies para clients
create policy "Clientes privados" on clients
for all using (auth.uid() = owner_id);

-- Policies para appointments
create policy "Agendamentos do estúdio" on appointments
for all using (
  exists (
    select 1 from clients
    where clients.id = appointments.client_id
    and clients.owner_id = auth.uid()
  )
);

-- Policies para transactions
create policy "Transações privadas" on transactions
for all using (
  auth.uid() = (select owner_id from clients where id = transactions.client_id)
);

-- Policies para loyalty_points
create policy "Pontos do cliente" on loyalty_points
for all using (
  auth.uid() = (select owner_id from clients where id = loyalty_points.client_id)
);

-- Policies para perfis
create policy "Perfis públicos para usuários autenticados" on profiles
  for select using (auth.role() = 'authenticated');

create policy "Usuários podem editar próprios perfis" on profiles
  for update using (auth.uid() = id);

-- Função para cálculo automático de pontos
create or replace function update_loyalty_points()
returns trigger as $$
begin
  if new.type = 'income' then
    insert into loyalty_points (client_id, points_earned)
    values (
      new.client_id,
      (new.amount * 0.1) -- 1 ponto a cada R$10
    )
    on conflict (client_id) do update
    set
      points_earned = loyalty_points.points_earned + excluded.points_earned,
      last_activity = now();
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger para transações
create trigger trigger_update_points
after insert on transactions
for each row execute function update_loyalty_points();

-- Função para criar perfil automaticamente
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil quando um novo usuário for criado
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Função para limpar clientes deletados após 24h
create or replace function cleanup_deleted_clients()
returns void as $$
begin
  delete from clients
  where deleted_at is not null
  and deleted_at < now() - interval '24 hours';
end;
$$ language plpgsql;

-- Agendar limpeza diária (precisa ser configurado no cron do servidor)
-- select cron.schedule('0 0 * * *', 'select cleanup_deleted_clients();'); 