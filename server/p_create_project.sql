drop procedure p_create_project;


CREATE OR REPLACE PROCEDURE p_create_project(i_user_id in text, 
i_project_name in text
 )
LANGUAGE plpgsql
AS $$
DECLARE
    a bigint;
    b bigint; 
BEGIN
    SELECT next_id() INTO a;
    INSERT INTO project (id, name, created_at, updated_at) 
    VALUES (a, i_project_name, now(), now()); 
    select next_id() into b; 
	-- 처음 만드는 사람은 프로젝트매니저임  
    insert into project_manager(id, project_id, user_id, created_at, updated_at) 
	values(b, a, i_user_id::bigint, now(), now()); 
END;
$$;
