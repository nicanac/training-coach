
-- Create activities table
create table if not exists activities (
  activity_id bigint primary key,
  name text,
  type text,
  start_time timestamp,
  distance float,
  duration float,
  avg_hr int,
  max_hr int,
  calories int,
  raw_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table activities enable row level security;

-- Allow read access to everyone (for now, for simplicity in dev)
create policy "Public Access" on activities for select using (true);
