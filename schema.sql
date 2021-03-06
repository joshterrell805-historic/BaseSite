DROP DATABASE IF EXISTS joshterrell_com;
CREATE DATABASE joshterrell_com;
USE joshterrell_com;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

INSERT INTO users (email) VALUES ('joshterrell805@gmail.com');

CREATE TABLE sessions (
  user_id INT UNSIGNED NOT NULL,
  id VARCHAR(255) NOT NULL UNIQUE,
  last_active_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE docs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  publish_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edit_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  title VARCHAR(255) NOT NULL UNIQUE,
  body TEXT NOT NULL,
  category VARCHAR(16) DEFAULT NULL,
  private BOOLEAN NOT NULL DEFAULT TRUE,
  hash VARCHAR(32) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);
