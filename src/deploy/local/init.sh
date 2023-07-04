#!/bin/bash

#Database
sudo dpkg -i mysql-apt-config_0.8.25-1_all.deb
sudo apt-get update
sudo apt-get install mysql-server
mysql_config_editor set --login-path=client --host=localhost --user=root --password
mysqladmin --login-path=client create DemoProject

mysql --login-path=client --database DemoProject < DemoProjectDDL.sql
mysql --login-path=client --database DemoProject < DemoProjectPrivileges.sql

#Node
