USE DemoProject;

#account for direct test runner access
CREATE USER 'TestRunner' IDENTIFIED BY 'TestRunner';
GRANT 'Application' TO 'TestRunner';
SET DEFAULT ROLE ALL TO 'TestRunner';