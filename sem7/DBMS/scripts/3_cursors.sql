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

        ALTER TABLE movie_multiples DROP COLUMN  row_id;
    END
$$ LANGUAGE plpgsql;

SELECT *
FROM movie_multiples;

DROP TABLE IF EXISTS movie_multiples;
DROP TABLE IF EXISTS cinema_multiples_aev;
