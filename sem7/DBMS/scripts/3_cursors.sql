CREATE EXTENSION IF NOT EXISTS tablefunc;

CALL fill_session(
        'Интерстеллар',
        'Сентябрь',
        'Кинозал',
        TIMESTAMP '2021-01-10 21:00:00',
        5,
        1
    );

CALL fill_session(
        'Интерстеллар',
        'Дом Кино',
        'Киноконцертный зал',
        TIMESTAMP '2021-01-10 21:00:00',
        4,
        1
    );

DO
$$
    DECLARE
        movie_probe CURSOR FOR
            SELECT m.name movie_name, count(c.id) cinema_count
            FROM movies m
                     JOIN sessions s ON m.id = s.movie_id
                     JOIN cinema_halls ch ON s.cinema_hall_id = ch.id
                     JOIN cinemas c ON ch.cinema_id = c.id
            GROUP BY m.name
            HAVING count(c.name) > 1
            ORDER BY count(c.name) DESC;
        movie_rec          RECORD;
        movie_columns      TEXT DEFAULT '';

        cinemas_probe CURSOR (cond_movie_name TEXT) FOR
            SELECT m.name movie_name, c.name cinema_name
            FROM movies m
                     JOIN sessions s ON m.id = s.movie_id
                     JOIN cinema_halls ch ON s.cinema_hall_id = ch.id
                     JOIN cinemas c ON ch.cinema_id = c.id
            WHERE cond_movie_name = m.name
            ORDER BY c.name;

        cinema_rec         RECORD;
        cinema_row_counter INT DEFAULT 0;
    BEGIN
        DROP TABLE IF EXISTS cinema_multiples_aev;
        CREATE TEMP TABLE cinema_multiples_aev (
            row_id      INT,
            movie_name  TEXT,
            cinema_name TEXT
        );

        OPEN movie_probe;
        LOOP
            FETCH movie_probe INTO movie_rec;
            EXIT WHEN NOT FOUND;

            OPEN cinemas_probe(movie_rec.movie_name);

            LOOP
                FETCH cinemas_probe INTO cinema_rec;
                EXIT WHEN NOT FOUND;
                cinema_row_counter := cinema_row_counter + 1;

                INSERT INTO cinema_multiples_aev (row_id, movie_name, cinema_name)
                VALUES (cinema_row_counter, cinema_rec.movie_name, cinema_rec.cinema_name);
            END LOOP;

            CLOSE cinemas_probe;
            cinema_row_counter := 0;

            movie_columns := movie_columns || ', "' || movie_rec.movie_name || '" TEXT';
        END LOOP;
        CLOSE movie_probe;

        movie_columns := substring(movie_columns FROM 2);

        DROP TABLE IF EXISTS movie_multiples;
        EXECUTE format('CREATE TEMP TABLE movie_multiples(row_id INT, %s)', movie_columns);

        EXECUTE format(E'
        INSERT INTO movie_multiples
        SELECT *
        FROM crosstab(\'select row_id, movie_name, cinema_name
                        from cinema_multiples_aev

                        order by 1,2\')
            AS cinema_multiples_aev(row_id INT, %s);
        ', movie_columns, movie_columns);

        ALTER TABLE movie_multiples
            DROP COLUMN row_id;
    END
$$ LANGUAGE plpgsql;

SELECT *
FROM movie_multiples;

DROP TABLE IF EXISTS movie_multiples;
DROP TABLE IF EXISTS cinema_multiples_aev;



DROP PROCEDURE IF EXISTS discounts_job_on_date;
CREATE OR REPLACE PROCEDURE discounts_job_on_date(in_search_day        DATE,
                                                  in_result_table_name TEXT)
    LANGUAGE plpgsql AS
$$
DECLARE
    discount_cursor SCROLL CURSOR (cond_date DATE) FOR
        SELECT c.name cinema_name,
            avg(stg.discount_mod) average_discount,
            sum(stg.amount) discounted_tickets_sold
        FROM sessions s
                 JOIN sold_ticket_groups stg ON s.id = stg.session_id
                 JOIN hall_seat_groups hsg ON hsg.id = stg.hall_seat_group_id
                 JOIN cinema_halls ch ON hsg.cinema_hall_id = ch.id
                 JOIN cinemas c ON ch.cinema_id = c.id
        WHERE stg.discount_mod < 1.0 AND DATE(scheduled_at) = cond_date
        GROUP BY c.name;

    ticket_cursor CURSOR          (cond_cinema TEXT, cond_date DATE) FOR
        SELECT stg.id stg_id
        FROM sessions s
                 JOIN sold_ticket_groups stg ON s.id = stg.session_id
                 JOIN hall_seat_groups hsg ON hsg.id = stg.hall_seat_group_id
                 JOIN cinema_halls ch ON hsg.cinema_hall_id = ch.id
                 JOIN cinemas c ON ch.cinema_id = c.id
        WHERE c.name = cond_cinema AND stg.discount_mod < 1.0 AND DATE(scheduled_at) = cond_date;

    discount_rec RECORD;
    ticket_rec   RECORD;
BEGIN
    EXECUTE format('DROP TABLE IF EXISTS %s', in_result_table_name);
    EXECUTE format('CREATE TEMP TABLE %s (
                            session_scheduled DATE,
                            status TEXT,
                            cinema_name TEXT,
                            discount NUMERIC(12,2),
                            tickets_amount INT
                        )', in_result_table_name);

    OPEN discount_cursor(in_search_day);
    LOOP
        FETCH discount_cursor INTO discount_rec;
        EXIT WHEN NOT FOUND;

        EXECUTE format(E'INSERT INTO %s (session_scheduled, status,
                                         cinema_name, discount, tickets_amount)
            VALUES (date \'%s\', \'%s\', \'%s\', %s, %s)',
                       in_result_table_name, in_search_day::TEXT, '[initial]',
                       discount_rec.cinema_name,
                       discount_rec.average_discount,
                       discount_rec.discounted_tickets_sold
            );

        OPEN ticket_cursor(discount_rec.cinema_name, in_search_day);

        LOOP
            FETCH ticket_cursor INTO ticket_rec;
            EXIT WHEN NOT FOUND;

            UPDATE sold_ticket_groups
            SET discount_mod =
                CASE
                    WHEN discount_rec.average_discount - 0.1 >= 0.1
                        THEN discount_rec.average_discount - 0.1
                    ELSE 0.1
                    END
            WHERE ticket_rec.stg_id = sold_ticket_groups.id;
        END LOOP;

        CLOSE ticket_cursor;

        MOVE BACKWARD FROM discount_cursor;
        FETCH discount_cursor INTO discount_rec;

        EXECUTE format(E'INSERT INTO %s (session_scheduled, status,
                                         cinema_name, discount, tickets_amount)
            VALUES (date \'%s\', \'%s\', \'%s\', %s, %s)',
                       in_result_table_name, in_search_day::TEXT, '[updated, existing cursor]',
                       discount_rec.cinema_name,
                       discount_rec.average_discount,
                       discount_rec.discounted_tickets_sold
            );
    END LOOP;
    CLOSE discount_cursor;

    OPEN discount_cursor(in_search_day);
    LOOP
        FETCH discount_cursor INTO discount_rec;
        EXIT WHEN NOT FOUND;

        EXECUTE format(E'INSERT INTO %s (session_scheduled, status,
                                         cinema_name, discount, tickets_amount)
            VALUES (date \'%s\', \'%s\', \'%s\', %s, %s)',
                       in_result_table_name, in_search_day::TEXT, '[updated, refreshed cursor]',
                       discount_rec.cinema_name,
                       discount_rec.average_discount,
                       discount_rec.discounted_tickets_sold
            );
    END LOOP;
    CLOSE discount_cursor;
END
$$;

CALL discounts_job_on_date(DATE '2021-01-10', 'result_table');
SELECT * FROM result_table;
DROP TABLE IF EXISTS result_table;

