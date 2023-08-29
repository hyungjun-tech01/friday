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
