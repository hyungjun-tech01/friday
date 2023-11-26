DROP FUNCTION IF EXISTS f_get_board_role;

CREATE OR REPLACE FUNCTION f_get_board_role(
	in i_user_id text,
    in i_board_id bigint,
    in i_project_id bigint)
    RETURNS varchar
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
v_is_admin boolean;
v_role varchar := null;
v_project_role  varchar;
v_board_role varchar;
BEGIN

    select is_admin 
        into  v_is_admin 
        from user_account ua
        where ua.id = i_user_id::bigint;

    select role 
      into v_project_role
      from project_manager pm
      where pm.project_id = i_project_id::bigint
      and pm.user_id = i_user_id ::bigint;


    if(v_project_role = 'manager') then
      v_role := 'editor';
    else
      v_role := '';   -- viewer
    end if;

    BEGIN
       select role 
       into strict v_board_role 
       from board_membership bm
       where bm.board_id = i_board_id::bigint
        and bm.user_id = i_user_id :: bigint;

        if(v_board_role = 'editor') then
           v_role := 'editor';
        else 
           v_role := 'viewer';
        end if;
    exception 
       when no_data_found then
        null;
    end;



    if(v_is_admin) then
      v_role := 'editor';
    end if;

--    if (v_role is null) then
--       v_role := 'viewer';
--    end if;

 return v_role;
END;
$BODY$;