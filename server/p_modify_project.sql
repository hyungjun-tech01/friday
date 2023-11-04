drop procedure p_create_project;
drop procedure p_modify_project;

CREATE OR REPLACE PROCEDURE p_modify_project(i_creator_user_id in text, 
i_project_action_type in text,
i_project_name in text,
i_project_id in text,
i_manager_id in text,
x_project_id out text
 )
LANGUAGE plpgsql
AS $$
DECLARE
    a bigint;
    b bigint; 
    vv_project_name text;
    vv_project_id text;
    vv_manager_id text;
BEGIN
   if(i_project_action_type is not null) then
    if(i_project_action_type = 'ADD') then
        SELECT next_id() INTO a;
        INSERT INTO project (id, name, created_at, updated_at) 
        VALUES (a, i_project_name, now(), now()); 
        select next_id() into b; 
        -- 처음 만드는 사람은 프로젝트매니저임  
        insert into project_manager(id, project_id, user_id, created_at, updated_at) 
        values(b, a, i_creator_user_id::bigint, now(), now()); 
    elsif(i_project_action_type = 'UPDATE') then
    
        update project 
        set name = i_project_name
        where id = i_project_id::bigint;

    elsif(i_project_action_type = 'DELETE') then
        delete from project_manager 
        where project_id = i_project_id::bigint;

        delete from project 
        where id = i_project_id::bigint;

    elsif(i_project_action_type = 'ADD MANAGER') then
        select next_id() into b; 
        
        insert into project_manager(id, project_id, user_id, created_at, updated_at) 
        values(b, i_project_id::bigint, i_manager_id::bigint, now(), now()); 

    elsif(i_project_action_type = 'DELETE MANAGER') then
        delete from project_manager 
        where project_id = i_project_id::bigint
        and user_id = i_manager_id::bigint;

    end if;
     select COALESCE(i_project_name, ' '), COALESCE(i_project_id, ' ') , COALESCE(i_manager_id, ' ')
	    into vv_project_name, vv_project_id, vv_manager_id;
	   insert into action(id, user_id, card_id, type, data, created_at, updated_at)
	   values(next_id(), i_creator_user_id::bigint, -1,  'Project '||i_project_action_type, 
	   ('{"project_name":"'||vv_project_name||'", "project_id":"'||vv_project_id||'", "manager_id":"'||vv_manager_id|| '"}')::text::json,
		now(), now());    
   end if;
   x_project_id := a::text; 
END;
$$;
