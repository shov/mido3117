CREATE TABLE IF NOT EXISTS log_events (
    id          BIGSERIAL PRIMARY KEY,
    object_name TEXT NOT NULL,
    event_name  TEXT NOT NULL,
    target_id   BIGINT,
    row_data    TEXT,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    user_name   TEXT NOT NULL
);

CREATE OR REPLACE FUNCTION log_posters_events()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
BEGIN
    IF (TG_OP = 'DELETE')
    THEN
        INSERT INTO log_events
            (object_name, event_name, target_id, row_data, created_at, user_name)
        VALUES (TG_ARGV[0], TG_OP, OLD.id, OLD::TEXT, now(), user);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT')
    THEN
        INSERT INTO log_events
            (object_name, event_name, target_id, row_data, created_at, user_name)
        VALUES (TG_ARGV[0], TG_OP, NEW.id, NEW::TEXT, now(), user);
        RETURN NEW;
    ELSIF (TG_OP = 'TRUNCATE')
    THEN
        INSERT INTO log_events
            (object_name, event_name, target_id, row_data, created_at, user_name)
        VALUES (TG_ARGV[0], TG_OP, NULL, NULL, now(), user);
        RETURN NULL;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS log_posters_events_row_trigger ON posters;
CREATE TRIGGER log_posters_events_row_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON posters
    FOR EACH ROW
EXECUTE PROCEDURE log_posters_events('posters');

DROP TRIGGER IF EXISTS log_posters_events_statement_trigger ON posters;
CREATE TRIGGER log_posters_events_statement_trigger
    AFTER TRUNCATE
    ON posters
    FOR STATEMENT
EXECUTE PROCEDURE log_posters_events('posters');

CALL actualize_posters_for_date(DATE '2021-01-10');
CALL actualize_posters_for_date(DATE '2021-01-09');

INSERT INTO posters (cinema_name, movie_name, hall_name, scheduled_at)
VALUES ('МИР', 'Унесенные призраками', 'Зал', DATE '2020-01-11 20:00:00');

UPDATE posters
SET hall_name = 'Уютный зал'
WHERE cinema_name = 'МИР';

DELETE
FROM posters
WHERE cinema_name = 'МИР';

CALL actualize_posters_for_date(DATE '2021-01-10');

CREATE OR REPLACE FUNCTION cinema_destructor()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF (TG_OP = 'DELETE' )
    THEN
        DELETE FROM posters WHERE cinema_name = OLD.name;
        RETURN OLD;
    ELSIF (TG_OP = 'TRUNCATE')
    THEN
        DELETE FROM posters WHERE cinema_name IN (SELECT name FROM cinemas);
        RETURN NULL;
    END IF;
    RETURN NULL;
END
$$;

DROP TRIGGER IF EXISTS cinema_destructor_row_trigger ON cinemas;
CREATE TRIGGER cinema_destructor_row_trigger
    BEFORE DELETE
    ON cinemas
    FOR EACH ROW
EXECUTE PROCEDURE cinema_destructor();

DROP TRIGGER IF EXISTS cinema_destructor_statement_trigger ON cinemas;
CREATE TRIGGER cinema_destructor_statement_trigger
    BEFORE TRUNCATE
    ON cinemas
    FOR STATEMENT
EXECUTE PROCEDURE cinema_destructor();

DELETE FROM cinemas WHERE name = 'Дом Кино';
TRUNCATE cinemas CASCADE;

SELECT 'cinemas' AS name, count(*) rows_count FROM cinemas
    UNION
SELECT 'posters' AS name, count(*) rows_count FROM posters
