-- RPC para listar todos os jurados cadastrados pelo administrador
-- Usa SECURITY DEFINER para contornar RLS de user_roles de forma segura
create or replace function public.rpc_list_jurados()
returns table (
  username text,
  full_name text,
  created_at timestamptz,
  seat_code text,
  seat_label text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.username, p.full_name, p.created_at, p.seat_code, p.seat_label
  from public.profiles p
  where exists (
    select 1 from public.user_roles ur
    where ur.user_id = p.id
      and ur.role = 'jurado'
  )
  order by p.created_at desc;
$$;

grant execute on function public.rpc_list_jurados() to anon;
grant execute on function public.rpc_list_jurados() to authenticated;