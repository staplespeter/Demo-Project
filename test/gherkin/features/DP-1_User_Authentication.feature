Feature: User Authentication

As a user
I want to authenticate
So I can use the website


Scenario: Sign Up
Given I am not registered
And I complete the Sign Up form
When I submit the Sign Up form
Then the Sign Up page displays successful registration
And the User Account page is displayed

Scenario: Sign In
Given I am registered
And no valid session exists
And I complete the Sign In form
When I submit the Sign In form
Then the User Account page is displayed

Scenario: Existing Session
Given I am registered
And a valid session exists
When load the Sign In page
Then the User Account page is displayed

Scenario: Sign Up Error - Invalid Email
Given I am not registered
And I complete the Sign Up form with an invalid email
When I submit the Sign Up form
Then the Sign Up page displays an error message - invalid email

Scenario: Sign Up Error - Password too short
Given I am not registered
And I complete the Sign Up form with a short password
When I submit the Sign Up form
Then the Sign Up page displays an error message - password too short

Scenario: Sign Up Error - Passwords do not match
Given I am not registered
And I complete the Sign Up form with mismatching passwords
When I submit the Sign Up form
Then the Sign Up page displays an error message - passwords do not match

Scenario: Sign In Error
Given I am registered
And I complete the Sign Up form with incorrect credentials
When I submit the Sign Up form
Then the Sign In page displays an error message
