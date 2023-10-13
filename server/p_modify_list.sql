drop procedure p_create_list;
drop procedure p_modify_list;


CREATE OR REPLACE PROCEDURE p_modify_list(i_board_id in text, 
i_user_id in text, 
i_list_action_type in text, 
i_list_id in text,
i_list_name in text, 
i_position in text,
x_list_id out text,
x_position out text,
x_createdAt out text,
x_updatedAt out text
)
LANGUAGE plpgsql
AS $$
DECLARE
   v_list_id bigint;
   v_count bigint;
   v_created_at timestamp without time zone;
   v_updated_at timestamp without time zone;
   vv_list_name text;
   vv_list_id text;
   vv_board_id text;
BEGIN
   if(i_list_action_type is not null) then
        if(i_list_action_type = 'ADD') then 
            select next_id() into v_list_id;
            select count(*) into v_count
            from list t 
            where t.board_id = i_board_id::bigint;
            select now() into v_created_at;

            insert into list(id, board_id, name, position, created_at)
            values(v_list_id, i_board_id::bigint, i_list_name, v_count, v_created_at);
        elsif(i_list_action_type = 'UPDATE') then
            select now() into v_updated_at;
            update list 
            set name = COALESCE(i_list_name, name), 
            position = COALESCE(i_position::double precision, position),
            updated_At = v_updated_at
            where id = i_list_id::bigint;
        elsif(i_list_action_type = 'DELETE')  then
            delete from card 
            where list_id = i_list_id::biging;
            delete from list 
            where id = i_list_id::bigint;
        end if;
      select COALESCE(i_list_name, ' '), COALESCE(i_list_id, ' ') , COALESCE(i_board_id, ' ')
	    into vv_list_name, vv_list_id, vv_board_id;
	   insert into action(id, user_id, card_id, type, data, created_at, updated_at)
	   values(next_id(), i_user_id::bigint, -1,  'List '||i_list_action_type, 
	   ('{"list_name":"'||vv_list_name||'", "list_id":"'||vv_list_id||'", "board_id":"'||vv_board_id|| '"}')::text::json,
		now(), now());    
    end if;
   x_list_id = v_list_id::text;
   x_position = (v_count + 1)::text;
   x_updatedAt = v_updated_at::text;
   x_createdAt = v_created_at::text;
END;
$$;