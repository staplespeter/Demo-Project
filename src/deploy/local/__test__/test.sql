INSERT INTO DemoProject_test.User 
	(Email, PasswordHash, PasswordSalt, DateRegistered)
VALUES (
    'test@test.com',
    'testhashvaluethatis44charslong1234567890ABCD',
    'testsaltvaluethatis44charslong1234567890ABCD',
    current_timestamp);

SELECT * FROM DemoProject_test.User;
DELETE FROM DemoProject_test.User WHERE Id > 0
