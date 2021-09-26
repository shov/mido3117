exports.up = function (knex) {
  // language=sql
  return knex.raw(`
      CREATE TABLE users
      (
          id         BIGSERIAL PRIMARY KEY                         NOT NULL,
          login      VARCHAR(255) UNIQUE CHECK (length(login) > 4) NOT NULL,
          hash       VARCHAR(64)                                   NOT NULL,
          details    JSONB                                         NOT NULL DEFAULT ('{}'::jsonb),
          created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW())
      );

      CREATE
      INDEX users_details_idx ON users USING GIN (details);
      CREATE
      INDEX users_created_at_idx ON users(created_at);
  `)
}

exports.down = function (knex) {
  // language=sql
  return knex.raw(`
      DROP TABLE users;
  `)
}
