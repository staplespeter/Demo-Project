Feature: DDL

  As a database user
  I want to verify the schema
  So I can use the database without error

  Background: User table exists
    Given I have the User table

  Scenario: User table - OK
    When I insert a record with Email, PasswordHash, PasswordSalt and DateRegistered
    Then there is no error

  Scenario: User table - OK - No DateRegistered
    When I insert a record with Email, PasswordHash and PasswordSalt
    Then there is no error
    And DateRegistered is populated

  Scenario Outline: User table - errors
    When I insert a record with <Email>, <PasswordHash>, <PasswordSalt>, <DateRegistered>
    Then there is an error containing <ErrorText>

    Examples:
      | Description                            | Email         | PasswordHash                                  | PasswordSalt                                  | DateRegistered      | ErrorText                                               |
      | Email too long - 257 characters        | toolong       | testhashvaluethatis44charslong1234567890ABCD  | testsaltvaluethatis44charslong1234567890ABCD  | 2000-01-02 12:34:56 | Error: Data too long for column 'Email' at row 1        |
      | PasswordHash too long - 45 characters  | test@test.com | testhashvaluethatis45charslong1234567890ABCDE | testsaltvaluethatis44charslong1234567890ABCD  | 2000-01-02 12:34:56 | Error: Data too long for column 'PasswordHash' at row 1 |
      | PasswordHash too short - 43 characters | test@test.com | testhashvaluethatis43charslong1234567890ABC   | testsaltvaluethatis44charslong1234567890ABCD  | 2000-01-02 12:34:56 | Error: Check constraint 'User_chk_1' is violated.       |
      | PasswordSalt too long - 45 characters  | test@test.com | testhashvaluethatis44charslong1234567890ABCD  | testsaltvaluethatis45charslong1234567890ABCDE | 2000-01-02 12:34:56 | Error: Data too long for column 'PasswordSalt' at row 1 |
      | PasswordSalt too short - 43 characters | test@test.com | testhashvaluethatis44charslong1234567890ABCD  | testsaltvaluethatis43charslong1234567890ABC   | 2000-01-02 12:34:56 | Error: Check constraint 'User_chk_2' is violated.       |
