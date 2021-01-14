CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS genres (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO genres
    (name)
VALUES ('action'),
    ('family'),
    ('comedy'),
    ('sci-fi'),
    ('drama'),
    ('historical')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS movies (
    id          BIGSERIAL PRIMARY KEY,
    genre_id    BIGINT REFERENCES genres(id) ON DELETE SET NULL,
    name        TEXT   NOT NULL,
    description TEXT   NOT NULL,
    year        INT    NOT NULL,
    run_time    BIGINT NOT NULL CHECK ( run_time > 0 ),
    UNIQUE (name, year)
);

CREATE TABLE IF NOT EXISTS movie_stats (
    id       BIGSERIAL PRIMARY KEY,
    movie_id BIGINT REFERENCES movies(id)
        ON DELETE CASCADE NOT NULL,

    name     TEXT         NOT NULL,
    value    NUMERIC(12, 2),
    UNIQUE (movie_id, name)
);

CREATE OR REPLACE
    PROCEDURE
    fill_movie(in_genre_name TEXT, in_name TEXT, in_description TEXT,
               in_year       INT, in_run_time BIGINT,
               in_rating     NUMERIC, in_audience NUMERIC,
               in_sold_world NUMERIC, in_sold_local NUMERIC)
    LANGUAGE plpgsql
AS
$$
DECLARE
    movie_ret_id BIGINT;
BEGIN
    INSERT INTO movies
        (genre_id, name, description, year, run_time)
    VALUES ((SELECT id FROM genres WHERE name = in_genre_name),
            in_name, in_description, in_year, in_run_time)
    ON CONFLICT DO NOTHING
    RETURNING id INTO movie_ret_id;

    IF movie_ret_id IS NULL
    THEN
        RETURN;
    END IF;

    INSERT INTO movie_stats (movie_id, name, value)
    VALUES (movie_ret_id, 'rating', in_rating),
        (movie_ret_id, 'audience', in_audience),
        (movie_ret_id, 'sold_world', in_sold_world),
        (movie_ret_id, 'sold_local', in_sold_local)
    ON CONFLICT DO NOTHING;
END
$$;

CALL fill_movie('action',
                'Скотт Пилигрим против всех',
                'Юный рок-музыкант готов сразиться с семью злобными бывшими xxxxxxx',
                2010, 112, 9.1, 16, 47664559, 1095677);

CALL fill_movie('drama',
                'Побег из Шоушенка',
                'Выдающаяся драма о силе таланта, важности дружбы, стремлении к свободе и Рите Хэйворт',
                1994, 142, 7.2, 16, 28418687, 28341469);

CALL fill_movie('drama',
                'Зеленая миля',
                'В тюрьме для смертников появляется заключенный с божественным даром',
                1999, 189, 9.1, 16, 286801374, 136801374);

CALL fill_movie('sci-fi',
                'Интерстеллар',
                'Эпос про задыхающуюся Землю, космические полеты и парадоксы времени',
                2014, 169, 8.6, 12, 677463813, 26192066);

CALL fill_movie('comedy',
                'Криминальное чтиво',
                'Фильм Квентина Тарантино',
                1994, 154, 8.6, 18, 213928762, 107928762);

CALL fill_movie('comedy',
                'Иван Васильевич меняет профессию',
                'Комедия Леонида Гайдая на все времена',
                1973, 88, 8.8, 6, NULL, NULL);

CREATE TABLE IF NOT EXISTS cinemas (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    address     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cinema_halls (
    id              BIGSERIAL PRIMARY KEY,
    cinema_id       BIGINT REFERENCES cinemas(id)
        ON DELETE CASCADE NOT NULL,

    name            TEXT,
    acoustic_system TEXT  NOT NULL,
    wide_screen     BOOLEAN DEFAULT (TRUE),
    UNIQUE (cinema_id, name)
);

CREATE TABLE IF NOT EXISTS hall_seat_groups (
    id             BIGSERIAL PRIMARY KEY,
    cinema_hall_id BIGINT REFERENCES cinema_halls(id)
        ON DELETE CASCADE NOT NULL,

    name           TEXT   NOT NULL,
    price_mod      REAL   NOT NULL CHECK ( price_mod > 0),
    amount         INT    NOT NULL CHECK ( amount >= 0 ),
    UNIQUE (cinema_hall_id, name)
);

DO
$$
    BEGIN
        CREATE TYPE HALL_SEAT_GROUPS_DATA AS (
            name      TEXT,
            price_mod REAL,
            amount    INT
        );
    EXCEPTION
        WHEN DUPLICATE_OBJECT THEN NULL;
    END
$$;

DO
$$
    BEGIN
        CREATE TYPE HALL_DATA AS (
            name            TEXT,
            acoustic_system TEXT,
            wide_screen     BOOLEAN,
            seat_groups     HALL_SEAT_GROUPS_DATA[]
        );
    EXCEPTION
        WHEN DUPLICATE_OBJECT THEN NULL;
    END
$$;

CREATE OR REPLACE
    PROCEDURE fill_cinema(in_c_name TEXT, in_c_description TEXT, in_c_address TEXT,
                          in_halls  HALL_DATA[])
    LANGUAGE plpgsql
AS
$$
DECLARE
    cinema_ret_id       BIGINT;
    cinema_hall_ret_id  BIGINT;

    hall_row            HALL_DATA;
    hall_seat_group_row HALL_SEAT_GROUPS_DATA;
BEGIN
    INSERT INTO cinemas (name, description, address)
    VALUES (in_c_name, in_c_description, in_c_address)
    ON CONFLICT DO NOTHING
    RETURNING id INTO cinema_ret_id;

    IF cinema_ret_id IS NULL
    THEN
        RETURN;
    END IF;

    FOREACH hall_row IN ARRAY in_halls
        LOOP
            INSERT INTO cinema_halls (cinema_id, name, acoustic_system, wide_screen)
            VALUES (cinema_ret_id,
                    hall_row.name,
                    hall_row.acoustic_system,
                    hall_row.wide_screen)
            ON CONFLICT DO NOTHING
            RETURNING id INTO cinema_hall_ret_id;

            IF cinema_hall_ret_id IS NULL
            THEN
                CONTINUE;
            END IF;

            FOREACH hall_seat_group_row IN ARRAY hall_row.seat_groups
                LOOP
                    INSERT INTO hall_seat_groups (cinema_hall_id, name, price_mod, amount)
                    VALUES (cinema_hall_ret_id,
                            hall_seat_group_row.name,
                            hall_seat_group_row.price_mod,
                            hall_seat_group_row.amount)
                    ON CONFLICT DO NOTHING;
                END LOOP;
        END LOOP;
END
$$;

CALL fill_cinema(
        'Сентябрь',
        'ПН–ВС 10:00—22:00 +375 17 3999426',
        'г. Минск, пр-т Независимости, 73',
        ARRAY [
            ROW ('Кинозал', 'DOLBY 3D', TRUE, ARRAY [
                ROW ('Партер', 1.0, 600),
                ROW ('Амфитеатр', 1.1, 500),
                ROW ('Бельэтаж', 0.8, 80)
                ]::HALL_SEAT_GROUPS_DATA[]
                )
            ]::HALL_DATA[]
    );

CALL fill_cinema(
        'Дом Кино',
        'ПН–ВС 10:00—22:00 +375 17 2723526',
        'г. Минск, ул. Толбухина, 18',
        ARRAY [
            ROW ('Киноконцертный зал', 'Stereo', TRUE, ARRAY [
                ROW ('Обычное', 1.0, 558),
                ROW ('VIP', 1.1, 26)
                ]::HALL_SEAT_GROUPS_DATA[]
                )
            ]::HALL_DATA[]
    );

CALL fill_cinema(
        'VOKA CINEMA by Silver Screen',
        '+375 29 3881388 ПН–ЧТ 10:00—24:00 ПТ–СБ 10:00—24:30 ВС 10:00—24:00',
        'г. Минск, ул. Петра Мстиславца, 11',
        ARRAY [
            ROW ('№1', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('Обычное', 1.0, 99),
                ROW ('Диван', 1.5, 12)
                ]::HALL_SEAT_GROUPS_DATA[]
                ),
            ROW ('№2', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('VIP', 1.8, 63)
                ]::HALL_SEAT_GROUPS_DATA[]
                ),
            ROW ('№3', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('Обычное', 1.0, 198)
                ]::HALL_SEAT_GROUPS_DATA[]
                ),
            ROW ('№4', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('LUX', 2.0, 48)
                ]::HALL_SEAT_GROUPS_DATA[]
                ),
            ROW ('№5', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('Обычное', 1.0, 148),
                ROW ('Диван', 1.5, 12)
                ]::HALL_SEAT_GROUPS_DATA[]
                ),
            ROW ('№6', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('VIP', 1.8, 68)
                ]::HALL_SEAT_GROUPS_DATA[]
                ),
            ROW ('№7', 'Dolby Atmos', TRUE, ARRAY [
                ROW ('Обычное', 1.0, 140),
                ROW ('Диван', 1.5, 12)
                ]::HALL_SEAT_GROUPS_DATA[]
                )
            ]::HALL_DATA[]
    );

CREATE TABLE IF NOT EXISTS sessions (
    id             BIGSERIAL PRIMARY KEY,
    cinema_hall_id BIGINT REFERENCES cinema_halls(id)
        ON DELETE CASCADE                      NOT NULL,

    movie_id       BIGINT REFERENCES movies(id)
        ON DELETE CASCADE                      NOT NULL,

    scheduled_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    base_price     NUMERIC(12, 2)              NOT NULL CHECK ( base_price > 0 )
);

CREATE UNIQUE INDEX
    IF NOT EXISTS
    sessions_hall_schedule_unique ON sessions(
                                              cinema_hall_id,
                                              date_trunc('hour', scheduled_at)
    );

CREATE TABLE IF NOT EXISTS sold_ticket_groups (
    id                 BIGSERIAL PRIMARY KEY,
    hall_seat_group_id BIGINT REFERENCES hall_seat_groups(id) ON DELETE SET NULL,
    session_id         BIGINT REFERENCES sessions(id) ON DELETE SET NULL,
    discount_mod       REAL   NOT NULL CHECK ( discount_mod > 0 ),
    amount             INT    NOT NULL CHECK ( amount > 0 )
);

CREATE OR REPLACE FUNCTION validate_sold_ticket_group()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
DECLARE
    free_seats INT;
    took_seats INT;
BEGIN
    IF NEW.hall_seat_group_id IS NOT NULL
        AND NOT EXISTS(SELECT * FROM hall_seat_groups WHERE id = NEW.hall_seat_group_id)
    THEN
        RAISE EXCEPTION 'To have sold tickets for a seat group it must exist!';
    END IF;
    IF NEW.session_id IS NOT NULL
        AND NOT EXISTS(SELECT * FROM sessions WHERE id = NEW.session_id)
    THEN
        RAISE EXCEPTION 'To have sold tickets for a session it must exist!';
    END IF;

    IF NEW.hall_seat_group_id IS NOT NULL AND NEW.session_id IS NOT NULL
    THEN
        free_seats := (SELECT amount FROM hall_seat_groups WHERE id = NEW.hall_seat_group_id);
        took_seats := (
            SELECT sum(amount)
            FROM sold_ticket_groups e
            WHERE e.session_id = NEW.session_id AND e.hall_seat_group_id = NEW.hall_seat_group_id
            AND e.id <> NEW.id
        );

        IF took_seats IS NOT NULL AND NEW.amount > free_seats - took_seats
        THEN
            RAISE EXCEPTION 'Not enough free seats!';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_sold_ticket_group_trigger ON sold_ticket_groups;
CREATE TRIGGER validate_sold_ticket_group_trigger
    BEFORE INSERT OR UPDATE
    ON sold_ticket_groups
    FOR EACH ROW
EXECUTE PROCEDURE validate_sold_ticket_group();


CREATE OR REPLACE PROCEDURE fill_session(in_movie_name   TEXT,
                                         in_cinema_name  TEXT,
                                         in_hall_name    TEXT,
                                         in_scheduled_at TIMESTAMP WITHOUT TIME ZONE,
                                         in_base_price   NUMERIC,
                                         in_buy_tickets  INT)
    LANGUAGE plpgsql
AS
$$
DECLARE
    session_ret_id  BIGINT;
    target_movie_id BIGINT;
    target_hall_id  BIGINT;
    hall_group_row  RECORD;
    curr_audience   NUMERIC;
BEGIN
    target_movie_id := (SELECT id FROM movies WHERE name = in_movie_name);
    IF target_movie_id IS NULL
    THEN
        RAISE EXCEPTION 'Unknown movie!';
    END IF;

    target_hall_id := (
        SELECT ch.id
        FROM cinema_halls ch
                 JOIN cinemas c ON c.id = ch.cinema_id
        WHERE c.name = in_cinema_name AND ch.name = in_hall_name
    );

    IF target_hall_id IS NULL
    THEN
        RAISE EXCEPTION 'Unknown hall or belongs not to the given cinema!';
    END IF;

    INSERT INTO sessions (cinema_hall_id, movie_id, scheduled_at, base_price)
    VALUES (target_hall_id, target_movie_id, in_scheduled_at, in_base_price)
    ON CONFLICT DO NOTHING
    RETURNING id INTO session_ret_id;

    IF session_ret_id IS NULL
    THEN
        RETURN;
    END IF;

    FOR hall_group_row IN
        SELECT * FROM hall_seat_groups g WHERE g.cinema_hall_id = target_hall_id
        LOOP
            INSERT INTO sold_ticket_groups (hall_seat_group_id, session_id, discount_mod, amount)
            VALUES (hall_group_row.id, session_ret_id, 1, in_buy_tickets)
            ON CONFLICT DO NOTHING;

            curr_audience := (
                SELECT value
                FROM movie_stats s
                WHERE s.movie_id = target_movie_id AND s.name = 'audience'
            );

            IF curr_audience IS NOT NULL AND curr_audience < 18
            THEN
                INSERT INTO sold_ticket_groups (hall_seat_group_id, session_id, discount_mod, amount)
                VALUES (hall_group_row.id, session_ret_id, 0.5, in_buy_tickets)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
END
$$;

CALL fill_session(
        'Побег из Шоушенка',
        'Сентябрь',
        'Кинозал',
        TIMESTAMP '2021-01-09 13:00:00',
        5.0,
        10
    );

CALL fill_session(
        'Скотт Пилигрим против всех',
        'Сентябрь',
        'Кинозал',
        TIMESTAMP '2021-01-09 15:00:00',
        5.0,
        10
    );

CALL fill_session(
        'Скотт Пилигрим против всех',
        'Дом Кино',
        'Киноконцертный зал',
        TIMESTAMP '2021-01-09 15:00:00',
        4.5,
        10
    );

CALL fill_session(
        'Криминальное чтиво',
        'VOKA CINEMA by Silver Screen',
        '№1',
        TIMESTAMP '2021-01-10 21:00:00',
        6,
        30
    );

CALL fill_session(
        'Иван Васильевич меняет профессию',
        'VOKA CINEMA by Silver Screen',
        '№2',
        TIMESTAMP '2021-01-10 21:00:00',
        6,
        30
    );

CALL fill_session(
        'Интерстеллар',
        'VOKA CINEMA by Silver Screen',
        '№3',
        TIMESTAMP '2021-01-10 21:00:00',
        6,
        30
    );


CALL fill_session(
        'Зеленая миля',
        'VOKA CINEMA by Silver Screen',
        '№4',
        TIMESTAMP '2021-01-10 21:00:00',
        6,
        3
    );
