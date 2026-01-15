
CREATE TABLE Users
(
  userID SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  userPassword VARCHAR(100) NOT NULL,
  userRole VARCHAR(50) NOT NULL DEFAULT 'regular_user'
);

CREATE TABLE Conversations
(
  convID SERIAL PRIMARY KEY,
  title VARCHAR(100),
  userID int,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP,
  isDeleted BOOLEAN NOT NULL,
  CONSTRAINT FK_UserConversation FOREIGN KEY (userID)
    REFERENCES Users(userID)
);

CREATE TABLE Messages
(
  messID SERIAL PRIMARY KEY,
  roleSender VARCHAR(50),
  model VARCHAR(50),
  textMessage TEXT,
  convID int,
  createdAt TIMESTAMP NOT NULL,
  CONSTRAINT FK_convMess FOREIGN KEY (convID)
    REFERENCES Conversations(convID)
);

CREATE TABLE email_verification_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  code CHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  UNIQUE(email, code)
);

-- Create ONE database user for your entire application
CREATE USER regular_user
WITH PASSWORD 'regular_user';
GRANT CONNECT ON DATABASE chat_db TO regular_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO regular_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO regular_user;


INSERT INTO users
  (email, userPassword)
VALUES
  ('test@test.com', '$2b$16$UOw3/3Nt22eICQ4SVCAFpOiNIfU9LWA1wBOc9cqS/bWh3xovCb4y2');
INSERT INTO users
  (email, userPassword)
VALUES
  ('test2@test.com', '$2b$16$UOw3/3Nt22eICQ4SVCAFpOiNIfU9LWA1wBOc9cqS/bWh3xovCb4y2');
INSERT INTO users
  (email, userPassword)
VALUES
  ('test3@test.com', '$2b$16$UOw3/3Nt22eICQ4SVCAFpOiNIfU9LWA1wBOc9cqS/bWh3xovCb4y2');