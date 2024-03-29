DROP procedure IF EXISTS p_insert_board;
DROP procedure IF EXISTS p_modify_board;

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
i_board_label_action_type in text, --'ADD', 'DELETE','UPDATE'
i_label_id in text, 
i_label_name in text, 
i_label_color in text, 
i_label_position in text, 
x_board_id out text,
x_board_membership_id out text,
x_label_id out text,
x_position out text)
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
	v_label_id bigint default null;
	v_label_position int default 0;
	vv_label_id text;
	v_label_name text;
	v_label_color text;
	x_list_id text;
	xx_position text;
	x_createdAt text;
	x_updatedAt  text;
	TARGET_CURSOR record;
	c_position_increase bigint default 65536;
	v_position bigint;
	TARGET_BOARD_CURSOR record;
BEGIN
   if (i_board_action_type is not null) then
	   if (i_board_action_type  = 'ADD') then
	    SELECT next_id() INTO v_board_id;
		
		select count(*) 
			into v_board_count 
			from board 
			where project_id = i_project_id::bigint;
		
		v_position := c_position_increase*(v_board_count+1);

		-- 기존 보드는 re position 
		FOR TARGET_BOARD_CURSOR IN 
		   select (ROW_NUMBER() OVER()) AS ROWNUM, aa.id as id from
              (select id, position from board
               where project_id = i_project_id::bigint
			   order by position) aa
              LOOP
                 update board set position = TARGET_BOARD_CURSOR.rownum*c_position_increase
                 where id =     TARGET_BOARD_CURSOR.id;
              END LOOP;

	    INSERT INTO board (id, project_id, position, name, created_at)
	    VALUES (v_board_id, i_project_id::bigint, v_position, i_board_name, now());

		-- 처음 만드는 사람은 edit 권한 가짐.
		insert into board_membership(id, board_id, user_id, role, created_at)
		values(next_id(), v_board_id, i_user_id::bigint, 'editor', now());
	
	   elsif (i_board_action_type  = 'UPDATE') then
	      update board
	      set position = COALESCE(i_board_position::double precision , position),  
	          name= COALESCE(i_board_name , name), 
		      updated_at = now()
	      where id = i_board_id::bigint ; 
	
	   elsif (i_board_action_type  = 'DELETE') then
		-- 보드에 속한 리스트 삭제 
	   	FOR TARGET_CURSOR IN
                SELECT    id  
                FROM     list
                WHERE    board_id= i_board_id::bigint
            LOOP
                RAISE NOTICE 'TARGET ID %', TARGET_CURSOR;
				call p_modify_list(i_board_id, 
				i_user_id, 
				'DELETE', 
				TARGET_CURSOR.id::text , 
				  null,
				  null,
				  x_list_id,
				  xx_position,
				  x_createdAt,
				  x_updatedAt);
			END LOOP;	

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

		 select next_id() into v_board_membership_id;
		 insert into board_membership(id, board_id, user_id, created_at, updated_at, role, can_comment )
		 values(v_board_membership_id, i_board_id::bigint, i_board_membership_user_id::bigint, now(), now(), 
			    i_board_membership_role, i_board_membership_can_comment::boolean);
	  elsif(i_board_membership_action_type  = 'UPDATE') then 			
	  	update board_membership t 
		set role = COALESCE(i_board_membership_role,role),
		    can_comment = COALESCE(i_board_membership_can_comment::boolean, can_comment),
			updated_at = now()
		where board_id = i_board_id::bigint 
		and user_id = i_board_membership_user_id::bigint;

      elsif (i_board_membership_action_type  = 'DELETE') then
	     /* select count(*) into v_board_membership_count
		 from board_membership t
		 where t.board_id = i_board_id::bigint
		 and t.role = 'editor';
		 if(v_board_membership_count>=2) then  -- editor가 1명 이상은 있어야  */
			delete from board_membership t
			where t.board_id = i_board_id::bigint
			and t.user_id = i_board_membership_user_id::bigint;
		 /* end if; */
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
   if (i_board_label_action_type is not null) then
	  if(i_board_label_action_type = 'ADD') then
	  	select next_id() into v_label_id;
		select count(*) into v_label_position 
		from label t
		where t.board_id = i_board_id::bigint;
		
		 insert into label(id, board_id, name, color, position, created_at, updated_at )
		 values(v_label_id, i_board_id::bigint, i_label_name, i_label_color, v_label_position+1, now(), now());
	  elsif (i_board_label_action_type = 'UPDATE') then
		update label t
		set position = COALESCE(i_label_position::double precision , position),  
	          name= COALESCE(i_label_name , name), 
			  color = COALESCE(i_label_color , color), 
		      updated_at = now()
		where board_id = COALESCE(i_board_id::bigint, board_id)
		and id = i_label_id::bigint;

	  elsif (i_board_label_action_type = 'DELETE') then
		delete  from label t
		where t.board_id = COALESCE(i_board_id::bigint, t.board_id)
		and t.id = i_label_id::bigint;
	  end if;
 -- action 에 insert
       select COALESCE(i_label_id, v_label_id::text), COALESCE(i_board_id, ' '), 
	          COALESCE(i_label_name, ' '),
              COALESCE(i_label_color, ' ')
	    into vv_label_id,  vv_board_id, v_label_name, v_label_color;

	   insert into action(id, user_id, card_id, type, data, created_at, updated_at)
	   values(next_id(), i_user_id::bigint, -1, 'Board Label'||i_board_label_action_type, 
				  ('{"label_id":"'||vv_label_id||'", "board_id":"'||vv_board_id||'", "label_name":"'||v_label_name||'", "label_color":"'||v_label_color||  '"}')::text::json,
	now(), now());  	 
   end if;
   x_board_id  = v_board_id::text;
   x_label_id = v_label_id::text;
   x_board_membership_id = v_board_membership_id::text;
   x_position = v_position::text;
END;
$$;