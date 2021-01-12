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
    name     TEXT           NOT NULL,
    value    NUMERIC(12, 2),
    UNIQUE (movie_id, name)
);

INSERT INTO movies
    (genre_id, name, description, year, run_time)
VALUES ((SELECT id FROM genres WHERE name = 'action'),
        'Скотт Пилигрим против всех',
        'Юный рок-музыкант готов сразиться с семью злобными бывшими xxxxxxx',
        2010,
        112),
((SELECT id FROM genres WHERE name = 'drama'),
 'Побег из Шоушенка',
 'Выдающаяся драма о силе таланта, важности дружбы, стремлении к свободе и Рите Хэйворт',
 1994,
 142),
((SELECT id FROM genres WHERE name = 'drama'),
 'Зеленая миля',
 'В тюрьме для смертников появляется заключенный с божественным даром',
 1999,
 189),
((SELECT id FROM genres WHERE name = 'sci-fi'),
 'Интерстеллар',
 'Эпос про задыхающуюся Землю, космические полеты и парадоксы времени',
 2014,
 169),
((SELECT id FROM genres WHERE name = 'comedy'),
 'Криминальное чтиво',
 'Фильм Квентина Тарантино',
 1994,
 154),
((SELECT id FROM genres WHERE name = 'comedy'),
 'Иван Васильевич меняет профессию',
 'Комедия Леонида Гайдая на все времена',
 1973,
 88)
ON CONFLICT DO NOTHING;


INSERT INTO movie_stats (movie_id, name, value)
VALUES ((SELECT id FROM movies WHERE name = 'Скотт Пилигрим против всех' AND year = 2010),
        'rating', 9.1),
((SELECT id FROM movies WHERE name = 'Скотт Пилигрим против всех' AND year = 2010),
 'audience', 16),
((SELECT id FROM movies WHERE name = 'Скотт Пилигрим против всех' AND year = 2010),
 'sold_world', 47664559),
((SELECT id FROM movies WHERE name = 'Скотт Пилигрим против всех' AND year = 2010),
 'sold_local', 1095677),

((SELECT id FROM movies WHERE name = 'Побег из Шоушенка' AND year = 1994),
 'rating', 7.2),
((SELECT id FROM movies WHERE name = 'Побег из Шоушенка' AND year = 1994),
 'audience', 16),
((SELECT id FROM movies WHERE name = 'Побег из Шоушенка' AND year = 1994),
 'sold_world', 28418687),
((SELECT id FROM movies WHERE name = 'Побег из Шоушенка' AND year = 1994),
 'sold_local', 28341469),

((SELECT id FROM movies WHERE name = 'Зеленая миля' AND year = 1999),
 'rating', 9.1),
((SELECT id FROM movies WHERE name = 'Зеленая миля' AND year = 1999),
 'audience', 16),
((SELECT id FROM movies WHERE name = 'Зеленая миля' AND year = 1999),
 'sold_world', 286801374),
((SELECT id FROM movies WHERE name = 'Зеленая миля' AND year = 1999),
 'sold_local', 136801374),

((SELECT id FROM movies WHERE name = 'Интерстеллар' AND year = 2014),
 'rating', 8.6),
((SELECT id FROM movies WHERE name = 'Интерстеллар' AND year = 2014),
 'audience', 12),
((SELECT id FROM movies WHERE name = 'Интерстеллар' AND year = 2014),
 'sold_world', 677463813),
((SELECT id FROM movies WHERE name = 'Интерстеллар' AND year = 2014),
 'sold_local', 26192066),

((SELECT id FROM movies WHERE name = 'Криминальное чтиво' AND year = 1994),
 'rating', 8.6),
((SELECT id FROM movies WHERE name = 'Криминальное чтиво' AND year = 1994),
 'audience', 18),
((SELECT id FROM movies WHERE name = 'Криминальное чтиво' AND year = 1994),
 'sold_world', 213928762),
((SELECT id FROM movies WHERE name = 'Криминальное чтиво' AND year = 1994),
 'sold_local', 107928762),

((SELECT id FROM movies WHERE name = 'Иван Васильевич меняет профессию' AND year = 1973),
 'rating', 8.8),
((SELECT id FROM movies WHERE name = 'Иван Васильевич меняет профессию' AND year = 1973),
 'audience', 6),
((SELECT id FROM movies WHERE name = 'Иван Васильевич меняет профессию' AND year = 1973),
 'sold_world', NULL),
((SELECT id FROM movies WHERE name = 'Иван Васильевич меняет профессию' AND year = 1973),
 'sold_local', NULL)
ON CONFLICT DO NOTHING;


