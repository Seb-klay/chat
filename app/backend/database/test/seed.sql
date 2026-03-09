-- Create ONE database user for your entire application
CREATE USER regular_user
WITH PASSWORD 'regular_user';
GRANT CONNECT ON DATABASE chat_db TO regular_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO regular_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO regular_user;

WITH inserted_users AS (
  INSERT INTO users (email, userpassword)
  VALUES 
    ('test@test.com', '$2b$16$UOw3/3Nt22eICQ4SVCAFpOiNIfU9LWA1wBOc9cqS/bWh3xovCb4y2'),
    ('test2@test.com', '$2b$16$UOw3/3Nt22eICQ4SVCAFpOiNIfU9LWA1wBOc9cqS/bWh3xovCb4y2'),
    ('test3@test.com', '$2b$16$UOw3/3Nt22eICQ4SVCAFpOiNIfU9LWA1wBOc9cqS/bWh3xovCb4y2')
  RETURNING userid
)
INSERT INTO users_settings (userid, colortheme, defaultmodel)
SELECT userid, 'dark', '{"id": "1", "model_name": "llama3.2:3b"}' FROM inserted_users;