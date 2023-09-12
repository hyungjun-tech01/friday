drop procedure p_insert_board;
drop procedure p_modify_board;

CREATE OR REPLACE PROCEDURE p_modify_board(
i_board_action_type in text,   -- ADD, UPDATE, DELETE
i_user_id in text, 
i_project_id in text,     
i_board_name in text,
i_board_position in text,
i_board_id in text,
i_board_membership_action_type in text,  -- ADD, DELETE
i_board_membership_id in text,
i_board_membership_user_id in text,
i_board_membership_role in text, -- 'editor, viewer'    i_board_memebership_role
i_board_membership_can_comment in text, -- true, false : 현재는 true
x_board_id out text)
LANGUAGE plpgsql
AS $$
DECLARE
     v_board_id bigint default null;
	 v_board_membership_id bigint default null;
     v_board_name text;
     v_board_position text;
     v_project_id text;
     v_board_membership_user_id text;
     v_board_membership_role text;
     vv_board_id text;
     v_board_membership_can_comment text;
     vv_board_membership_id text;
	 v_board_count double precision default 0;
	 v_board_membership_count int default 0;
BEGIN
   if (i_board_action_type is not null) then
	   if (i_board_action_type  = 'ADD') then
	    SELECT next_id() INTO v_board_id;
		
		select count(*) 
			into v_board_count 
			from board 
			where project_id = i_project_id::bigint;

	    INSERT INTO board (id, project_id, position, name, created_at)
	    VALUES (v_board_id, i_project_id::bigint, v_board_count+1, i_board_name, now());

		-- 처음 만드는 사람은 edit 권한 가짐.
		insert into board_membership(id, board_id, user_id, role, created_at)
		values(next_id(), v_board_id, i_user_id::bigint, 'editor', now());
	
	   elsif (i_board_action_type  = 'UPDATE') then
	      update board t
	      set t.postion = COALESCE(i_board_position::double precision , position),  
	          t.name= COALESCE(i_board_name , name), 
		      t.updated_at = now()
	      where t.id = i_board_id::bigint ; 
	
	   elsif (i_board_action_type  = 'DELETE') then
		  delete from board t
		  where t.id = i_board_id::bigint ; 

		  delete from board_membership t
		  where t.board_id = i_board_id::bigint ; 
		
	   end if;
	   -- action 에 insert
       select COALESCE(i_board_name, ' '), COALESCE(i_board_position, ' ') , COALESCE(i_board_id, ' '), COALESCE(i_project_id, ' ')
	    into v_board_name, v_board_position, vv_board_id, v_project_id;
	   insert into action(id, user_id, card_id, type, data, created_at, updated_at)
	   values(next_id(), i_user_id::bigint, -1,  'Board '||i_board_action_type, 
	   ('{"board_name":"'||v_board_name||'", "board_position":"'||v_board_position||'", "board_id":"'||vv_board_id||'", "project_id":"'||v_project_id|| '"}')::text::json,
		now(), now());  		
   end if;
   if (i_board_membership_action_type is not null) then
      if (i_board_membership_action_type  = 'ADD') then

		 select next_id into v_board_membership_id;
		 insert into board_membership(id, board_id, user_id, created_at, updated_at, role, can_comment )
		 values(v_board_membership_id, i_board_id::bigint, v_board_membership_user_id, now(), now(), 
			    i_board_membership_role, i_board_membership_can_comment::boolean);
				
      elsif (i_board_membership_action_type  = 'DELETE') then
	     select count(*) into v_board_membership_count
		 from board_membership t
		 where t.board_id = i_board_id::bigint
		 and t.role = 'editor';
		 if(v_board_membership_count>=2) then  -- editor가 1명 이상은 있어야 
			delete from board_membership t
			where t.board_id = i_board_id::bigint
			and t.user_id = i_board_membership_user_id::bigint;
		 end if;
      end if;
	   -- action 에 insert
       select COALESCE(i_board_membership_user_id, ' '), COALESCE(i_board_membership_role, ' ') , COALESCE(i_board_id, v_board_id::text), COALESCE(i_board_membership_can_comment, ' '),
              COALESCE(i_board_membership_id, ' ')
	    into v_board_membership_user_id, v_board_membership_role, vv_board_id, v_board_membership_can_comment, vv_board_membership_id;

	   insert into action(id, user_id, card_id, type, data, created_at, updated_at)
	   values(next_id(), i_user_id::bigint, -1, 'Board Membership'||i_board_membership_action_type, 
				  ('{"board_id":"'||vv_board_id||'", "board_membership_id":"'||vv_board_membership_id||'", "board_membership_user_id":"'||v_board_membership_user_id||'", "board_membership_can_comment":"'||v_board_membership_can_comment||'", "board_membership_role":"'||v_board_membership_role||  '"}')::text::json,
	now(), now());  	      
   end if;
   
   x_board_id  = v_board_id::text;
   
END;
$$;