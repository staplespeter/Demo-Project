CREATE ROLE 'Application';
GRANT INSERT,SELECT,UPDATE,DELETE ON DemoProject.User TO 'Application';
GRANT INSERT,SELECT,UPDATE,DELETE ON DemoProject.UserSession TO 'Application';
GRANT INSERT,SELECT,UPDATE,DELETE ON DemoProject_test.User TO 'Application';
GRANT INSERT,SELECT,UPDATE,DELETE ON DemoProject_test.UserSession TO 'Application';

CREATE USER 'ServerApplication' IDENTIFIED BY 'ServerApplication';
GRANT 'Application' TO 'ServerApplication';
SET DEFAULT ROLE ALL TO 'ServerApplication';

