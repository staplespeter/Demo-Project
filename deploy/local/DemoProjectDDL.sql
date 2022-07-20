USE DemoProject;

CREATE TABLE IF NOT EXISTS User (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(256) NOT NULL UNIQUE,
  PasswordHash CHAR(44) NOT NULL CHECK (length(PasswordHash)=44),
  PasswordSalt CHAR(44) NOT NULL CHECK (length(PasswordSalt)=44),
  DateRegistered DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS UserSession (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Token VARCHAR(2048) NOT NULL,
  StartDate DATETIME NOT NULL,
  EndDate DATETIME,
  UserId INT REFERENCES User (Id) ON UPDATE CASCADE ON DELETE CASCADE
);
