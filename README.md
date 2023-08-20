# friday
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
