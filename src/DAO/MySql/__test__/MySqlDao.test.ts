import MySqlDaoFactory from "../MySqlDaoFactory";
const mysqlx = require('@mysql/xdevapi');
import { mysqlxTestConfig } from '../../__test__/appdata';
import DaoRecord from "../../DaoRecord";
import DaoFieldDef from "../../DaoFieldDef";

describe("MySQL DAO tests", () => {
    let session: any = null;
    let userTable: any = null;

    let factory: any;
    let userDao: any;

    beforeAll(async () => {
        session = await mysqlx.getSession(mysqlxTestConfig);
        userTable = session.getDefaultSchema().getTable('User');
        await userTable.insert( ['Email', 'PasswordHash', 'PasswordSalt'])
            .values(['test1@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .values(['test2@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .values(['test3@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .values(['test4@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .execute();
        factory = new MySqlDaoFactory(mysqlxTestConfig);
    });

    beforeEach(async () => {
        userDao = await factory.getDao('User');
    });

    afterAll(async () => {
        if (session) {
            await (async () => {
                if (userTable) {
                    await userTable.delete()
                        .where("Email LIKE '%@test.com'")
                        .execute();
                }
            })();
            await session.close();
        }
    });

    it("can load a dataset all at once", async () => {
        let count = await userDao.load();
        expect(userDao.fieldCount).toEqual(5);
        expect(userDao.getFieldDef(0).name).toEqual('Id');
        expect(userDao.getFieldDef(1).name).toEqual('Email');
        expect(userDao.getFieldDef(2).name).toEqual('PasswordHash');
        expect(userDao.getFieldDef(3).name).toEqual('PasswordSalt');
        expect(userDao.getFieldDef(4).name).toEqual('DateRegistered');
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
        expect(userDao.getFieldDef(0).name).toEqual('Id');
        expect(userDao.getFieldDef(1).name).toEqual('Email');
        expect(userDao.getFieldDef(2).name).toEqual('PasswordHash');
        expect(userDao.getFieldDef(3).name).toEqual('PasswordSalt');
        expect(userDao.getFieldDef(4).name).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with specifc fields", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], null);
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getFieldDef(0).name).toEqual('Email');
        expect(userDao.getFieldDef(1).name).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with specifc fields and a condition", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], "Email LIKE '%@test.com'");
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getFieldDef(0).name).toEqual('Email');
        expect(userDao.getFieldDef(1).name).toEqual('DateRegistered');
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with 1 row", async () => {
        let count = await userDao.load(['Email', 'DateRegistered'], "Email = 'test1@test.com'");
        expect(userDao.fieldCount).toEqual(2);
        expect(userDao.getFieldDef(0).name).toEqual('Email');
        expect(userDao.getFieldDef(1).name).toEqual('DateRegistered');
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
        expect(userDao.getFieldDef(0).name).toEqual('Email');
        expect(userDao.getFieldDef(1).name).toEqual('DateRegistered');
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

    it("can update rows in the dataset", async () => {
        await userDao.load();
        let record = userDao.getRecord(0);
        expect(record.getField('Email').value).toEqual('test1@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
        record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';

        record = userDao.getRecord(2);
        expect(record.getField('Email').value).toEqual('test3@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCG';
        record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCH';

        let count = await userDao.save();
        expect(count).toEqual(2);

        await userDao.load();
        record = userDao.getRecord(0);
        expect(record.getField('Email').value).toEqual('test1@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCE');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCF');
        record = userDao.getRecord(2);
        expect(record.getField('Email').value).toEqual('test3@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCG');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCH');
    });

    it("cannot update rows in the dataset when no primary key is defined", async () => {
        let localFactory = new MySqlDaoFactory(mysqlxTestConfig);
        await localFactory.getDao('User');
        let userFieldDefs = localFactory.fieldDefs.get('User');
        let pkFieldDefIndex = userFieldDefs.findIndex((fd: DaoFieldDef) => fd.isPrimaryKey );
        let nonPkFieldDef = new DaoFieldDef('Id');
        userFieldDefs[pkFieldDefIndex] = nonPkFieldDef;

        let localUserDao = await localFactory.getDao('User');
        await localUserDao.load();
        let record = localUserDao.getRecord(1);
        expect(record.getField('Email').value).toEqual('test2@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
        record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';

        let f = async () => { await localUserDao.save() };
        expect(await f).rejects.toThrow('Primary key field is not defined.  Unable to update record');
    });

    it("can insert rows in the dataset", async () => {
        await userDao.load();
        let record = userDao.addRecord();
        record.getField('Email').value = 'test5@test.com';
        record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCD';
        record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCD';

        //todo: have DAO store the PK field separately so it cannot/does not need to be set
        let fieldData = new Map<string, any>();
        fieldData.set('Id', null);
        fieldData.set('Email', 'test6@test.com');
        fieldData.set('PasswordHash', 'testhashvaluethatis44charslong1234567890ABCD');
        fieldData.set('PasswordSalt', 'testsaltvaluethatis44charslong1234567890ABCD');
        fieldData.set('DateRegistered', '2000-01-01T00:00:00');
        record = userDao.addRecord(fieldData);
        
        let count = await userDao.save();
        expect(count).toEqual(2);

        await userDao.load();
        record = userDao.getRecord(4);
        expect(record.getField('Id').value).toBeGreaterThan(0);
        expect(record.getField('Email').value).toEqual('test5@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        record = userDao.getRecord(5);
        expect(record.getField('Id').value).toBeGreaterThan(0);
        expect(record.getField('Email').value).toEqual('test6@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
    });


    it("can discard changes to the dataset", async () => {
        await userDao.load();
        let record = userDao.getRecord(1);
        expect(record.getField('Email').value).toEqual('test2@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        expect(record.hasChanged).toEqual(false);

        record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
        record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCE');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCF');
        expect(record.hasChanged).toEqual(true);


        record = userDao.getRecord(3);
        expect(record.getField('Email').value).toEqual('test4@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        expect(record.hasChanged).toEqual(false);

        record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCG';
        record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCH';
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCG');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCH');
        expect(record.hasChanged).toEqual(true);


        let count = userDao.discard();
        expect(count).toEqual(2);
        record = userDao.getRecord(1);
        expect(record.getField('Email').value).toEqual('test2@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        record = userDao.getRecord(3);
        expect(record.getField('Email').value).toEqual('test4@test.com');
        expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
    });
});