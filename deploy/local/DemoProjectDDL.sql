CREATE TABLE IF NOT EXISTS User (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(256) NOT NULL UNIQUE,
  #CHAR columns are supposed to pad when either
  #1 - the server mode PAD_CHAR_TO_FULL_LENGTH is set.  It is off by default
  #2 - the collation specifies PAD SPACES.
  #	   The default character set is "utf8mb4" and collation "utf8mb4_0900_ai_ci".
  #    This collation specifies no spaces.
  #However when using the XDevAPI Node.js connector INSERTS into these CHAR columns
  #followed by a read return the 44 chars plus padding as if the string was inserted as ascii bytes
  #into a column of 44 UTF8 characters worth of bytes.  Not sure if it is the XDevAPI connector
  #or some MySQL behaviour not understood.
  #Setting the collation of these columns as ascii to force correct storage/retrieval.
  PasswordHash CHAR(44) NOT NULL COLLATE 'ascii_general_ci' CHECK (length(PasswordHash)=44),
  PasswordSalt CHAR(44) NOT NULL COLLATE 'ascii_general_ci' CHECK (length(PasswordSalt)=44),
  DateRegistered DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserSession (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  StartDate DATETIME NOT NULL,
  EndDate DATETIME,
  UserId INT REFERENCES User (Id) ON UPDATE CASCADE ON DELETE CASCADE
);

