DROP FUNCTION IF EXISTS p_create_list;
DROP FUNCTION IF EXISTS p_modify_list;


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
   TARGET_CURSOR record;
   x_card_id text;                    
   x_card_position text;              
   x_card_created_at text;            
   x_card_membership_id text;         
   x_card_label_id text;              
   x_task_id text;                    
   x_attachment_id text;              
   x_comment_id text;                 
   x_comment_created_at text;         
   x_comment_updated_at text;         
   x_card_membership_created_at text; 
   x_card_task_created_at text;       
   x_card_task_updated_at text;       
   x_card_attachment_created_at text; 
   x_card_attachment_updatec_at text;   
   x_card_task_position text;
   c_position_increase bigint default 65536;
   v_position bigint;
   TARGET_LIST_CURSOR record;
BEGIN
   if(i_list_action_type is not null) then
        if(i_list_action_type = 'ADD') then 
            select next_id() into v_list_id;

            select count(*) into v_count
            from list t 
            where t.board_id = i_board_id::bigint;
            select now() into v_created_at;


 		    v_position := c_position_increase*(v_count+1);

		-- 기존 리스트는 re position 
		FOR TARGET_LIST_CURSOR IN 
		   select (ROW_NUMBER() OVER()) AS ROWNUM, aa.id as id from
              (select id, position from list
               where board_id = i_board_id::bigint
			   order by position) aa
              LOOP
                 update list set position = TARGET_LIST_CURSOR.rownum*c_position_increase
                 where id =     TARGET_LIST_CURSOR.id;
              END LOOP;

            insert into list(id, board_id, name, position, created_at, create_user_id)
            values(v_list_id, i_board_id::bigint, i_list_name, v_position, v_created_at, i_user_id::bigint);
        elsif(i_list_action_type = 'UPDATE') then
            select now() into v_updated_at;
            update list 
            set name = COALESCE(i_list_name, name), 
            position = COALESCE(i_position::double precision, position),
            updated_At = v_updated_at
            where id = i_list_id::bigint;
        elsif(i_list_action_type = 'DELETE')  then
            FOR TARGET_CURSOR IN
                SELECT    id  
                FROM     card
                WHERE    list_id= i_list_id::bigint
            LOOP
                RAISE NOTICE 'TARGET ID %', TARGET_CURSOR;
                call p_modify_card(
                TARGET_CURSOR.id::text, 
                i_user_id, 
                'DELETE', 
                null,  
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                x_card_id , 
                x_card_position , 
                x_card_created_at , 
                x_card_membership_id , 
                x_card_label_id , 
                x_task_id , 
                x_attachment_id , 
                x_comment_id , 
                x_comment_created_at , 
                x_comment_updated_at , 
                x_card_membership_created_at , 
                x_card_task_created_at , 
                x_card_task_updated_at , 
                x_card_task_position,
                x_card_attachment_created_at , 
                x_card_attachment_updatec_at );
            
            END LOOP;        

            delete from card 
            where list_id = i_list_id::bigint;
            
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
   x_position = (v_position)::text;
   x_updatedAt = v_updated_at::text;
   x_createdAt = v_created_at::text;
END;
$$;