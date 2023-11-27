drop procedure p_init_positions;

CREATE OR REPLACE PROCEDURE p_init_positions()
    LANGUAGE plpgsql
    AS $$
    DECLARE
       
    SOURCE_PROJECT_CURSOR record;
    TARGET_BOARD_CURSOR record;
	SOURCE_BOARD_CUROSR record;
	TARGET_LIST_CURSOR record;
	SOURCE_LIST_CURSOR record;
    TARGET_CARD_CURSOR record;
	SOURCE_CARD_CURSOR record;
	TARGET_TASK_CURSOR record;
	BEGIN

    update board set position = 0;
    update list set position = 0;
    update card set position = 0;
    update task set position = 0;    

       FOR SOURCE_PROJECT_CURSOR IN 
            SELECT    id  
              FROM    project
       
       LOOP
           FOR TARGET_BOARD_CURSOR IN 
              select (ROW_NUMBER() OVER()) AS ROWNUM, id from board
               where project_id = SOURCE_PROJECT_CURSOR.id
              LOOP
                 update board set position = TARGET_BOARD_CURSOR.rownum*65536
                 where id =     TARGET_BOARD_CURSOR.id;
              END LOOP;
       END LOOP;
-- list 	   
       FOR SOURCE_BOARD_CUROSR IN 
            SELECT    id  
              FROM    board
       LOOP
           FOR TARGET_LIST_CURSOR IN 
              select (ROW_NUMBER() OVER()) AS ROWNUM, id from list
               where board_id = SOURCE_BOARD_CUROSR.id
              LOOP
                 update list set position = TARGET_LIST_CURSOR.rownum*65536
                 where id =     TARGET_LIST_CURSOR.id;
              END LOOP;
       END LOOP;	   

-- card 
       FOR SOURCE_LIST_CURSOR IN 
            SELECT    id  
              FROM    list
       LOOP
           FOR TARGET_CARD_CURSOR IN 
              select (ROW_NUMBER() OVER()) AS ROWNUM, id from card
               where list_id = SOURCE_LIST_CURSOR.id
              LOOP
                 update card set position = TARGET_CARD_CURSOR.rownum*65536
                 where id =     TARGET_CARD_CURSOR.id;
              END LOOP;
       END LOOP;
-- task 
       FOR SOURCE_CARD_CURSOR IN 
            SELECT    id  
              FROM    card
       LOOP
           FOR TARGET_TASK_CURSOR IN 
              select (ROW_NUMBER() OVER()) AS ROWNUM, id from task
               where card_id = SOURCE_CARD_CURSOR.id
              LOOP
                 update task set position = TARGET_TASK_CURSOR.rownum*65536
                 where id =     TARGET_TASK_CURSOR.id;
              END LOOP;
       END LOOP;

    END;
    $$;      


call p_init_positions();

