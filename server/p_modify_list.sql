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

DECLARE 
   v_id bigint;
BEGIN
   if(i_list_action_type is not null){
        if(i_list_action_type = 'ADD') then 
            insert into list(id, board_id, name, position, created_at)
            values(next_id(), i_board_id, i_list_name, 1, now());
        elsif(i_list_action_type = 'UPDATE') then
        elsif(i_list_action_type = 'DELETE')  then
        
    end if;
   }
END;

END;
$$;