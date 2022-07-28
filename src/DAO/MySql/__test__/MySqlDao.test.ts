import MySqlDaoFactory from "../MySqlDaoFactory";
const mysqlx = require('@mysql/xdevapi');
import { mysqlxTestConfig } from '../../__test__/appdata';

describe("MySQL DAO tests", () => {
    let session: any = null;
    let userTable: any = null;

    let factory: any;
    let userDao: any;

    beforeAll(() => {
        return mysqlx.getSession(mysqlxTestConfig)
            .then((s: any) => {
                session = s;
                userTable = session.getDefaultSchema().getTable('User');
                return userTable.insert( ['Email', 'PasswordHash', 'PasswordSalt'])
                    .values(['test1@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
                    .values(['test2@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
                    .values(['test3@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
                    .values(['test4@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
                    .execute();
            })
            .then(() => {
                factory = new MySqlDaoFactory(mysqlxTestConfig);
            });
    });

    beforeEach(async () => {
        userDao = await factory.getDao('User');
    });

    afterAll(() => {
        if (session) {
            (async () => {
                if (userTable) {
                    return userTable.delete()
                        .where("Email LIKE '%@test.com'")
                        .execute();
                }
            })()
            .then(() => {
                return session.close();
            })
        }
    })

    it("can load a dataset one row at a time using next()", async () => {
        let count = await userDao.load(null, null, false);
        expect(userDao.fieldCount).toEqual(5);
        expect(userDao.getField(0)).toEqual('Id');
        expect(userDao.getField(1)).toEqual('Email');
        expect(userDao.getField(2)).toEqual('PasswordHash');
        expect(userDao.getField(3)).toEqual('PasswordSalt');
        expect(userDao.getField(4)).toEqual('DateRegistered');
        expect(count).toEqual(1);
        expect(userDao.recordCount).toEqual(1);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
        
        let record = await userDao.next();
        expect(userDao.recordCount).toEqual(2);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(1));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);
        
        record = await userDao.next();
        expect(userDao.recordCount).toEqual(3);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(2));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = await userDao.next();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(3));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        //next only knows it is at EOF when it fails to load the next record
        record = await userDao.next();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(3));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(true);
        
        record = userDao.prev();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(2));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.prev();
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(1));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.prev();
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);

        record = userDao.prev();
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset one row at a time then use last()", async () => {
        let count = await userDao.load(null, null, false);
        expect(userDao.fieldCount).toEqual(5);
        expect(userDao.getField(0)).toEqual('Id');
        expect(userDao.getField(1)).toEqual('Email');
        expect(userDao.getField(2)).toEqual('PasswordHash');
        expect(userDao.getField(3)).toEqual('PasswordSalt');
        expect(userDao.getField(4)).toEqual('DateRegistered');
        expect(count).toEqual(1);
        expect(userDao.recordCount).toEqual(1);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
        
        let record = await userDao.last();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(3));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(true);
        
        record = await userDao.last();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(3));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(true);
        
        record = userDao.first();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset all at once", async () => {
        let count = await userDao.load();
        expect(userDao.fieldCount).toEqual(5);
        expect(userDao.getField(0)).toEqual('Id');
        expect(userDao.getField(1)).toEqual('Email');
        expect(userDao.getField(2)).toEqual('PasswordHash');
        expect(userDao.getField(3)).toEqual('PasswordSalt');
        expect(userDao.getField(4)).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);

        let record = await userDao.next();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(1));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);
        
        record = await userDao.last();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(3));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(true);

        record = userDao.prev();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(2));
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.first();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with a condition", async () => {
        let count = await userDao.load(null, "Email LIKE '%@test.com'");
        expect(userDao.fieldCount).toEqual(5);
        expect(userDao.getField(0)).toEqual('Id');
        expect(userDao.getField(1)).toEqual('Email');
        expect(userDao.getField(2)).toEqual('PasswordHash');
        expect(userDao.getField(3)).toEqual('PasswordSalt');
        expect(userDao.getField(4)).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with specifc fields", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], null);
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getField(0)).toEqual('Email');
        expect(userDao.getField(1)).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with specifc fields and a condition", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], "Email LIKE '%@test.com'");
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getField(0)).toEqual('Email');
        expect(userDao.getField(1)).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with 1 row", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], "Email = 'test1@test.com'");
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getField(0)).toEqual('Email');
        expect(userDao.getField(1)).toEqual('DateRegistered');
        expect(count).toEqual(1);
        expect(userDao.recordCount).toEqual(1);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.getRecord(-1)).toEqual(null);
        expect(userDao.getRecord(1)).toEqual(null);
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);

        let record = await userDao.next();
        expect(userDao.recordCount).toEqual(1);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);

        record = await userDao.last();
        expect(userDao.recordCount).toEqual(1);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);

        record = userDao.prev();
        expect(userDao.recordCount).toEqual(1);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);

        record = userDao.first();
        expect(userDao.recordCount).toEqual(1);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);
    });

    it("can load a dataset with no rows", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], "Email = 'xyz.com'");
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getField(0)).toEqual('Email');
        expect(userDao.getField(1)).toEqual('DateRegistered');
        expect(count).toEqual(0);
        expect(userDao.recordCount).toEqual(0);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        let record = await userDao.next();
        expect(userDao.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = await userDao.last();
        expect(userDao.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.prev();
        expect(userDao.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.first();
        expect(userDao.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);
    });

    it("can update a row in the dataset", () => {

    });

    it("can insert a row in the dataset", () => {

    });

    it("can discard changes to the dataset", () => {

    });
});