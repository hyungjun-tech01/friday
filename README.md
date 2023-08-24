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
