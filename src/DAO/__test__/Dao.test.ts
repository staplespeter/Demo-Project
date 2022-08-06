import DaoRecord from "../DaoRecord";
import DaoFieldDef from "../DaoFieldDef";
import DaoFactory from "../DaoFactory";
import Dao from "../Dao";
import IDao from "../IDao";
//import MySqlDatasource from "../MySql/MySqlDatasource";
//jest.mock("../MySql/MySqlDatasource");
import { mockMySqlDataSource, mockLoad, mockSave } from "../MySql/__mocks__/MockMySqlDatasource";


describe("DAO tests", () => {
    let userDao: IDao;

    beforeAll(() => {
        userDao = new Dao(mockMySqlDataSource);
    });

    beforeEach(() => {
        mockLoad.mockClear();
        mockSave.mockClear();
    });

    it("can load a dataset and navigate", async () => {
        let count = await userDao.load();
        expect(userDao.fieldCount).toEqual(2);
        expect(count).toEqual(4);
        expect(userDao.recordCount).toEqual(4);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.currentRecord.getField('TestField1').value).toEqual('TestField1Value1');
        expect(userDao.currentRecord.getField('TestField2').value).toEqual('TestField2Value1');
        expect(userDao.currentRecord.getField('TestField1').fieldDef.name).toEqual('TestField1');
        expect(userDao.currentRecord.getField('TestField1').fieldDef.isPrimaryKey).toEqual(true);
        expect(userDao.currentRecord.getField('TestField2').fieldDef.name).toEqual('TestField2');
        expect(userDao.currentRecord.getField('TestField2').fieldDef.isPrimaryKey).toEqual(false);
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);

        let record = userDao.next();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(1));
        expect(userDao.currentRecord.getField('TestField1').value).toEqual('TestField1Value2');
        expect(userDao.currentRecord.getField('TestField2').value).toEqual('TestField2Value2');
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);
        
        record = userDao.last();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(3));
        expect(userDao.currentRecord.getField('TestField1').value).toEqual('TestField1Value4');
        expect(userDao.currentRecord.getField('TestField2').value).toEqual('TestField2Value4');
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(true);

        record = userDao.prev();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(2));
        expect(userDao.currentRecord.getField('TestField1').value).toEqual('TestField1Value3');
        expect(userDao.currentRecord.getField('TestField2').value).toEqual('TestField2Value3');
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.first();
        expect(userDao.recordCount).toEqual(4);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.currentRecord.getField('TestField1').value).toEqual('TestField1Value1');
        expect(userDao.currentRecord.getField('TestField2').value).toEqual('TestField2Value1');
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(false);
    });

    it("can load a dataset with fields, filter and limit", async () => {
        await userDao.load(['TestField'], 'TestFilter', 2);
        expect(mockLoad).toBeCalledWith(['TestField'], 'TestFilter', 2);
    });

    it("can load a dataset with 1 row and navigate", async () => {
        let count = await userDao.load(null, null, 1);
        expect(count).toEqual(1);
        expect(userDao.recordCount).toEqual(1);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.getRecord(-1)).toEqual(null);
        expect(userDao.getRecord(1)).toEqual(null);
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);

        let record = userDao.next();
        expect(userDao.recordCount).toEqual(1);
        expect(record).toEqual(userDao.currentRecord);
        expect(userDao.currentRecord).toEqual(userDao.getRecord(0));
        expect(userDao.bof).toEqual(true);
        expect(userDao.eof).toEqual(true);

        record = userDao.last();
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

    it("can load a dataset with no rows and navigate", async () => {
        let count = await userDao.load(null, null, 0);
        expect(count).toEqual(0);
        expect(userDao.recordCount).toEqual(0);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        let record = userDao.next();
        expect(userDao.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userDao.currentRecord).toEqual(null);
        expect(userDao.getRecord(0)).toEqual(null);
        expect(userDao.bof).toEqual(false);
        expect(userDao.eof).toEqual(false);

        record = userDao.last();
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
        let record1 = userDao.getRecord(0);
        record1.getField('TestField2').value = 'NewTestField1Value1';
        let record2 = userDao.getRecord(2);
        record2.getField('TestField2').value = 'NewTestField2Value3';
        expect(record1.hasChanged).toEqual(true);
        expect(record1.isNew).toEqual(false);
        expect(record2.hasChanged).toEqual(true);
        expect(record2.isNew).toEqual(false);

        let count = await userDao.save();
        expect(count).toEqual(2);
        expect(mockSave).toBeCalled();
    });

    it("can insert rows in the dataset", async () => {
        await userDao.load();
        let record1 = userDao.addRecord();
        record1.getField('TestField1').value = 'NewTestField1Value1';
        record1.getField('TestField2').value = 'NewTestField2Value1';
        expect(record1.hasChanged).toEqual(false);
        expect(record1.isNew).toEqual(true);

        //todo: have DAO store the PK field separately so it cannot/does not need to be set
        let fieldData = new Map<string, any>();
        fieldData.set('TestField1', 'NewTestField1Value5');
        fieldData.set('TestField2', 'NewTestField2Value5');
        let record2 = userDao.addRecord(fieldData);
        expect(record2.hasChanged).toEqual(false);
        expect(record2.isNew).toEqual(true);
        
        let count = await userDao.save();
        expect(count).toEqual(2);
        expect(mockSave).toBeCalled();
    });


    // it("can discard changes to the dataset", async () => {
    //     await userDao.load();
    //     let record = userDao.getRecord(1);
    //     expect(record.getField('Email').value).toEqual('test2@test.com');
    //     expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
    //     expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
    //     expect(record.hasChanged).toEqual(false);

    //     record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCE';
    //     record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCF';
    //     expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCE');
    //     expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCF');
    //     expect(record.hasChanged).toEqual(true);


    //     record = userDao.getRecord(3);
    //     expect(record.getField('Email').value).toEqual('test4@test.com');
    //     expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
    //     expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
    //     expect(record.hasChanged).toEqual(false);

    //     record.getField('PasswordHash').value = 'testhashvaluethatis44charslong1234567890ABCG';
    //     record.getField('PasswordSalt').value = 'testsaltvaluethatis44charslong1234567890ABCH';
    //     expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCG');
    //     expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCH');
    //     expect(record.hasChanged).toEqual(true);


    //     let count = userDao.discard();
    //     expect(count).toEqual(2);
    //     record = userDao.getRecord(1);
    //     expect(record.getField('Email').value).toEqual('test2@test.com');
    //     expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
    //     expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
    //     record = userDao.getRecord(3);
    //     expect(record.getField('Email').value).toEqual('test4@test.com');
    //     expect(record.getField('PasswordHash').value).toEqual('testhashvaluethatis44charslong1234567890ABCD');
    //     expect(record.getField('PasswordSalt').value).toEqual('testsaltvaluethatis44charslong1234567890ABCD');
    // });
});