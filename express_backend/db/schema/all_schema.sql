DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
    id SERIAL PRIMARY KEY NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    home_location POINT NOT NULL
);

DROP TABLE IF EXISTS entries CASCADE;

CREATE TABLE entries(
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(255),
  is_outdoor BOOLEAN,
  created_at TIMESTAMP DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  user_id INTEGER REFERENCES entries(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS reocurrences CASCADE;

CREATE TABLE reocurrences(
    id SERIAL PRIMARY KEY NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    destination POINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS frequencies CASCADE;

CREATE TABLE frequencies(
  id SERIAL PRIMARY KEY NOT NULL,
  type_of VARCHAR NOT NULL,
  initial DATE,
  interval INTEGER,
  reocurrence_id INTEGER REFERENCES reocurrences(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS trips CASCADE;

CREATE TABLE trips(
    id SERIAL PRIMARY KEY NOT NULL,
    start_time DATE,
    end_time DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    destination POINT NOT NULL,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE items (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR,
  description VARCHAR
);

DROP TABLE IF EXISTS conditions CASCADE;

CREATE TABLE conditions (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR,
  description VARCHAR
);

DROP TABLE IF EXISTS item_condition CASCADE;

CREATE TABLE item_condition(
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  condition_id INTEGER REFERENCES conditions(id) ON DELETE CASCADE
);