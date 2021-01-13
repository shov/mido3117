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

