CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id text PRIMARY KEY,
  user_email text NOT NULL REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  user_email text NOT NULL REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id text PRIMARY KEY,
  user_email text NOT NULL REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  trip_id text REFERENCES trips(id) ON DELETE SET NULL,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS companions (
  id text PRIMARY KEY,
  trip_id text NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id text PRIMARY KEY,
  user_email text NOT NULL REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  id text PRIMARY KEY,
  user_email text NOT NULL REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS planned_payments (
  id text PRIMARY KEY,
  user_email text NOT NULL REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  data jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS trips_user_email_idx ON trips(user_email);
CREATE INDEX IF NOT EXISTS payments_user_email_idx ON payments(user_email);
CREATE INDEX IF NOT EXISTS reservations_user_email_idx ON reservations(user_email);
CREATE INDEX IF NOT EXISTS reviews_user_email_idx ON reviews(user_email);
CREATE INDEX IF NOT EXISTS favorites_user_email_idx ON favorites(user_email);
CREATE INDEX IF NOT EXISTS planned_payments_user_email_idx ON planned_payments(user_email);
