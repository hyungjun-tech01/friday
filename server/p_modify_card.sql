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
i_card_attachment_image in text,
i_card_comment_action_type in text,  
i_card_comment_id in text, 
i_card_comment_text  in text,
i_card_status_action_type in text,
i_card_status_id in text,
x_card_membership_id out text,
x_card_label_id out text,
x_task_id out text,
x_attachment_id out text,
x_comment_id out text,
x_comment_created_at out text,
x_comment_updated_at out text
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
BEGIN
	if(i_card_action_type is not null) then
	   if(i_card_action_type = 'ADD') then

	      SELECT next_id() INTO v_card_id;
		
		select count(*) 
			into v_card_count 
			from card 
			where list_id = i_list_id::bigint;
        
		insert into card(id, board_id, list_id, creator_user_id,name, position, created_at)
		select v_card_id, board_id, i_list_id::bigint, i_user_id::bigint, i_card_name,v_card_count+1, now()
        from list where id= i_list_id::bigint ;

	   elseif(i_card_action_type = 'UPDATE') then 

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
		delete from attachement  t where t.card_id =i_card_id::bigint;
		delete from task t where t.card_id =i_card_id::bigint;
		delete from card t  where t.card_id =i_card_id::bigint;
	   end if;

	  -- if name, desc, due_date = null," " 로 대체해서 입력 : data에  
	 select COALESCE(i_card_name, ' '), COALESCE(i_description, ' ') , COALESCE(i_due_date, ' '),COALESCE(i_position, ' ')
	    into v_card_name, v_description, v_due_date, v_position;
		
	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card '||i_card_action_type, 
				  ('{"card_id":"'||i_card_id||'", "name":"'||v_card_name||'", "description":"'||v_description||'", "due_date":"'||v_due_date||'", "position":"'||v_position||  '"}')::text::json,
	now(), now());  
	end if;

	-- 카드 멤버쉽 추가 : i_card_membership_action_type = 'ADD', i_card_membership_user_id  /
	-- 삭제 : i_card_membership_action_type = 'DELETE' ,  i_card_membership_id, i_card_membership_user_id(option : action에 들어감 )
	if(i_card_membership_action_type is not null) then
		if(i_card_membership_action_type = 'ADD') then
            select next_id() into vv_card_membership_id;
			insert into card_membership(id, card_id, user_id, created_at, updated_at)
			values(vv_card_membership_id, i_card_id::bigint, i_card_membership_user_id::bigint, now(), now());
		elseif (i_card_membership_action_type = 'DELETE') then
			delete from card_membership
			where id = i_card_membership_id::bigint;
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
			where id = i_card_label_id::bigint;
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

			select count(*) 
			  into v_task_count 
			   from task 
			   where card_id = i_card_id::bigint;
			   
			insert into task(id, card_id, name, is_completed, created_at, updated_at, position)
			values(vv_task_id, i_card_id::bigint, i_card_task_name, false, now(), now(), v_task_count+1) ;
			
		elseif (i_card_task_action_type = 'UPDATE') then
			update task 
			set name = COALESCE(i_card_task_name, name), 
			    is_completed = COALESCE(i_card_task_is_completed::boolean),
				position = COALESCE(i_card_task_position::double precision, position)
			where id = i_card_task_id::bigint;
		elseif (i_card_task_action_type = 'DELETE') then
		    delete from task 
			where id = i_card_task_id::bigint;
		end if;	
		
		select COALESCE(i_card_task_name, ' '), COALESCE(i_card_task_is_completed, ' '), COALESCE(i_card_task_position, ' ')
	    into v_card_task_name, v_card_task_is_completed, v_card_task_position;

	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Task '||i_card_task_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_task_name":"'||v_card_task_name||'", "card_task_is_completed":"'||v_card_task_is_completed||'", "card_task_position":"'||v_card_task_position||  '"}')::text::json,
		now(), now());  
		
	end if;
	if(i_card_attachment_action_type is not null) then
		if(i_card_attachment_action_type = 'ADD') then
                       select next_id() into vv_attachment_id ;
			insert  into attachment(id, card_id, creator_user_id, dirname, filename, name, created_at, updated_at, image)
			values(vv_attachment_id , i_card_id::bigint, i_user_id::bigint, i_card_attachment_dirname, i_card_attachment_filename, i_card_attachment_name, now(), now(), i_card_attachment_image::text::json);
		elseif 	(i_card_attachment_action_type = 'UPDATE') then
		   update attachment 
		   set name = COALESCE(i_card_attachment_name, name)
		   where id = i_card_attachment_id::bigint;
		elseif (i_card_attachment_action_type = 'DELETE') then
		   delete from attachment
		   where id = i_card_attachment_id::bigint;
		end if;
		
		select COALESCE(i_card_attachment_dirname, ' '), COALESCE(i_card_attachment_filename, ' '), COALESCE(i_card_attachment_name, ' '), COALESCE(i_card_attachment_image, ' ')
	    into v_card_attatchment_dirname, v_card_attachment_filename, v_card_attachment_name, v_card_attachment_image;

	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Attachment '||i_card_attachment_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_attatchment_dirname":"'||v_card_attatchment_dirname||'", "card_attachment_filename":"'||v_card_attachment_filename||'", "card_attachment_name":"'||v_card_attachment_name|| '"}')::text::json,
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
		
		select COALESCE(i_card_comment_text, ' ')
	    into v_card_comment_text;
		
		insert into action(id, card_id, user_id, type, data, created_at, updated_at)
	   values(next_id(), i_card_id::bigint, i_user_id::bigint, 'Card Comment '||i_card_comment_action_type, 
				  ('{"card_id":"'||i_card_id||'", "card_comment_text":"'||v_card_comment_text|| '"}')::text::json,
		now(), now());  
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


    x_card_membership_id = vv_card_membership_id::text;
    x_card_label_id = vv_card_label_id::text;
    x_task_id = vv_task_id::text;
    x_attachment_id = vv_attachment_id::text;
    x_comment_id = vv_comment_id::text;
	x_comment_created_at = vv_comment_created_at::text;
	x_comment_updated_at = vv_comment_updated_at::text;
END;
$$;