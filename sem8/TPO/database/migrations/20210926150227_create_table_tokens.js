exports.up = function (knex) {
  // language=sql
  return knex.raw(`
      CREATE TABLE tokens
      (
          id         BIGSERIAL PRIMARY KEY                                            NOT NULL,
          user_id    BIGINT REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
          content    TEXT                                                             NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE                                      NOT NULL DEFAULT (NOW())
      );

      CREATE INDEX tokens_user_id_idx ON tokens (user_id);
      CREATE INDEX tokens_content_idx ON tokens (content);
      CREATE INDEX tokens_created_at_idx ON tokens (created_at);
  `)
}

exports.down = function (knex) {
  // language=sql
  return knex.raw(`
      DROP TABLE tokens;
  `)
}
