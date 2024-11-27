-- Create task lists (columns in Trello)
create type task_list_type as enum ('todo', 'in_progress', 'review', 'done', 'backlog');

create table task_lists (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  type task_list_type not null default 'todo',
  position integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status as enum ('todo', 'in_progress', 'review', 'done');

create table tasks (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references task_lists(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  priority task_priority default 'medium',
  status task_status default 'todo',
  position integer not null default 0,
  due_date timestamp with time zone,
  created_by uuid references profiles(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table (for both tasks and task lists)
create table comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table task_lists enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;

-- Policies for task lists
create policy "Task lists are viewable by project members" on task_lists
  for select using (
    exists (
      select 1 from project_members
      where project_members.project_id = task_lists.project_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Task lists are insertable by project members" on task_lists
  for insert with check (
    exists (
      select 1 from project_members
      where project_members.project_id = task_lists.project_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Task lists are updatable by project members" on task_lists
  for update using (
    exists (
      select 1 from project_members
      where project_members.project_id = task_lists.project_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Task lists are deletable by project members" on task_lists
  for delete using (
    exists (
      select 1 from project_members
      where project_members.project_id = task_lists.project_id
      and project_members.profile_id = auth.uid()
    )
  );

-- Policies for tasks
create policy "Tasks are viewable by project members" on tasks
  for select using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Tasks are insertable by project members" on tasks
  for insert with check (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Tasks are updatable by project members" on tasks
  for update using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Tasks are deletable by project members" on tasks
  for delete using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.profile_id = auth.uid()
    )
  );

-- Policies for comments
create policy "Comments are viewable by project members" on comments
  for select using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = comments.task_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Comments are insertable by project members" on comments
  for insert with check (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = comments.task_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Comments are updatable by owner" on comments
  for update using (
    auth.uid() = created_by
  );

create policy "Comments are deletable by owner" on comments
  for delete using (
    auth.uid() = created_by
  );

-- Create indexes for better performance
create index task_lists_project_id_idx on task_lists(project_id);
create index tasks_project_id_idx on tasks(project_id);
create index tasks_list_id_idx on tasks(list_id);
create index comments_task_id_idx on comments(task_id);
create index comments_parent_id_idx on comments(parent_id);

-- Add reactions table
create table comment_reactions (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references comments(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(comment_id, profile_id, emoji)
);

-- Add RLS policies for reactions
alter table comment_reactions enable row level security;

create policy "Comment reactions are viewable by project members" on comment_reactions
  for select using (
    exists (
      select 1 from comments
      join tasks on tasks.id = comments.task_id
      join project_members on project_members.project_id = tasks.project_id
      where comments.id = comment_reactions.comment_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Comment reactions are insertable by project members" on comment_reactions
  for insert with check (
    exists (
      select 1 from comments
      join tasks on tasks.id = comments.task_id
      join project_members on project_members.project_id = tasks.project_id
      where comments.id = comment_reactions.comment_id
      and project_members.profile_id = auth.uid()
    )
  );

create policy "Comment reactions are deletable by owner" on comment_reactions
  for delete using (
    auth.uid() = profile_id
  );

-- Create index for better performance
create index comment_reactions_comment_id_idx on comment_reactions(comment_id); 