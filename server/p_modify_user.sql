drop procedure if exists p_modify_user;


CREATE OR REPLACE PROCEDURE p_modify_user(i_creater_id in text, 
i_user_action_type in text, 
i_user_name in text, 
i_name in text, 
i_user_id in text,
i_email in text,
i_is_admin in boolean, 
i_password in text, 
i_phone in text, 
i_organization in text, 
i_subscribe_to_own_cards in boolean,
i_language in text,
i_avatar in text,
i_detail in text,
x_user_id out text,
x_created_at out text,
x_updated_at out text,
x_deleted_at out text,
x_password_changed_at out text
)
LANGUAGE plpgsql
AS $$
DECLARE
   v_user_id bigint;
   v_created_at timestamp without time zone;
   v_updated_at timestamp without time zone;
   v_deleted_at timestamp without time zone;
   v_password_changed_at timestamp without time zone;
   v_user_name text;
   v_email text;
   v_name text;
BEGIN
   if(i_user_action_type is not null) then
        if(i_user_action_type = 'ADD') then 
            select next_id() into v_user_id;
            select now() into v_created_at ;
            insert into user_account(id, email, password, is_admin, name, username, subscribe_to_own_cards, created_at)
            values(v_user_id, i_email, i_password, false, i_name, i_user_name, i_subscribe_to_own_cards, v_created_at);
        end if;

    select COALESCE(i_user_name, ' '), COALESCE(i_email, ' ') , COALESCE(i_name, ' ')
	    into v_user_name, v_email, v_name;
	   insert into action(id, user_id, card_id, type, data, created_at, updated_at)
	   values(next_id(), i_creater_id::bigint, -1,  'User '||i_user_action_type, 
	   ('{"user_name":"'||v_user_name||'", "email":"'||v_email||'", "name":"'||v_name|| '"}')::text::json,
		now(), now());    

    end if;

x_user_id = v_user_id::text;
x_created_at = v_created_at::text;
END;
$$;            