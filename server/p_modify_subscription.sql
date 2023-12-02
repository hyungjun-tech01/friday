drop procedure if exists p_modify_subscription;

CREATE OR REPLACE PROCEDURE p_modify_subscription(
    i_subscription_action in text,
    i_card_id in text,
    i_user_id in text,
    i_is_permanent in boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
v_subscription_id bigint;
v_created_at timestamp without time zone;
v_updated_at timestamp without time zone;

BEGIN
    if(i_subscription_action is not null) then
        if(i_subscription_action = 'ADD') then
            select next_id() into v_subscription_id;
            select to_char(CAST(now() as timestamp without time zone), 'YYYY-MM-DD HH24:MI:SS') into v_created_at;

            insert into card_subscription (id, card_id, user_id, is_permanent, created_at, updated_at)
                values (v_subscription_id, i_card_id::bigint, i_user_id::bigint, i_is_permanent, v_created_at, null);

        elsif(i_subscription_action = 'DELETE') then
            delete from card_subscription where card_id = i_card_id::bigint and user_id = i_user_id::bigint;

        end if;
    end if;
END;
$$;