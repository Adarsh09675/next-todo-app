-- 1. Create a table for public profiles
create table public.users (
  id uuid not null references auth.users on delete cascade,
  email text,
  name text,
  role text default 'user',
  is_blocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);
-- 2. Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- 3. Create policies
-- Allow users to read their own profile
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- 4. Create a function to handle new user signups
-- This function grabs the 'name' and 'role' from the signup metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger the function every time a user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Create a table for tasks
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  is_completed boolean default false,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable RLS for tasks
alter table public.tasks enable row level security;

-- 8. Policies for tasks
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can create own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- 9. Admin policies (Admins can view all tasks, etc. - Optional, but good for admin panel)
-- Note: You might need a function or claim to check for admin role inside the policy safely, 
-- or just use the service role key in your admin API routes which bypasses RLS.
