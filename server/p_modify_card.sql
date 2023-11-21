drop procedure p_modify_card;

CREATE OR REPLACE PROCEDURE p_modify_card(i_card_id in text, 
i_user_id in text, 
i_card_action_type in text, 
i_list_id in text,
i_board_id in text,
i_description in text,
i_card_name in text, 
i_due_date in text, 
i_position in text,
i_stopwatch in jsonb,
i_cover_attachment_id in text,
i_card_membership_action_type in text,
i_card_membership_id in text,
i_card_membership_user_id in text,
i_card_label_action_type in text,
i_card_label_id in text, 
i_label_id in text,
i_card_task_action_type in text,
i_card_task_id in text,
i_card_task_name in text,
i_card_task_is_completed in text,
i_card_task_position in text, 
i_card_attachment_action_type in text,
i_card_attachment_id in text,
i_card_attachment_dirname in text,
i_card_attachment_filename in text,
i_card_attachment_name in text, 
i_card_attachment_image in jsonb,
i_card_comment_action_type in text,  
i_card_comment_id in text, 
i_card_comment_text  in text,
i_card_status_action_type in text,
i_card_status_id in text,
x_card_id out text,
x_card_position out text,
x_card_created_at out text,
x_card_membership_id out text,
x_card_label_id out text,
x_task_id out text,
x_attachment_id out text,
x_comment_id out text,
x_comment_created_at out text,
x_comment_updated_at out text,
x_card_membership_created_at out text,
x_card_task_created_at out text,
x_card_task_updated_at out text,
x_card_task_position out text,
x_card_attachment_created_at out text,
x_card_attachment_updatec_at out text
 )
LANGUAGE plpgsql
AS $$
DECLARE
v_card_name text;
v_description text;
v_due_date text;
v_position text;
v_card_membership_user_id text;
v_card_membership_id text;
v_label_id text;
v_card_label_id text;
v_card_task_name text;
v_card_task_is_completed text;
v_card_task_position text;
v_card_attatchment_dirname text;
v_card_attachment_filename text;
v_card_attachment_name text;
v_card_attachment_image text;
v_card_comment_text text;
v_new_board_id bigint;
vv_card_membership_id bigint default null;
vv_card_label_id bigint default null;
vv_task_id bigint default null;
vv_attachment_id bigint default null;
vv_comment_id bigint default null;
vv_comment_created_at timestamp without time zone default null;
vv_comment_updated_at timestamp without time zone  default null;
v_task_count double precision default 0;
v_null_udpate_stopwatch jsonb;
v_null_udpate_due_date text;
v_card_count int;
v_card_id bigint;
vv_card_id text;
vv_card_created_at timestamp without time zone default null;
vv_card_membership_created_at timestamp without time zone default null;
vv_card_task_created_at timestamp without time zone default null;
vv_card_task_updated_at timestamp without time zone default null;
vv_card_attachment_created_at timestamp without time zone default null;
vv_card_attachment_updatec_at timestamp without time zone default null;
v_attach_count int;
c_position_increase bigint default 65536;
vv_card_position bigint;
TARGET_CARD_CURSOR record;
vv_card_task_position bigint;
TARGET_TASK_CURSOR record;
v_card_action_id bigint;
v_subscription_id bigint;
BEGIN
	if(i_card_action_type is not null) then
	   	if(i_card_action_type = 'ADD') then

	      	SELECT next_id() INTO v_card_id;
		
			select count(*) 
				into v_card_count 
				from card 
				where list_id = i_list_id::bigint;

			vv_card_position := c_position_increase*(v_card_count+1);

			-- 기존 카드 re position 
			FOR TARGET_CARD_CURSOR IN 
			select (ROW_NUMBER() OVER()) AS ROWNUM, aa.id as id from
				(select id, position from card
				where list_id = i_list_id::bigint
				order by position) aa
				LOOP
					update card set position = TARGET_CARD_CURSOR.rownum*c_position_increase
					where id =     TARGET_CARD_CURSOR.id;
				END LOOP;			

			select now() into vv_card_created_at;

			insert into card(id, board_id, list_id, creator_user_id,name, position, created_at)
				select v_card_id, board_id, i_list_id::bigint, i_user_id::bigint, i_card_name,vv_card_position, vv_card_created_at
					from list where id= i_list_id::bigint;

			-- add Card Subscription always------
			insert into card_subscription(id, card_id, user_id, is_permanent, created_at, updated_at)
				values(next_id(), v_card_id, i_user_id::bigint, true, now(), null);

		elsif(i_card_action_type = 'UPDATE') then 

			if(i_stopwatch->>'total' is null) then
				select stopwatch into v_null_udpate_stopwatch 
				from card t where t.id = i_card_id::bigint;
			elseif(i_stopwatch->>'total' = '-1') then
			v_null_udpate_stopwatch := null;
			else 
			v_null_udpate_stopwatch := i_stopwatch;
			end if;

			if(i_due_date is null) then
				select due_date::text into v_null_udpate_due_date
				from card t where t.id = i_card_id::bigint;		
			elseif(i_due_date = '-1') then
			v_null_udpate_due_date := null;
			else 
				v_null_udpate_due_date := i_due_date;
			end if;

			-- card_name, description, due_date, position, stopwatch 이 null 이면 update 하지 않는다.

			update card
				set name = COALESCE(i_card_name, name), 
				description = COALESCE(i_description, description), 
				due_date = to_timestamp(v_null_udpate_due_date, 'YYYY-MM-DD HH24:MI:SS'),
				position = COALESCE(i_position::double precision, position) ,
				stopwatch = v_null_udpate_stopwatch,
				updated_at = now()
			where id = i_card_id::bigint;
			
		elsif (i_card_action_type = 'DELETE') then
			delete from card_label t where t.card_id = i_card_id::bigint;
			delete from card_membership t where t.card_id = i_card_id::bigint;
			delete from comment  t where t.card_id = i_card_id::bigint;
			delete from attachment  t where t.card_id =i_card_id::bigint;
			delete from task t where t.card_id =i_card_id::bigint;
			delete from card t  where t.id =i_card_id::bigint;
		elsif (i_card_action_type = 'MOVE') then

			select board_id 
			into v_new_board_id 
			from list t
			where t.id = i_list_id::bigint
			limit 1;

			update card
			set list_id = i_list_id::bigint,
				board_id = v_new_board_id,
				updated_at = now()
			where id = i_card_id::bigint;
		end if;

		-- if name, desc, due_date = null," " 로 대체해서 입력 : data에  
		select COALESCE(i_card_name, ' '), COALESCE(regexp_replace(i_description, '[\n\r]+', ' ', 'g' ), ' ') , COALESCE(i_due_date, ' '),COALESCE(i_position, ' ')
			into v_card_name, v_description, v_due_date, v_position;

		if(i_card_action_type = 'ADD') then
			vv_card_id := v_card_id::text;
		else
			vv_card_id := i_card_id;
		end if;
	
		select next_id() into v_card_action_id;
		insert into action(id, card_id, user_id, type, data, created_at, updated_at)
			values(v_card_action_id, vv_card_id::bigint, i_user_id::bigint, 'Card '||i_card_action_type, 
				('{"card_id":"'||vv_card_id||'", "name":"'||v_card_name||'", "description":"'||v_description||'", "due_date":"'||v_due_date||'", "position":"'||v_position||'"}')::text::json,
				now(), now());
		
		-- Card Subscription
		select id from card_subscription where card_id = vv_card_id::bigint and user_id = i_user_id::bigint into v_subscription_id;
		if(v_subscription_id != null and (i_card_action_type = 'ADD' or i_card_action_type = 'MOVE')) then
			insert into notification(user_id, action_id, card_id, is_read, created_at, updated_at)
				values(i_user_id::bigint, v_card_action_id, vv_card_id::bigint, false, now(), null);
		end if;
	end if;

	-- 카드 멤버쉽 추가 : i_card_membership_action_type = 'ADD', i_card_membership_user_id  /
	-- 삭제 : i_card_membership_action_type = 'DELETE' ,  i_card_membership_id, i_card_membership_user_id(option : action에 들어감 )
	if(i_card_membership_action_type is not null) then
		if(i_card_membership_action_type = 'ADD') then
            select next_id() into vv_card_membership_id;
			select now() into vv_card_membership_created_at;
			insert into card_membership(id, card_id, user_id, created_at, updated_at)
			values(vv_card_membership_id, i_card_id::bigint, i_card_membership_user_id::bigint, vv_card_membership_created_at, now());
		elseif (i_card_membership_action_type = 'DELETE') then
			delete from card_membership
			where id = COALESCE(i_card_membership_id::bigint, id)
			and card_id = i_card_id::bigint
			and user_id = i_card_membership_user_id::bigint;
		end if;

	 select COALESCE(i_card_membership_user_id, ' '), COALESCE(i_card_membership_id, ' ')
	    into v_card_membership_user_id, v_card_membership_id;

	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Membership '||i_card_membership_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_membership_user_id":"'||v_card_membership_user_id||'", "card_membership_id":"'||v_card_membership_id||  '"}')::text::json,
	now(), now());  

	end if;
	
	-- 카드 라벨 추가 : i_card_label_action_type = 'ADD' , i_label_id
	-- /삭제 : i_card_label_action_type = 'DELETE'  i_card_label_id,  i_label_id
	if(i_card_label_action_type is not null) then
		if(i_card_label_action_type = 'ADD') then
            select next_id() into vv_card_label_id ;
			insert into card_label(id, card_id, label_id, created_at, updated_at)
			values(vv_card_label_id , i_card_id::bigint, i_label_id::bigint, now(), now());
		elseif (i_card_label_action_type = 'DELETE') then
			delete from card_label
			where id = COALESCE(i_card_label_id::bigint, id)
			and card_id = i_card_id::bigint
			and label_id = i_label_id::bigint;
		end if;

	 select COALESCE(i_label_id, ' '), COALESCE(i_card_label_id, ' ')
	    into v_label_id, v_card_label_id;

	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Label '||i_card_label_action_type, 
				  ('{"card_id":"'||i_card_id||'", "label_id":"'||v_label_id||'", "card_label_id":"'||v_card_label_id||  '"}')::text::json,
		now(), now());  

	end if;
	-- 카드 타스크 추가/변경/삭제
	if(i_card_task_action_type is not null) then
		if(i_card_task_action_type = 'ADD') then
			
			select next_id() into vv_task_id;
			select now() into vv_card_task_created_at;

			select count(*) 
			  into v_task_count 
			   from task 
			   where card_id = i_card_id::bigint;

 		vv_card_task_position := c_position_increase*(v_task_count+1);

		-- 기존 타스트 re position 
		FOR TARGET_TASK_CURSOR IN 
		   select (ROW_NUMBER() OVER()) AS ROWNUM, aa.id as id from
              (select id, position from task
               where card_id = i_card_id::bigint
			   order by position) aa
              LOOP
                 update task set position = TARGET_TASK_CURSOR.rownum*c_position_increase
                 where id =     TARGET_TASK_CURSOR.id;
              END LOOP;					   
			   
			insert into task(id, card_id, name, is_completed, created_at, updated_at, position)
			values(vv_task_id, i_card_id::bigint, i_card_task_name, false, vv_card_task_created_at, now(), vv_card_task_position) ;
			
		elseif (i_card_task_action_type = 'UPDATE') then
			select now() into vv_card_task_updated_at;
			update task 
			set name = COALESCE(i_card_task_name, name), 
			    is_completed = COALESCE(i_card_task_is_completed::boolean, is_completed),
				position = COALESCE(i_card_task_position::double precision, position),
				updated_at = vv_card_task_updated_at
			where id = i_card_task_id::bigint;
		elseif (i_card_task_action_type = 'DELETE') then
		    delete from task 
			where id = i_card_task_id::bigint;
		end if;	
		
		select COALESCE(regexp_replace(i_card_task_name, '[\n\r]+', ' ', 'g' ), ' '), COALESCE(i_card_task_is_completed, ' '), COALESCE(i_card_task_position, ' ')
	    into v_card_task_name, v_card_task_is_completed, v_card_task_position;

	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Task '||i_card_task_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_task_name":"'||v_card_task_name||'", "card_task_is_completed":"'||v_card_task_is_completed||'", "card_task_position":"'||v_card_task_position||  '"}')::text::json,
		now(), now());  
		
	end if;
	if(i_card_attachment_action_type is not null) then
		if(i_card_attachment_action_type = 'ADD') then
            select next_id() into vv_attachment_id ;
			select now() into vv_card_attachment_created_at;
			insert  into attachment(id, card_id, creator_user_id, dirname, filename, name, created_at, updated_at, image)
			values(vv_attachment_id , i_card_id::bigint, i_user_id::bigint, i_card_attachment_dirname, i_card_attachment_filename, i_card_attachment_name, vv_card_attachment_created_at, now(), i_card_attachment_image);
			--카드의 cover_attachment_id 를 update, 첫번째  filename .jpg, .png 일떄 
			select count(*) into v_attach_count from attachment 
			where card_id = i_card_id::bigint
			and (position('.JPG' in upper(filename)) > 0 OR 
			       position('.PNG' in upper(filename)) > 0);
			if v_attach_count = 1 then
			   update card
			   set cover_attachment_id = vv_attachment_id
			   where id = i_card_id::bigint;	   
			end if;

		elseif 	(i_card_attachment_action_type = 'UPDATE') then
		   select now() into vv_card_attachment_updatec_at;
		   update attachment 
		   set name = COALESCE(i_card_attachment_name, name),
		   updated_at = vv_card_attachment_updatec_at
		   where id = i_card_attachment_id::bigint;
		elseif (i_card_attachment_action_type = 'DELETE') then
		   delete from attachment
		   where id = i_card_attachment_id::bigint;
		elseif (i_card_attachment_action_type = 'COVER ADD') then
			update card 
			set cover_attachment_id = i_cover_attachment_id::bigint
			where id = i_card_id::bigint;	   
		elseif (i_card_attachment_action_type = 'COVER DELETE') then
			update card
			set cover_attachment_id = null
			where id = i_card_id::bigint;	 
		end if;
		
		select COALESCE(i_card_attachment_dirname, ' '), COALESCE(i_card_attachment_filename, ' '), COALESCE(i_card_attachment_name, ' ')
	    into v_card_attatchment_dirname, v_card_attachment_filename, v_card_attachment_name;

	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Attachment '||i_card_attachment_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_attatchment_dirname":"'||v_card_attatchment_dirname||'", "card_attachment_filename":"'||v_card_attachment_filename|| '"}')::text::json,
		now(), now());  		
	end if;	
	-- 카드 댓글 추가/변경/ 삭제 
	if(i_card_comment_action_type is not null) then
		if(i_card_comment_action_type = 'ADD') then
            select next_id() into vv_comment_id ;
			select now() into vv_comment_created_at;
			insert into comment(id, card_id, user_id, text, created_at, updated_at)
			values(vv_comment_id , i_card_id::bigint, i_user_id::bigint, i_card_comment_text, vv_comment_created_at, vv_comment_created_at);
		elseif (i_card_comment_action_type = 'UPDATE') then
		    select now() into vv_comment_updated_at;
			update comment 
			 set text = COALESCE(i_card_comment_text, text), updated_at = vv_comment_updated_at
			 where id = i_card_comment_id::bigint;
		elseif (i_card_comment_action_type = 'DELETE') then
			delete from comment 
			where id = i_card_comment_id::bigint;
		end if;		
		
		select COALESCE( regexp_replace(i_card_comment_text, '[\n\r]+', ' ', 'g' ), ' ')
	    into v_card_comment_text;
		
		select next_id() into v_card_action_id;
		insert into action(id, card_id, user_id, type, data, created_at, updated_at)
			values(v_card_action_id, i_card_id::bigint, i_user_id::bigint, 'Card Comment'||i_card_comment_action_type, 
				('{"card_id":"'||i_card_id||'", "card_comment_text":"'||v_card_comment_text|| '"}')::text::json,
				now(), null);

		select id from card_subscription where card_id = i_card_id::bigint and user_id = i_user_id::bigint into v_subscription_id;
		if(v_subscription_id != null) then
			insert into notification(user_id, action_id, card_id, is_read, created_at, updated_at)
				values(i_user_id::bigint, v_card_action_id, i_card_id::bigint, false, now(), null);
		end if;

	end if;	
	-- 카드 상태 변경 
	if(i_card_status_action_type is not null) then
		if(i_card_status_action_type = 'UPDATE') then
			update card 
			set status_id = i_card_status_id :: bigint
			where id = i_card_id::bigint;
		end if;	
		
		insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card status '||i_card_status_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_status_id":"'||i_card_status_id|| '"}')::text::json,
		now(), now());  		
	end if;

	x_card_id = v_card_id::text;
	x_card_position = (vv_card_position) :: text;
	x_card_created_at = vv_card_created_at :: text;
    x_card_membership_id = vv_card_membership_id::text;
    x_card_label_id = vv_card_label_id::text;
    x_task_id = vv_task_id::text;
    x_attachment_id = vv_attachment_id::text;
    x_comment_id = vv_comment_id::text;
	x_comment_created_at = vv_comment_created_at::text;
	x_comment_updated_at = vv_comment_updated_at::text;

	x_card_membership_created_at = vv_card_membership_created_at::text;
	x_card_task_created_at = vv_card_task_created_at::text;
	x_card_task_updated_at = vv_card_task_updated_at::text;
	x_card_task_position = vv_card_task_position::text;
	x_card_attachment_created_at = vv_card_attachment_created_at::text;
	x_card_attachment_updatec_at = vv_card_attachment_updatec_at::text;
END;
$$;