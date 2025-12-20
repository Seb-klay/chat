
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
  CONSTRAINT FK_convMess FOREIGN KEY (convID)
    REFERENCES Conversations(convID)
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
  ('jean@test1.com', 'test1');
INSERT INTO users
  (email, userPassword)
VALUES
  ('jeanne@test2.com', 'test2');
INSERT INTO users
  (email, userPassword)
VALUES
  ('jeannette@test3.com', 'test3');