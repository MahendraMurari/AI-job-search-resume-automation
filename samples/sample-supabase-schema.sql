create table if not exists jobs (
  job_url text primary key,
  job_title text,
  company text,
  job_key text,
  processed_at timestamptz default now()
);