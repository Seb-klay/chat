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