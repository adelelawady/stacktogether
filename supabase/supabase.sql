-- Supabase Export

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON categories;
DROP POLICY IF EXISTS "Enable write access for admins" ON categories;
DROP POLICY IF EXISTS "Enable admin update all" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all" ON profiles;
DROP POLICY IF EXISTS "Enable self update except role" ON profiles;
DROP POLICY IF EXISTS "Users can update own avatar style" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read for all" ON project_join_requests;
DROP POLICY IF EXISTS "Enable update for admins and owners" ON project_join_requests;
DROP POLICY IF EXISTS "Project members can view requests" ON project_join_requests;
DROP POLICY IF EXISTS "Users can create join requests" ON project_join_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON project_join_requests;
DROP POLICY IF EXISTS "Enable delete for admins and moderators" ON project_members;
DROP POLICY IF EXISTS "Enable insert for owners and admins" ON project_members;
DROP POLICY IF EXISTS "Enable update for admins and moderators" ON project_members;
DROP POLICY IF EXISTS "Load project members for all" ON project_members;
DROP POLICY IF EXISTS "Anyone can view project skills" ON project_skills;
DROP POLICY IF EXISTS "Project members can manage skills" ON project_skills;
DROP POLICY IF EXISTS "Anyone can view public projects" ON projects;
DROP POLICY IF EXISTS "Enable delete for admins" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable read access for all" ON projects;
DROP POLICY IF EXISTS "Enable update for project owners and admins" ON projects;
DROP POLICY IF EXISTS "Members can view their private projects" ON projects;
DROP POLICY IF EXISTS "Enable read access for all" ON settings;
DROP POLICY IF EXISTS "Enable update for admins" ON settings;
DROP POLICY IF EXISTS "Admins can do anything" ON skills;
DROP POLICY IF EXISTS "Anyone can read skills" ON skills;
DROP POLICY IF EXISTS "Enable read access for all" ON skills;
DROP POLICY IF EXISTS "Enable read for all" ON skills;
DROP POLICY IF EXISTS "Enable write for admin users" ON skills;
DROP POLICY IF EXISTS "Enable read access for all" ON user_skills;
DROP POLICY IF EXISTS "Enable read for all" ON user_skills;
DROP POLICY IF EXISTS "Enable write for own skills" ON user_skills;

-- Policies
CREATE POLICY "Enable read access for everyone" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Enable write access for admins" ON categories
  FOR ALL
  USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::user_role))));

CREATE POLICY "Enable admin update all" ON profiles
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Enable insert for users based on id" ON profiles
  FOR INSERT
  USING (null);

CREATE POLICY "Enable read access for all" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Enable self update except role" ON profiles
  FOR UPDATE
  USING ((auth.uid() = id));

CREATE POLICY "Users can update own avatar style" ON profiles
  FOR UPDATE
  USING ((auth.uid() = id));

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read for all" ON project_join_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for admins and owners" ON project_join_requests
  FOR UPDATE
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'moderator'::user_role]))))) OR (EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_join_requests.project_id) AND (projects.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM project_members
  WHERE ((project_members.project_id = project_join_requests.project_id) AND (project_members.profile_id = auth.uid()) AND (project_members.role = ANY (ARRAY['owner'::project_role, 'moderator'::project_role, 'admin'::project_role])) AND (project_members.status = 'approved'::text))))));

CREATE POLICY "Project members can view requests" ON project_join_requests
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM project_members
  WHERE ((project_members.project_id = project_members.project_id) AND (project_members.profile_id = auth.uid()) AND (project_members.status = 'approved'::text)))));

CREATE POLICY "Users can create join requests" ON project_join_requests
  FOR INSERT
  USING (null);

CREATE POLICY "Users can view their own requests" ON project_join_requests
  FOR SELECT
  USING ((auth.uid() = profile_id));

CREATE POLICY "Enable delete for admins and moderators" ON project_members
  FOR DELETE
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'moderator'::user_role]))))) OR (EXISTS ( SELECT 1
   FROM project_members pm
  WHERE ((pm.project_id = project_members.project_id) AND (pm.profile_id = auth.uid()) AND (pm.role = ANY (ARRAY['owner'::project_role, 'admin'::project_role, 'moderator'::project_role])) AND (pm.status = 'approved'::text))))));

CREATE POLICY "Enable insert for owners and admins" ON project_members
  FOR INSERT
  USING (null);

CREATE POLICY "Enable update for admins and moderators" ON project_members
  FOR UPDATE
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'moderator'::user_role]))))) OR (EXISTS ( SELECT 1
   FROM project_members pm
  WHERE ((pm.project_id = project_members.project_id) AND (pm.profile_id = auth.uid()) AND (pm.role = ANY (ARRAY['owner'::project_role, 'admin'::project_role, 'moderator'::project_role])) AND (pm.status = 'approved'::text))))));

CREATE POLICY "Load project members for all" ON project_members
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view project skills" ON project_skills
  FOR SELECT
  USING (true);

CREATE POLICY "Project members can manage skills" ON project_skills
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM project_members
  WHERE ((project_members.project_id = project_skills.project_id) AND (project_members.profile_id = auth.uid()) AND (project_members.status = 'approved'::text)))));

CREATE POLICY "Anyone can view public projects" ON projects
  FOR SELECT
  USING ((is_public = true));

CREATE POLICY "Enable delete for admins" ON projects
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

CREATE POLICY "Enable insert for authenticated users" ON projects
  FOR INSERT
  USING (null);

CREATE POLICY "Enable read access for all" ON projects
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for project owners and admins" ON projects
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM project_members
  WHERE ((project_members.project_id = projects.id) AND (project_members.profile_id = auth.uid()) AND (project_members.role = ANY (ARRAY['owner'::project_role, 'moderator'::project_role, 'admin'::project_role])) AND (project_members.status = 'approved'::text)))));

CREATE POLICY "Members can view their private projects" ON projects
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM project_members
  WHERE ((project_members.project_id = project_members.id) AND (project_members.profile_id = auth.uid()) AND (project_members.status = 'approved'::text)))));

CREATE POLICY "Enable read access for all" ON settings
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for admins" ON settings
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

CREATE POLICY "Admins can do anything" ON skills
  FOR ALL
  USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'admin'::user_role))));

CREATE POLICY "Anyone can read skills" ON skills
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all" ON skills
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read for all" ON skills
  FOR SELECT
  USING (true);

CREATE POLICY "Enable write for admin users" ON skills
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Enable read access for all" ON user_skills
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read for all" ON user_skills
  FOR SELECT
  USING (true);

CREATE POLICY "Enable write for own skills" ON user_skills
  FOR ALL
  USING (((auth.uid() = profile_id) OR is_admin(auth.uid())));

-- Functions
CREATE OR REPLACE FUNCTION pgbouncer.get_auth(p_usename text)
 RETURNS TABLE(username text, password text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$function$


CREATE OR REPLACE FUNCTION public.check_role_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if old.role is distinct from new.role and not is_admin(auth.uid()) then
    raise exception 'Only administrators can change user roles';
  end if;
  return new;
end;
$function$


CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  EXECUTE sql;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_functions()
 RETURNS TABLE(name text, schema text, language text, definition text, arguments text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.proname::text,
        n.nspname::text,
        l.lanname::text,
        pg_get_functiondef(p.oid)::text,
        pg_get_function_arguments(p.oid)::text
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE n.nspname NOT IN ('pg_catalog','information_schema','extensions','pgsodium','storage','realtime','vault')
    AND p.prokind = 'f'
    AND p.proowner = (SELECT usesysid FROM pg_user WHERE usename = current_user)
    ORDER BY n.nspname, p.proname;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_policies()
 RETURNS TABLE(name text, table_name text, command text, definition text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname::text,
        p.tablename::text,
        p.cmd::text,
        p.qual::text
    FROM pg_policies p
    ORDER BY p.tablename, p.policyname;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_project_role(project_id uuid, user_id uuid)
 RETURNS project_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return (
    select role from public.project_members
    where project_id = $1
    and profile_id = $2
    and status = 'approved'
  );
end;
$function$


CREATE OR REPLACE FUNCTION public.get_triggers()
 RETURNS TABLE(name text, table_name text, event text, timing text, definition text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.tgname::text,
        c.relname::text,
        CASE 
            WHEN t.tgtype & 1 = 1 THEN 'ROW'
            ELSE 'STATEMENT'
        END::text,
        CASE 
            WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
            WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
            ELSE 'AFTER'
        END::text,
        pg_get_triggerdef(t.oid)::text
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE NOT t.tgisinternal
    AND n.nspname NOT IN ('pg_catalog','information_schema','extensions','pgsodium','storage','realtime','vault')
    ORDER BY c.relname, t.tgname;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_user_project_role(project_id uuid, user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT role::text
    FROM project_members
    WHERE project_id = $1
    AND profile_id = $2
    AND status = 'approved'
    LIMIT 1
  );
END;
$function$


CREATE OR REPLACE FUNCTION public.handle_member_removal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Delete any join requests from this user for this project
  delete from project_join_requests
  where profile_id = old.profile_id
  and project_id = old.project_id;
  
  return old;
end;
$function$


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$function$


CREATE OR REPLACE FUNCTION public.handle_project_member_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- When a join request is approved, create a project member
  if new.status = 'approved' then
    insert into public.project_members (project_id, profile_id, role, status)
    values (new.project_id, new.profile_id, 'member', 'approved');
  end if;
  return new;
end;
$function$


CREATE OR REPLACE FUNCTION public.is_admin(userid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return exists (
    select 1 from profiles
    where id = userid
    and role = 'admin'
  );
end;
$function$


CREATE OR REPLACE FUNCTION public.is_project_member(project_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return exists (
    select 1 from public.project_members
    where project_id = $1
    and profile_id = $2
    and status = 'approved'
  );
end;
$function$


CREATE OR REPLACE FUNCTION public.log_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.audit_logs (
    table_name,
    record_id,
    action,
    performed_by,
    old_data
  ) values (
    TG_TABLE_NAME,
    old.id,
    'DELETE',
    auth.uid(),
    row_to_json(old)::jsonb
  );
  return old;
end;
$function$


CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if old.role is distinct from new.role then
    insert into role_change_logs (
      profile_id,
      old_role,
      new_role,
      changed_by
    ) values (
      new.id,
      old.role,
      new.role,
      auth.uid()
    );
  end if;
  return new;
end;
$function$


CREATE OR REPLACE FUNCTION public.prevent_remove_last_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if old.role = 'owner' and not exists (
    select 1 from project_members
    where project_id = old.project_id
    and role = 'owner'
    and id != old.id
  ) then
    raise exception 'Cannot remove the last owner of the project';
  end if;
  return old;
end;
$function$


-- Triggers
CREATE TRIGGER enforce_role_update BEFORE UPDATE ON public.profiles FOR EACH ROW WHEN ((old.role IS DISTINCT FROM new.role)) EXECUTE FUNCTION check_role_update();

CREATE TRIGGER log_role_changes AFTER UPDATE ON public.profiles FOR EACH ROW WHEN ((old.role IS DISTINCT FROM new.role)) EXECUTE FUNCTION log_role_change();

CREATE TRIGGER on_project_join_request_approval AFTER UPDATE OF status ON public.project_join_requests FOR EACH ROW WHEN ((new.status = 'approved'::text)) EXECUTE FUNCTION handle_project_member_approval();

CREATE TRIGGER check_last_owner BEFORE DELETE OR UPDATE ON public.project_members FOR EACH ROW WHEN ((old.role = 'owner'::project_role)) EXECUTE FUNCTION prevent_remove_last_owner();

CREATE TRIGGER on_member_removal AFTER DELETE ON public.project_members FOR EACH ROW EXECUTE FUNCTION handle_member_removal();

CREATE TRIGGER projects_audit_delete BEFORE DELETE ON public.projects FOR EACH ROW EXECUTE FUNCTION log_deletion();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

