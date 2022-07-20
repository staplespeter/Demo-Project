Feature: DDL

As a database user
I want to verify the schema
So I can use the database without error

Scenario: User table - OK
Given I have the User table
When I insert an Email, PasswordHash, PasswordSalt and DateRegistered
Then there is no error

Scenario: User table - No Email
Given I have the User table
When I insert a record with no Email
Then there is an error containing "??"

Scenario: User table - Email too long
Given I have the User table
When I insert an Email of 257 characters
Then there is an error containing "??"

Scenario: User table - No PasswordHash
Given I have the User table
When I insert a record with no PasswordHash
Then there is an error containing "??"

Scenario: User table - PasswordHash too long
Given I have the User table
When I insert an PasswordHash of 45 characters
Then there is an error containing "??"

Scenario: User table - PasswordHash too short
Given I have the User table
When I insert an PasswordHash of 43 characters
Then there is an error containing "??"

Scenario: User table - No PasswordSalt
Given I have the User table
When I insert a record with no PasswordSalt
Then there is an error containing "??"

Scenario: User table - PasswordSalt too long
Given I have the User table
When I insert an PasswordSalt of 45 characters
Then there is an error containing "??"

Scenario: User table - PasswordSalt too short
Given I have the User table
When I insert an PasswordSalt of 43 characters
Then there is an error containing "??"

Scenario: User table - No DateRegistered
Given I have the User table
When I insert a record with no DateRegistered
Then there is an error containing "??"

