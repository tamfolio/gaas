-- Push subscriptions: one row per browser/device per user
create table push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),
  unique (profile_id, endpoint)
);

alter table push_subscriptions enable row level security;

-- Users can only manage their own subscriptions
create policy "Users can manage own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
