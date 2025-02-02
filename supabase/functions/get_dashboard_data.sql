create or replace function get_dashboard_data(time_range text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  start_date timestamp;
  result json;
begin
  -- Define o período baseado no parâmetro
  start_date := case time_range
    when '7d' then now() - interval '7 days'
    when '30d' then now() - interval '30 days'
    when '90d' then now() - interval '90 days'
    else now() - interval '30 days'
  end;

  -- Construir o JSON com todos os dados necessários
  with revenue_data as (
    select
      sum(amount) as total_revenue,
      count(distinct client_id) as total_clients,
      sum(case when type = 'income' then amount else -amount end) as total_profit
    from transactions
    where transaction_date >= start_date
      and exists (
        select 1 from clients
        where clients.id = transactions.client_id
        and clients.owner_id = auth.uid()
      )
  ),
  appointments_data as (
    select
      count(*) as total_appointments,
      count(case when status = 'completed' then 1 end) as completed_appointments
    from appointments
    where scheduled_time >= start_date
      and exists (
        select 1 from clients
        where clients.id = appointments.client_id
        and clients.owner_id = auth.uid()
      )
  ),
  loyalty_data as (
    select
      sum(points_earned - points_redeemed) as total_points
    from loyalty_points
    where last_activity >= start_date
      and exists (
        select 1 from clients
        where clients.id = loyalty_points.client_id
        and clients.owner_id = auth.uid()
      )
  ),
  revenue_trend as (
    select
      date_trunc('day', transaction_date) as date,
      sum(amount) as revenue
    from transactions
    where transaction_date >= start_date
      and exists (
        select 1 from clients
        where clients.id = transactions.client_id
        and clients.owner_id = auth.uid()
      )
    group by date_trunc('day', transaction_date)
    order by date
  ),
  services_data as (
    select
      s.name,
      count(*) as total,
      sum(a.final_price) as revenue
    from appointments a
    join services s on s.id = a.service_id
    where a.scheduled_time >= start_date
      and exists (
        select 1 from clients
        where clients.id = a.client_id
        and clients.owner_id = auth.uid()
      )
    group by s.name
    order by count(*) desc
    limit 5
  ),
  recent_activities as (
    select
      a.id,
      c.full_name as client_name,
      s.name as service_name,
      a.scheduled_time,
      a.status,
      a.final_price
    from appointments a
    join clients c on c.id = a.client_id
    join services s on s.id = a.service_id
    where exists (
      select 1 from clients
      where clients.id = a.client_id
      and clients.owner_id = auth.uid()
    )
    order by a.scheduled_time desc
    limit 5
  )
  select json_build_object(
    'kpis', json_build_object(
      'revenue', json_build_object(
        'title', 'Receita Total',
        'value', coalesce((select total_revenue from revenue_data), 0),
        'trend', 0, -- TODO: Calcular tendência
        'icon', 'dollar',
        'formatter', 'currency'
      ),
      'clients', json_build_object(
        'title', 'Clientes Ativos',
        'value', coalesce((select total_clients from revenue_data), 0),
        'trend', 0,
        'icon', 'users',
        'formatter', 'number'
      ),
      'profit', json_build_object(
        'title', 'Lucro',
        'value', coalesce((select total_profit from revenue_data), 0),
        'trend', 0,
        'icon', 'trending-up',
        'formatter', 'currency'
      ),
      'appointments', json_build_object(
        'title', 'Agendamentos',
        'value', coalesce((select total_appointments from appointments_data), 0),
        'trend', case
          when (select total_appointments from appointments_data) > 0
          then (select completed_appointments::float / total_appointments * 100 from appointments_data)
          else 0
        end,
        'icon', 'calendar',
        'formatter', 'number'
      ),
      'loyalty_points', json_build_object(
        'title', 'Pontos de Fidelidade',
        'value', coalesce((select total_points from loyalty_data), 0),
        'trend', 0,
        'icon', 'star',
        'formatter', 'number'
      )
    ),
    'revenueChart', (
      select json_agg(
        json_build_object(
          'date', date,
          'revenue', revenue
        )
      )
      from revenue_trend
    ),
    'servicesChart', (
      select json_agg(
        json_build_object(
          'name', name,
          'value', total,
          'percentage', (total::float / (select sum(total) from services_data) * 100)
        )
      )
      from services_data
    ),
    'recentActivities', (
      select json_agg(
        json_build_object(
          'id', id,
          'client_name', client_name,
          'service_name', service_name,
          'scheduled_time', scheduled_time,
          'status', status,
          'final_price', final_price
        )
      )
      from recent_activities
    ),
    'lastUpdate', now()
  ) into result;

  return result;
end;
$$; 