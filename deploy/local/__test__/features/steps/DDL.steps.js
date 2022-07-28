//import { defineFeature, loadFeature } from "jest-cucumber";
//import mysqlx from "'../../node_modules/@mysql/xdevapi/index.js';"; 
const { defineFeature, loadFeature } = require('jest-cucumber');
const mysqlx = require('@mysql/xdevapi');

const feature = loadFeature("./deploy/local/__test__/features/DDL.feature");
const mysqlxConfig = { host: 'localhost', port: 33060, user: 'TestRunner', password: 'TestRunner', schema: 'DemoProject' };

defineFeature(feature, test => {
    var session = null;
    var userTable = null;
    var error = null;


    beforeEach(() => {
        error = null;
    });

    beforeAll(()=> {
        return mysqlx.getSession(mysqlxConfig)
            .then(s => {
                session = s;
                userTable = session.getDefaultSchema().getTable('User');
            });
    });

    afterEach(() => {
        if (session) {
            if (userTable) {
                return userTable.delete().where('Email = "test@test.com"').execute();
            }
        }
    })

    afterAll(() => {
        if (session) {
            return session.close();
        }
    })

    const givenIHaveTheUserTable = (given) => {
        given('I have the User table', () => {
            expect(userTable).not.toBeNull();
        });
    }

    test('User table - OK', ({given, when, then}) => {        
        error = null;

        givenIHaveTheUserTable(given);

        when('I insert a record with Email, PasswordHash, PasswordSalt and DateRegistered', () => {
            return userTable.insert(['Email', 'PasswordHash', 'PasswordSalt', 'DateRegistered'])
                .values([
                    'test@test.com',
                    'testhashvaluethatis44charslong1234567890ABCD',
                    'testsaltvaluethatis44charslong1234567890ABCD',
                    '2000-01-02 12:34:56'
                ])
                .execute()
                .catch( err => {
                    error = err;
                });
        });

        then('there is no error', () => {
            expect(error).toBeNull();
        });
    });

    test('User table - OK - No DateRegistered', ({given, when, then}) => {        
        error = null;

        givenIHaveTheUserTable(given);

        when('I insert a record with Email, PasswordHash and PasswordSalt', () => {
            return userTable.insert(['Email', 'PasswordHash', 'PasswordSalt'])
                .values([
                    'test@test.com',
                    'testhashvaluethatis44charslong1234567890ABCD',
                    'testsaltvaluethatis44charslong1234567890ABCD'
                ])
                .execute()
                .catch( err => {
                    error = err;
                });
        });

        then('there is no error', () => {
            expect(error).toBeNull();
        });

        then('DateRegistered is populated', () => {
            return userTable.select(['DateRegistered']).where('Email = "test@test.com"').execute()
                .then((res) => {
                    var row = res.fetchOne();
                    expect(row[0]).not.toBeNull();
                });
        })
    });

    test('User table - errors', ({given, when, then}) => {
        givenIHaveTheUserTable(given);

        when(/^I insert a record with (.*), (.*), (.*), (.*)$/, (email, passwordHash, passwordSalt, dateRegistered) => {
            if (email == 'toolong') {
                email = new Array(257).fill('x').toString();
            }

            return userTable.insert(['Email', 'PasswordHash', 'PasswordSalt', 'DateRegistered'])
            .values([
                email,
                passwordHash,
                passwordSalt,
                dateRegistered
            ])
            .execute()
            .catch( err => {
                error = err;
            });
        });

        then(/^there is an error containing (.*)$/, (errorText) => {
            expect(error.toString()).toEqual(errorText);
        });
    });
});