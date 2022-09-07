const mysqlx = require('@mysql/xdevapi');
import FieldDef from "../../FieldDef";
import Record from "../../Record";
import IFieldDef from "../../IFieldDef";
import { mysqlxTestConfig } from "../../__test__/appdata";
import MySqlDatasource from "../MySqlDatasource";

describe('MySqlData source tests', () => {
    let session: any = null;
    let userTable: any = null;
    let userDatasource: any;

    beforeAll(async () => {
        session = await mysqlx.getSession(mysqlxTestConfig);
        userTable = session.getDefaultSchema().getTable('User');
        await userTable.insert( ['Email', 'PasswordHash', 'PasswordSalt'])
            .values(['test1@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .values(['test2@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .values(['test3@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .values(['test4@test.com', 'testhashvaluethatis44charslong1234567890ABCD', 'testsaltvaluethatis44charslong1234567890ABCD'])
            .execute();
            
        MySqlDatasource.fieldDefs.set('User', await MySqlDatasource.getFieldDefs('User'));
        userDatasource = new MySqlDatasource('User');
    });

    beforeEach(async () => {
        
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


    it("can get field definitions for a table", async () => {
        let fieldDefs = await MySqlDatasource.getFieldDefs('User');
        expect(fieldDefs.length).toEqual(5);
        expect(fieldDefs.findIndex((element) => { return element.name == "Id" && element.isPrimaryKey })).toBeGreaterThanOrEqual(0);
        expect(fieldDefs.findIndex((element) => { return element.name == "Email" && !element.isPrimaryKey })).toBeGreaterThanOrEqual(0);
        expect(fieldDefs.findIndex((element) => { return element.name == "PasswordHash" && !element.isPrimaryKey })).toBeGreaterThanOrEqual(0);
        expect(fieldDefs.findIndex((element) => { return element.name == "PasswordSalt" && !element.isPrimaryKey })).toBeGreaterThanOrEqual(0);
        expect(fieldDefs.findIndex((element) => { return element.name == "DateRegistered" && !element.isPrimaryKey })).toBeGreaterThanOrEqual(0);
    });

    it("can load a dataset all at once", async () => {
        let dataset = await userDatasource.load();
        expect(userDatasource.fieldDefs.length).toEqual(5);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Id')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Email')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'PasswordHash')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'PasswordSalt')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'DateRegistered')).toEqual(true);
        expect(dataset.length).toEqual(4);

        let row = dataset[0];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test1@test.com');

        row = dataset[1];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test2@test.com');

        row = dataset[2];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test3@test.com');

        row = dataset[3];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test4@test.com');
    });

    it("can load a dataset with a row limit", async () => {
        let dataset = await userDatasource.load(null, null, 2);
        expect(userDatasource.fieldDefs.length).toEqual(5);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Id')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Email')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'PasswordHash')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'PasswordSalt')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'DateRegistered')).toEqual(true);
        expect(dataset.length).toEqual(2);

        let row = dataset[0];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test1@test.com');

        row = dataset[1];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test2@test.com');
    });

    it("can load a dataset with a condition", async () => {
        let dataset = await userDatasource.load(null, "Email = 'test3@test.com'");
        expect(userDatasource.fieldDefs.length).toEqual(5);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Id')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Email')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'PasswordHash')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'PasswordSalt')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'DateRegistered')).toEqual(true);
        expect(dataset.length).toEqual(1);

        let row = dataset[0];
        expect(row.fieldCount).toEqual(5);
        expect(row.getField('Email').value).toEqual('test3@test.com');
    });

    it("can load a dataset with specifc fields", async () => {
        let dataset = await userDatasource.load(['Email', 'DateRegistered']);
        expect(userDatasource.fieldDefs.length).toEqual(2);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Email')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'DateRegistered')).toEqual(true);
        expect(dataset.length).toEqual(4);

        let row = dataset[0];
        expect(row.fieldCount).toEqual(2);
        expect(row.getField('Email').value).toEqual('test1@test.com');

        row = dataset[1];
        expect(row.fieldCount).toEqual(2);
        expect(row.getField('Email').value).toEqual('test2@test.com');

        row = dataset[2];
        expect(row.fieldCount).toEqual(2);
        expect(row.getField('Email').value).toEqual('test3@test.com');

        row = dataset[3];
        expect(row.fieldCount).toEqual(2);
        expect(row.getField('Email').value).toEqual('test4@test.com');
    });

    it("can load a dataset with specifc fields and a condition", async () => {
        let dataset = await userDatasource.load(['Email', 'DateRegistered'], "Email = 'test2@test.com'");
        expect(userDatasource.fieldDefs.length).toEqual(2);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Email')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'DateRegistered')).toEqual(true);
        expect(dataset.length).toEqual(1);

        let row = dataset[0];
        expect(row.fieldCount).toEqual(2);
        expect(row.getField('Email').value).toEqual('test2@test.com');
    });

    it("can load a dataset with no rows", async () => {
        let dataset = await userDatasource.load(['Email', 'DateRegistered'], "Email = 'xyz.com'");
        expect(userDatasource.fieldDefs.length).toEqual(2);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'Email')).toEqual(true);
        expect(userDatasource.fieldDefs.some((fd: FieldDef) => fd.name == 'DateRegistered')).toEqual(true);
        expect(dataset.length).toEqual(0);
    });

    it("can update rows in the dataset", async () => {
        let records = await userDatasource.load();
        let recordsToUpdate = new Array<Record>(2);

        recordsToUpdate[0] = records[0];
        expect(recordsToUpdate[0].getField('Email').value).toEqual('test1@test.com');
        expect(recordsToUpdate[0].getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(recordsToUpdate[0].getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        recordsToUpdate[0].getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
        recordsToUpdate[0].getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';

        recordsToUpdate[1] = records[2];
        expect(recordsToUpdate[1].getField('Email').value).toEqual('test3@test.com');
        expect(recordsToUpdate[1].getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(recordsToUpdate[1].getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        recordsToUpdate[1].getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCG';
        recordsToUpdate[1].getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCH';

        let count = await userDatasource.save(recordsToUpdate);
        expect(count).toEqual(2);

        records = await userDatasource.load();
        let row = records[0];
        expect(row.getField('Email').value).toEqual('test1@test.com');
        expect(row.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCE');
        expect(row.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCF');

        row = records[2];
        expect(row.getField('Email').value).toEqual('test3@test.com');
        expect(row.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCG');
        expect(row.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCH');
    });

    it("cannot update rows in the dataset when no primary key is defined", async () => {
        let userFieldDefs = MySqlDatasource.fieldDefs.get('User');
        let pkFieldDefIndex = userFieldDefs.findIndex((fd: IFieldDef) => fd.isPrimaryKey);
        let pkFieldDef = userFieldDefs[pkFieldDefIndex];
        let nonPkFieldDef = new FieldDef('Id');
        userFieldDefs[pkFieldDefIndex] = nonPkFieldDef;

        try {        
            let records = await userDatasource.load();
            let recordsToUpdate = new Array<Record>(1);

            recordsToUpdate[0] = records[1];
            expect(recordsToUpdate[0].getField('Email').value).toEqual('test2@test.com');
            expect(recordsToUpdate[0].getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
            expect(recordsToUpdate[0].getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
            recordsToUpdate[0].getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
            recordsToUpdate[0].getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';

            let f = async (): Promise<number> => { return userDatasource.save(recordsToUpdate) };
            expect(f).rejects.toThrow('Primary key field is not defined.  Unable to save record');
        }
        finally {
            userFieldDefs[pkFieldDefIndex] = pkFieldDef;
        }
    });

    it("can insert rows in the dataset", async () => {
        let fieldDefs = [
            new FieldDef('Id', true),
            new FieldDef('Email'),
            new FieldDef('PasswordHash'),
            new FieldDef('PasswordSalt'),
            new FieldDef('DateRegistered'),
        ];

        let recordsToInsert = new Array<Record>(2);
        //todo: have DAO store the PK field separately so it cannot/does not need to be set.
        let rowData = new Map<string, any>()
            .set('Id', null)
            .set('Email', 'test5@test.com')
            .set('PasswordHash', 'testhashvaluethatis44charslong1234567890ABCD')
            .set('PasswordSalt', 'testsaltvaluethatis44charslong1234567890ABCD')
            .set('DateRegistered', null);
        recordsToInsert[0] = new Record(fieldDefs, rowData, true);
        rowData = new Map<string, any>()
            .set('Id', null)
            .set('Email', 'test6@test.com')
            .set('PasswordHash', 'testhashvaluethatis44charslong1234567890ABCD')
            .set('PasswordSalt', 'testsaltvaluethatis44charslong1234567890ABCD')
            .set('DateRegistered', '2000-01-01T00:00:00');
        recordsToInsert[1] = new Record(fieldDefs, rowData, true);
        expect(recordsToInsert[0].getField('Id').value).toBeNull();
        expect(recordsToInsert[1].getField('Id').value).toBeNull();
        
        let count = await userDatasource.save(recordsToInsert);
        expect(count).toEqual(2);
        expect(recordsToInsert[0].getField('Id').value).toBeGreaterThan(0);
        expect(recordsToInsert[1].getField('Id').value).toBeGreaterThan(0);


        let records = await userDatasource.load();
        let row = records[4];
        expect(row.getField('Id').value).toBeGreaterThan(0);
        expect(row.getField('Email').value).toEqual('test5@test.com');
        expect(row.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(row.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        expect(row.getField('DateRegistered').value).not.toBeNull();
        row = records[5];
        expect(row.getField('Id').value).toBeGreaterThan(0);
        expect(row.getField('Email').value).toEqual('test6@test.com');
        expect(row.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(row.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        expect(row.getField('DateRegistered').value).not.toBeNull();
    });
});