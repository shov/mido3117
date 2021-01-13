DROP TABLE IF EXISTS discounted_tickets;

SELECT c.id cinema_id, c.name cinema_name, SUM(stg.amount) discounted_tickets_amount
INTO TEMP TABLE discounted_tickets
FROM cinemas c
         JOIN cinema_halls ch ON c.id = ch.cinema_id
         JOIN hall_seat_groups hsg ON ch.id = hsg.cinema_hall_id
         JOIN sold_ticket_groups stg ON hsg.id = stg.hall_seat_group_id
WHERE stg.discount_mod < 1.0
GROUP BY c.id, c.name;

SELECT *
FROM discounted_tickets;

DO $$
    DECLARE
        average_cost NUMERIC;
    BEGIN

        average_cost := (
            SELECT avg(s.base_price * hsg.price_mod * stg.discount_mod)::NUMERIC(12, 2) AS cost
            FROM cinemas c
                     JOIN cinema_halls ch ON c.id = ch.cinema_id
                     JOIN hall_seat_groups hsg ON ch.id = hsg.cinema_hall_id
                     JOIN sessions s ON ch.id = s.cinema_hall_id
                     JOIN sold_ticket_groups stg ON hsg.id = stg.hall_seat_group_id AND s.id = stg.session_id
        );

        RAISE NOTICE 'Average cost of tickets across the city is %', average_cost;

    END
$$ LANGUAGE plpgsql;
