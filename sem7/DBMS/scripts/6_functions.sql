DROP FUNCTION IF EXISTS average_cost_of_cinema;
CREATE OR REPLACE FUNCTION average_cost_of_cinema(cinema_name TEXT)
    RETURNS NUMERIC
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN (
        SELECT avg(s.base_price * hsg.price_mod * stg.discount_mod)::NUMERIC(12, 2) AS cost
        FROM cinemas c
                 JOIN cinema_halls ch ON c.id = ch.cinema_id
                 JOIN hall_seat_groups hsg ON ch.id = hsg.cinema_hall_id
                 JOIN sessions s ON ch.id = s.cinema_hall_id
                 JOIN sold_ticket_groups stg ON hsg.id = stg.hall_seat_group_id AND s.id = stg.session_id
        WHERE cinema_name = c.name
    );
END
$$;

SELECT 'Дом Кино' AS name,
    average_cost_of_cinema('Дом Кино') AS cost_avg
UNION
SELECT 'VOKA CINEMA by Silver Screen' AS name,
    average_cost_of_cinema('VOKA CINEMA by Silver Screen') AS cost_avg
UNION
SELECT 'Сентябрь' AS name,
    average_cost_of_cinema('Сентябрь') AS cost_avg
UNION
SELECT 'МИР' AS name,
    average_cost_of_cinema('МИР') AS cost_avg;

DROP FUNCTION IF EXISTS cinema_name_upper_case;
CREATE OR REPLACE FUNCTION cinema_name_upper_case(in_cinema_id BIGINT)
    RETURNS TEXT
    LANGUAGE plpgsql
AS
$$
DECLARE
    cinema_name TEXT;
BEGIN
    cinema_name := (
        SELECT name
        FROM cinemas c
        WHERE c.id = in_cinema_id
        LIMIT 1
    );

    IF cinema_name IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN upper(cinema_name);
END
$$;

SELECT 16 AS cinema_id,
    cinema_name_upper_case(16) AS upper_name
UNION
SELECT 17 AS cinema_id,
    cinema_name_upper_case(17) AS upper_name
UNION
SELECT 18 AS cinema_id,
    cinema_name_upper_case(18) AS upper_name
UNION
SELECT 42 AS cinema_id,
    cinema_name_upper_case(42) AS upper_name
ORDER BY cinema_id;
