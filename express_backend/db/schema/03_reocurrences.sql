DROP TABLE IF EXISTS reocurrences CASCADE;

CREATE TABLE reocurrences(
    id SERIAL PRIMARY KEY NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    destination POINT NOT NULL,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE
);