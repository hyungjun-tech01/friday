drop function f_get_board_cancomment;

CREATE OR REPLACE FUNCTION f_get_board_cancomment(
	in i_user_id text,
    in i_board_id bigint,
    in i_project_id bigint)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
v_is_admin boolean;
v_role varchar := null;
v_project_role  varchar;
v_board_role varchar;
v_can_comment boolean := false;
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
      v_can_comment := true;
    else
      v_role := 'viewer';
    end if;

    BEGIN
       select role , can_comment
       into strict v_board_role , v_can_comment
       from board_membership bm
       where bm.board_id = i_board_id::bigint
        and bm.user_id = i_user_id :: bigint;

        if(v_board_role = 'editor') then
           v_role := 'editor';
           v_can_comment := true;
        else 
           v_role := 'viewer';
        end if;
    exception 
       when no_data_found then
        null;
    end;



    if(v_is_admin) then
      v_can_comment := true;
    end if;

    if (v_role is null) then
       v_can_comment := false;
    end if;

 return v_can_comment;
END;
$BODY$;