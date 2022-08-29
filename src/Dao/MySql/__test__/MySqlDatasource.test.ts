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
        expect(userDatasource.fieldDefs[0].name).toEqual('Id');
        expect(userDatasource.fieldDefs[1].name).toEqual('Email');
        expect(userDatasource.fieldDefs[2].name).toEqual('PasswordHash');
        expect(userDatasource.fieldDefs[3].name).toEqual('PasswordSalt');
        expect(userDatasource.fieldDefs[4].name).toEqual('DateRegistered');
        expect(dataset.length).toEqual(4);

        let row = dataset[0];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test1@test.com');

        row = dataset[1];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test2@test.com');

        row = dataset[2];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test3@test.com');

        row = dataset[3];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test4@test.com');
    });

    it("can load a dataset with a row limit", async () => {
        let dataset = await userDatasource.load(null, null, 2);
        expect(userDatasource.fieldDefs.length).toEqual(5);
        expect(userDatasource.fieldDefs[0].name).toEqual('Id');
        expect(userDatasource.fieldDefs[1].name).toEqual('Email');
        expect(userDatasource.fieldDefs[2].name).toEqual('PasswordHash');
        expect(userDatasource.fieldDefs[3].name).toEqual('PasswordSalt');
        expect(userDatasource.fieldDefs[4].name).toEqual('DateRegistered');
        expect(dataset.length).toEqual(2);

        let row = dataset[0];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test1@test.com');

        row = dataset[1];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test2@test.com');
    });

    it("can load a dataset with a condition", async () => {
        let dataset = await userDatasource.load(null, "Email = 'test3@test.com'");
        expect(userDatasource.fieldDefs.length).toEqual(5);
        expect(userDatasource.fieldDefs[0].name).toEqual('Id');
        expect(userDatasource.fieldDefs[1].name).toEqual('Email');
        expect(userDatasource.fieldDefs[2].name).toEqual('PasswordHash');
        expect(userDatasource.fieldDefs[3].name).toEqual('PasswordSalt');
        expect(userDatasource.fieldDefs[4].name).toEqual('DateRegistered');
        expect(dataset.length).toEqual(1);

        let row = dataset[0];
        expect(row.length).toEqual(5);
        expect(row[1]).toEqual('test3@test.com');
    });

    it("can load a dataset with specifc fields", async () => {
        let dataset = await userDatasource.load(['Email', 'DateRegistered']);
        expect(userDatasource.fieldDefs.length).toEqual(2);
        expect(userDatasource.fieldDefs[0].name).toEqual('Email');
        expect(userDatasource.fieldDefs[1].name).toEqual('DateRegistered');
        expect(dataset.length).toEqual(4);

        let row = dataset[0];
        expect(row.length).toEqual(2);
        expect(row[0]).toEqual('test1@test.com');

        row = dataset[1];
        expect(row.length).toEqual(2);
        expect(row[0]).toEqual('test2@test.com');

        row = dataset[2];
        expect(row.length).toEqual(2);
        expect(row[0]).toEqual('test3@test.com');

        row = dataset[3];
        expect(row.length).toEqual(2);
        expect(row[0]).toEqual('test4@test.com');
    });

    it("can load a dataset with specifc fields and a condition", async () => {
        let dataset = await userDatasource.load(['Email', 'DateRegistered'], "Email = 'test2@test.com'");
        expect(userDatasource.fieldDefs.length).toEqual(2);
        expect(userDatasource.fieldDefs[0].name).toEqual('Email');
        expect(userDatasource.fieldDefs[1].name).toEqual('DateRegistered');
        expect(dataset.length).toEqual(1);

        let row = dataset[0];
        expect(row.length).toEqual(2);
        expect(row[0]).toEqual('test2@test.com');
    });

    it("can load a dataset with no rows", async () => {
        let dataset = await userDatasource.load(['Email', 'DateRegistered'], "Email = 'xyz.com'");
        expect(userDatasource.fieldDefs.length).toEqual(2);
        expect(userDatasource.fieldDefs[0].name).toEqual('Email');
        expect(userDatasource.fieldDefs[1].name).toEqual('DateRegistered');
        expect(dataset.length).toEqual(0);
    });

    it("can update rows in the dataset", async () => {
        let dataset = await userDatasource.load();
        let recordsToUpdate = new Array<Record>(2);

        recordsToUpdate[0] = new Record(userDatasource.fieldDefs, dataset[0]);
        expect(recordsToUpdate[0].getField('Email').value).toEqual('test1@test.com');
        expect(recordsToUpdate[0].getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(recordsToUpdate[0].getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        recordsToUpdate[0].getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
        recordsToUpdate[0].getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';

        recordsToUpdate[1] = new Record(userDatasource.fieldDefs, dataset[2]);
        expect(recordsToUpdate[1].getField('Email').value).toEqual('test3@test.com');
        expect(recordsToUpdate[1].getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(recordsToUpdate[1].getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        recordsToUpdate[1].getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCG';
        recordsToUpdate[1].getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCH';

        let count = await userDatasource.save(recordsToUpdate, null);
        expect(count).toEqual(2);

        dataset = await userDatasource.load();
        let row = dataset[0];
        expect(row[1]).toEqual('test1@test.com');
        expect(row[2]).toEqual('testhashvaluethatis44charslong1234567890ABCE');
        expect(row[3]).toEqual('testsaltvaluethatis44charslong1234567890ABCF');

        row = dataset[2];
        expect(row[1]).toEqual('test3@test.com');
        expect(row[2]).toEqual('testhashvaluethatis44charslong1234567890ABCG');
        expect(row[3]).toEqual('testsaltvaluethatis44charslong1234567890ABCH');
    });

    it("cannot update rows in the dataset when no primary key is defined", async () => {
        let userFieldDefs = MySqlDatasource.fieldDefs.get('User');
        let pkFieldDefIndex = userFieldDefs.findIndex((fd: IFieldDef) => fd.isPrimaryKey);
        let pkFieldDef = userFieldDefs[pkFieldDefIndex];
        let nonPkFieldDef = new FieldDef('Id');
        userFieldDefs[pkFieldDefIndex] = nonPkFieldDef;

        try {        
            let dataset = await userDatasource.load();
            let recordsToUpdate = new Array<Record>(1);

            recordsToUpdate[0] = new Record(userDatasource.fieldDefs, dataset[1]);
            expect(recordsToUpdate[0].getField('Email').value).toEqual('test2@test.com');
            expect(recordsToUpdate[0].getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
            expect(recordsToUpdate[0].getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
            recordsToUpdate[0].getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
            recordsToUpdate[0].getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';

            let f = async () => { await userDatasource.save(recordsToUpdate, null) };
            expect(await f).rejects.toThrow('Primary key field is not defined.  Unable to update record');
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
        //todo: have the Record accept a Map instead of an array so do not have to ensure
        //order of elements matched the order of field defs.
        let row = [null,
            'test5@test.com',
            'testhashvaluethatis44charslong1234567890ABCD',
            'testsaltvaluethatis44charslong1234567890ABCD',
            null];
        recordsToInsert[0] = new Record(fieldDefs, row, true);
        row = [null,
            'test6@test.com',
            'testhashvaluethatis44charslong1234567890ABCD',
            'testsaltvaluethatis44charslong1234567890ABCD',
            '2000-01-01T00:00:00'];
        recordsToInsert[1] = new Record(fieldDefs, row, true);
        expect(recordsToInsert[0].getField('Id').value).toBeNull();
        expect(recordsToInsert[1].getField('Id').value).toBeNull();
        
        let count = await userDatasource.save(null, recordsToInsert);
        expect(count).toEqual(2);
        expect(recordsToInsert[0].getField('Id').value).toBeGreaterThan(0);
        expect(recordsToInsert[1].getField('Id').value).toBeGreaterThan(0);


        let dataset = await userDatasource.load();
        row = dataset[4];
        expect(row[0]).toBeGreaterThan(0);
        expect(row[1]).toEqual('test5@test.com');
        expect(row[2]).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(row[3]).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        expect(row[4]).not.toBeNull();
        row = dataset[5];
        expect(row[0]).toBeGreaterThan(0);
        expect(row[1]).toEqual('test6@test.com');
        expect(row[2]).toEqual('testhashvaluethatis44charslong1234567890ABCD');
        expect(row[3]).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
        expect(row[4]).not.toBeNull();
    });
});