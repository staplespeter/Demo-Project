CREATE ROLE 'Application';
GRANT INSERT,SELECT,UPDATE,DELETE ON DemoProject.User TO 'Application';
GRANT INSERT,SELECT,UPDATE,DELETE ON DemoProject.UserSession TO 'Application';

#account for the server
CREATE USER 'ServerApplication' IDENTIFIED BY 'ServerApplication';
GRANT 'Application' TO 'ServerApplication';
SET DEFAULT ROLE ALL TO 'ServerApplication';

#account for direct test runner access
CREATE USER 'TestRunner' IDENTIFIED BY 'TestRunner';
GRANT 'Application' TO 'TestRunner';
SET DEFAULT ROLE ALL TO 'TestRunner';