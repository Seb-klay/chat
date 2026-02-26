
CREATE TABLE Users
(
  userID UUID PRIMARY KEY DEFAULT uuidv7(),
  email VARCHAR(100) UNIQUE NOT NULL,
  userPassword VARCHAR(100) NOT NULL,
  userRole VARCHAR(50) NOT NULL DEFAULT 'regular_user',
  isDeleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE Conversations
(
  convID UUID PRIMARY KEY DEFAULT uuidv7(),
  title VARCHAR(100),
  userID UUID,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP,
  isDeleted BOOLEAN NOT NULL,
  defaultModel TEXT,
  CONSTRAINT FK_UserConversation FOREIGN KEY (userID)
    REFERENCES Users(userID)
);

CREATE TABLE Messages
(
  messID UUID PRIMARY KEY DEFAULT uuidv7(),
  roleSender VARCHAR(50),
  model VARCHAR(50),
  content TEXT,
  thinking TEXT,
  convID UUID,
  createdAt TIMESTAMP NOT NULL,
  CONSTRAINT FK_convMess FOREIGN KEY (convID)
    REFERENCES Conversations(convID)
);

CREATE TABLE Files
(
  fileID UUID PRIMARY KEY DEFAULT uuidv7(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  size INTEGER,
  path VARCHAR(255) NOT NULL DEFAULT '/',
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP,
  isDirectory BOOLEAN,
  isDeleted BOOLEAN NOT NULL DEFAULT false,
  messID UUID,
  userID UUID,
  CONSTRAINT FK_messFile FOREIGN KEY (messID)
    REFERENCES Messages(messID),
  CONSTRAINT FK_userFile FOREIGN KEY (userID)
    REFERENCES Users(userID)
);

CREATE TABLE Email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  email VARCHAR(255) UNIQUE NOT NULL,
  code CHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  UNIQUE(email, code)
);

CREATE TABLE Users_analytics
(
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  userID UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  total_duration BIGINT, 
  load_duration BIGINT,
  prompt_eval_count BIGINT,
  prompt_eval_duration BIGINT,
  eval_count BIGINT,
  eval_duration BIGINT,
  defaultModel TEXT,
  CONSTRAINT FK_UserAnalytics FOREIGN KEY (userID)
    REFERENCES Users(userID)
);

CREATE TABLE Users_settings
(
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  userID UUID,
  colorTheme TEXT DEFAULT 'dark',
  defaultModel TEXT,
  CONSTRAINT FK_UserSettings FOREIGN KEY (userID)
    REFERENCES Users(userID)
);

-- Create ONE database user for your entire application
CREATE USER regular_user
WITH PASSWORD 'regular_user';
GRANT CONNECT ON DATABASE chat_db TO regular_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO regular_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO regular_user;