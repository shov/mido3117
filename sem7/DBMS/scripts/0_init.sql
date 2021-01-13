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
    movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
    name     TEXT NOT NULL,
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
    cinema_id       BIGINT REFERENCES cinemas(id) ON DELETE CASCADE,
    name            TEXT,
    acoustic_system TEXT NOT NULL,
    wide_screen     BOOLEAN DEFAULT (TRUE)
);

CREATE TABLE IF NOT EXISTS hall_seat_groups (
    id             BIGSERIAL PRIMARY KEY,
    cinema_hall_id BIGINT REFERENCES cinema_halls(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    price_mod      REAL NOT NULL CHECK ( price_mod > 0),
    amount         INT  NOT NULL CHECK ( amount >= 0 )
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
