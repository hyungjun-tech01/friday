# friday
-- Node.js v18.16.0  
-- friday : 가지고 오기 

git clone https://github.com/hyungjun-tech01/friday.git  
cd client   
npm install   
cd server   
npm install   
  
server > .env 파일 : postgreSQL 의 설정에 맞게 세팅 변경   
  
터미널을 2개 열어서   
client > npm start   
server > npm start   
2개를 실행하고   
localhost:3003 로 접근   

planka 에 stored procedure 생성   
pgAdmin >   
database -> planka 선택 -> Tool -> Query Tool  

CREATE OR REPLACE PROCEDURE p_create_list(i_user_id in bigint, i_board_id in bigint, i_list_name in text)  
LANGUAGE plpgsql  
AS $$  
DECLARE   
   v_id bigint;  
BEGIN  
insert into list(id, board_id, name, position, created_at)  
values(next_id(), i_board_id, i_list_name, 1, now());  
END;  
$$;  

CREATE OR REPLACE PROCEDURE  p_insert_board(i_user_id in bigint, i_project_id in bigint, i_board_name in text)  
LANGUAGE plpgsql  
AS $$  
DECLARE  
    a bigint;  
	b bigint;  
BEGIN  
    SELECT next_id() INTO a;  
    INSERT INTO board (id, project_id, position, name, created_at)  
    VALUES (a, i_project_id, 1, i_board_name, now());  
	select next_id() into b;  
	-- 처음 만드는 사람은 edit 권한 가짐.  
	insert into board_membership(id, board_id, user_id, role, created_at)  
	values(b, a, i_user_id, 'editor', now());  
END;  
$$;  

-- table 추가  
-- Table: public.comment  

-- DROP TABLE IF EXISTS public.comment;  

CREATE TABLE IF NOT EXISTS public.comment  
(  
    id bigint NOT NULL,  
    card_id bigint NOT NULL,  
    user_id bigint NOT NULL,  
    text text COLLATE pg_catalog."default" NOT NULL,  
    created_at timestamp without time zone,  
    updated_at timestamp without time zone,  
    CONSTRAINT comment_pkey PRIMARY KEY (id)  
)  

TABLESPACE pg_default;  

ALTER TABLE IF EXISTS public.comment  
    OWNER to postgres;  

-- Table: public.status  

-- DROP TABLE IF EXISTS public.status;  

CREATE TABLE IF NOT EXISTS public.status  
(  
    id bigint,  
    name text COLLATE pg_catalog."default",  
    color text COLLATE pg_catalog."default",  
    board_id bigint,  
    "position" double precision,  
    created_at timestamp without time zone,  
    updated_at timestamp without time zone  
)  

TABLESPACE pg_default;  

ALTER TABLE IF EXISTS public.status  
    OWNER to postgres;      
    
-- 2023.08.29 추가   

ALTER TABLE card DROP COLUMN status_id;  
ALTER TABLE card ADD COLUMN status_id bigint;  

DROP PROCEDURE p_modify_card;  

CREATE OR REPLACE PROCEDURE p_modify_card(i_card_id in bigint,   
i_user_id in bigint,   
i_card_action_type in text,   
i_description in text,  
i_card_name in text,   
i_due_date in text,   
i_position in text,  
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
i_card_status_id in text  
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
BEGIN  
	if(i_card_action_type is not null) then  
	   if(i_card_action_type = 'UPDATE') then   
	   	-- card_name, description, due_date, position 이 null 이면 update 하지 않는다.  
		update card  
			set name = COALESCE(i_card_name, name),   
	    	description = COALESCE(i_description, description),   
			due_date = to_date(COALESCE(i_due_date, due_date::text), 'YYYY.MM.DD'),  
			position = COALESCE(i_position::double precision, position) ,  
			updated_at = now()  
			where id = i_card_id;  
			
	   elsif (i_card_action_type = 'DELETE') then  
		delete from card_label t where t.card_id = i_card_id;  
		delete from card_membership t where t.card_id = i_card_id;  
		delete from comment  t where t.card_id = i_card_id;  
		delete from attachement  t where t.card_id =i_card_id;  
		delete from task t where t.card_id =i_card_id;  
		delete from card t  where t.card_id =i_card_id;  
	   end if;  

	  -- if name, desc, due_date = null," " 로 대체해서 입력 : data에    
	 select COALESCE(i_card_name, ' '), COALESCE(i_description, ' ') , COALESCE(i_due_date, ' '),COALESCE(i_position, ' ')  
	    into v_card_name, v_description, v_due_date, v_position;  
		
	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)  
	   values(next_id(), i_card_id, i_user_id, 'Card '||i_card_action_type,   
				  ('{"card_id":"'||i_card_id||'", "name":"'||v_card_name||'", "description":"'||v_description||'", "due_date":"'||v_due_date||'", "position":"'||v_position||  '"}')::text::json,  
	now(), now());    
	end if;  

	-- 카드 멤버쉽 추가 : i_card_membership_action_type = 'ADD', i_card_membership_user_id  /  
	-- 삭제 : i_card_membership_action_type = 'DELETE' ,  i_card_membership_id, i_card_membership_user_id(option : action에 들어감 )  
	if(i_card_membership_action_type is not null) then  
		if(i_card_membership_action_type = 'ADD') then  
			insert into card_membership(id, card_id, user_id, created_at, updated_at)  
			values(next_id(), i_card_id, i_card_membership_user_id::bigint, now(), now());  
		elseif (i_card_membership_action_type = 'DELETE') then  
			delete from card_membership  
			where id = i_card_membership_id::bigint;  
		end if;  
  
	 select COALESCE(i_card_membership_user_id, ' '), COALESCE(i_card_membership_id, ' ')  
	    into v_card_membership_user_id, v_card_membership_id;  
  
	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)  
	   values(next_id(), i_card_id, i_user_id, 'Card Membership '||i_card_membership_action_type,   
				  ('{"card_id":"'||i_card_id||'", "card_membership_user_id":"'||v_card_membership_user_id||'", "card_membership_id":"'||v_card_membership_id||  '"}')::text::json,  
	now(), now());    

	end if;  
	
	-- 카드 라벨 추가 : i_card_label_action_type = 'ADD' , i_label_id  
	-- /삭제 : i_card_label_action_type = 'DELETE'  i_card_label_id,  i_label_id  
	if(i_card_label_action_type is not null) then  
		if(i_card_label_action_type = 'ADD') then  
			insert into card_label(id, card_id, label_id, created_at, updated_at)  
			values(next_id(), i_card_id, i_label_id::bigint, now(), now());  
		elseif (i_card_label_action_type = 'DELETE') then  
			delete from card_label  
			where id = i_card_label_id::bigint;  
		end if;  
  
	 select COALESCE(i_label_id, ' '), COALESCE(i_card_label_id, ' ')  
	    into v_label_id, v_card_label_id;  
  
	  insert into action(id, card_id, user_id, type, data, created_at, updated_at)  
	   values(next_id(), i_card_id, i_user_id, 'Card Label '||i_card_label_action_type,   
				  ('{"card_id":"'||i_card_id||'", "label_id":"'||v_label_id||'", "card_label_id":"'||v_card_label_id||  '"}')::text::json,  
		now(), now());    

	end if;  
	-- 카드 타스크 추가/변경/삭제  
	if(i_card_task_action_type is not null) then  
		if(i_card_task_action_type = 'ADD') then  
			insert into task(id, card_id, name, is_completed, created_at, updated_at, position)  
			values(next_id(), i_card_id, i_card_task_name, false, now(), now(), i_card_task_position::double precision);  
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
	   values(next_id(), i_card_id, i_user_id, 'Card Task '||i_card_task_action_type,   
				  ('{"card_id":"'||i_card_id||'", "card_task_name":"'||v_card_task_name||'", "card_task_is_completed":"'||v_card_task_is_completed||'", "card_task_position":"'||v_card_task_position||  '"}')::text::json,  
		now(), now());    
		  
	end if;  
	if(i_card_attachment_action_type is not null) then  
		if(i_card_attachment_action_type = 'ADD') then  
			insert  into attachment(id, card_id, creator_user_id, dirname, filename, name, created_at, updated_at, image)  
			values(next_id(), i_card_id, i_user_id, i_card_attachment_dirname, i_card_attachment_filename, i_card_attachment_name, now(), now(), i_card_attachment_image::text::json);  
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
	   values(next_id(), i_card_id, i_user_id, 'Card Attachment '||i_card_attachment_action_type,   
				  ('{"card_id":"'||i_card_id||'", "card_attatchment_dirname":"'||v_card_attatchment_dirname||'", "card_attachment_filename":"'||v_card_attachment_filename||'", "card_attachment_name":"'||v_card_attachment_name|| '"}')::text::json,  
		now(), now());  		
	end if;	  
	-- 카드 댓글 추가/변경/ 삭제   
	if(i_card_comment_action_type is not null) then  
		if(i_card_comment_action_type = 'ADD') then  
			insert into comment(id, card_id, user_id, text, created_at, updated_at)  
			values(next_id(), i_card_id, i_user_id, i_card_comment_text, now(), now());  
		elseif (i_card_comment_action_type = 'UPDATE') then  
			update comment   
			 set text = COALESCE(i_card_comment_text, text)  
			 where id = i_card_comment_id::bigint;  
		elseif (i_card_comment_action_type = 'DELETE') then  
			delete from comment   
			where id = i_card_comment_id::bigint;  
		end if;		  
		
		select COALESCE(i_card_comment_text, ' ')  
	    into v_card_comment_text;  
		
		insert into action(id, card_id, user_id, type, data, created_at, updated_at)  
	   values(next_id(), i_card_id, i_user_id, 'Card Comment '||i_card_comment_action_type,   
				  ('{"card_id":"'||i_card_id||'", "card_comment_text":"'||v_card_comment_text|| '"}')::text::json,  
		now(), now());    
	end if;	  
	-- 카드 상태 변경   
	if(i_card_status_action_type is not null) then  
		if(i_card_status_action_type = 'UPDATE') then  
			update card   
			set status_id = i_card_status_id :: bigint  
			where id = i_card_id;  
		end if;	  
		
		insert into action(id, card_id, user_id, type, data, created_at, updated_at)  
	   values(next_id(), i_card_id, i_user_id, 'Card status '||i_card_status_action_type,   
				  ('{"card_id":"'||i_card_id||'", "card_status_id":"'||i_card_status_id|| '"}')::text::json,  
		now(), now());  		  
	end if;  
END;    
$$;  
