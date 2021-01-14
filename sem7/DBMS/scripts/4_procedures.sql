CALL fill_movie('drama',
                'Бойцовский клуб',
                'Классика от Дэвида Финчера',
                1999, 139, 8.6, 18, 100853753, 334590);

CALL fill_session(
        'Бойцовский клуб',
        'VOKA CINEMA by Silver Screen',
        '№7',
        TIMESTAMP '2021-01-10 23:30:00',
        6,
        30
    );

CREATE TABLE IF NOT EXISTS posters (
    id           BIGSERIAL PRIMARY KEY,
    cinema_name  TEXT NOT NULL,
    movie_name   TEXT NOT NULL,
    hall_name    TEXT NOT NULL,
    scheduled_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX
    IF NOT EXISTS
    posters_movies_go_unique ON posters(
                                        cinema_name,
                                        hall_name,
                                        date_trunc('hour', scheduled_at)
    );


DROP PROCEDURE IF EXISTS actualize_posters_for_date;
CREATE OR REPLACE PROCEDURE actualize_posters_for_date(in_day DATE)
    LANGUAGE plpgsql
AS
$$
BEGIN
    TRUNCATE posters;

    INSERT INTO posters (cinema_name, movie_name, hall_name, scheduled_at)
    SELECT c.name cinema_name,
        m.name movie_name,
        ch.name hall_name,
        s.scheduled_at AS scheduled_at
    FROM sessions s
             JOIN movies m ON m.id = s.movie_id
             JOIN cinema_halls ch ON ch.id = s.cinema_hall_id
             JOIN cinemas c ON c.id = ch.cinema_id
    WHERE date_trunc('day', s.scheduled_at) = date_trunc('day', in_day)
    ORDER BY s.scheduled_at;
END
$$;

CALL actualize_posters_for_date(DATE '2021-01-10');

SELECT * FROM posters;
