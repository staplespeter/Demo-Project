import Recordset from "../RecordSet";
import IRecordset from "../IRecordset";
//import MySqlDatasource from "../MySql/MySqlDatasource";
//jest.mock("../MySql/MySqlDatasource");
import { mockMySqlDataSource, mockLoad, mockSave } from "../MySql/__mocks__/MockMySqlDatasource";


describe("Recordset tests", () => {
    let userRs: IRecordset;

    beforeAll(() => {
        userRs = new Recordset(mockMySqlDataSource);
    });

    beforeEach(() => {
        mockLoad.mockClear();
        mockSave.mockClear();
    });

    it("can load a dataset and navigate", async () => {
        let count = await userRs.load();
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(undefined, undefined, undefined);
        expect(userRs.fieldCount).toEqual(2);
        expect(count).toEqual(4);
        expect(userRs.recordCount).toEqual(4);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.currentRecord.getField('TestField1').value).toEqual('TestField1Value1');
        expect(userRs.currentRecord.getField('TestField2').value).toEqual('TestField2Value1');
        expect(userRs.currentRecord.getField('TestField1').fieldDef.name).toEqual('TestField1');
        expect(userRs.currentRecord.getField('TestField1').fieldDef.isPrimaryKey).toEqual(true);
        expect(userRs.currentRecord.getField('TestField2').fieldDef.name).toEqual('TestField2');
        expect(userRs.currentRecord.getField('TestField2').fieldDef.isPrimaryKey).toEqual(false);
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(false);

        let record = userRs.next();
        expect(userRs.recordCount).toEqual(4);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(1));
        expect(userRs.currentRecord.getField('TestField1').value).toEqual('TestField1Value2');
        expect(userRs.currentRecord.getField('TestField2').value).toEqual('TestField2Value2');
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);
        
        record = userRs.last();
        expect(userRs.recordCount).toEqual(4);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(3));
        expect(userRs.currentRecord.getField('TestField1').value).toEqual('TestField1Value4');
        expect(userRs.currentRecord.getField('TestField2').value).toEqual('TestField2Value4');
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(true);

        record = userRs.prev();
        expect(userRs.recordCount).toEqual(4);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(2));
        expect(userRs.currentRecord.getField('TestField1').value).toEqual('TestField1Value3');
        expect(userRs.currentRecord.getField('TestField2').value).toEqual('TestField2Value3');
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);

        record = userRs.first();
        expect(userRs.recordCount).toEqual(4);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.currentRecord.getField('TestField1').value).toEqual('TestField1Value1');
        expect(userRs.currentRecord.getField('TestField2').value).toEqual('TestField2Value1');
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(false);
    });

    it("can load a dataset with fields, filter and limit", async () => {
        await userRs.load(['TestField'], 'TestFilter', 2);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(['TestField'], 'TestFilter', 2);
    });

    it("can load a dataset with 1 row and navigate", async () => {
        let count = await userRs.load(null, null, 1);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(null, null, 1);
        expect(count).toEqual(1);
        expect(userRs.recordCount).toEqual(1);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.getRecord(-1)).toEqual(null);
        expect(userRs.getRecord(1)).toEqual(null);
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(true);

        let record = userRs.next();
        expect(userRs.recordCount).toEqual(1);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(true);

        record = userRs.last();
        expect(userRs.recordCount).toEqual(1);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(true);

        record = userRs.prev();
        expect(userRs.recordCount).toEqual(1);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(true);

        record = userRs.first();
        expect(userRs.recordCount).toEqual(1);
        expect(record).toEqual(userRs.currentRecord);
        expect(userRs.currentRecord).toEqual(userRs.getRecord(0));
        expect(userRs.bof).toEqual(true);
        expect(userRs.eof).toEqual(true);
    });

    it("can load a dataset with no rows and navigate", async () => {
        let count = await userRs.load(null, null, 0);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(null, null, 0);
        expect(count).toEqual(0);
        expect(userRs.recordCount).toEqual(0);
        expect(userRs.currentRecord).toEqual(null);
        expect(userRs.getRecord(0)).toEqual(null);
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);

        let record = userRs.next();
        expect(userRs.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userRs.currentRecord).toEqual(null);
        expect(userRs.getRecord(0)).toEqual(null);
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);

        record = userRs.last();
        expect(userRs.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userRs.currentRecord).toEqual(null);
        expect(userRs.getRecord(0)).toEqual(null);
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);

        record = userRs.prev();
        expect(userRs.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userRs.currentRecord).toEqual(null);
        expect(userRs.getRecord(0)).toEqual(null);
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);

        record = userRs.first();
        expect(userRs.recordCount).toEqual(0);
        expect(record).toEqual(null);
        expect(userRs.currentRecord).toEqual(null);
        expect(userRs.getRecord(0)).toEqual(null);
        expect(userRs.bof).toEqual(false);
        expect(userRs.eof).toEqual(false);
    });

    it("can update rows in the dataset", async () => {
        await userRs.load();
        let record1 = userRs.getRecord(0);
        record1.getField('TestField2').value = 'NewTestField1Value1';
        let record2 = userRs.getRecord(2);
        record2.getField('TestField2').value = 'NewTestField2Value3';
        expect(record1.hasChanged).toEqual(true);
        expect(record1.isNew).toEqual(false);
        expect(record2.hasChanged).toEqual(true);
        expect(record2.isNew).toEqual(false);

        let count = await userRs.save();
        expect(count).toEqual(2);
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith([record1, record2]);
    });

    it("can insert rows in the dataset", async () => {
        await userRs.load();
        let record1 = userRs.addRecord();
        record1.getField('TestField2').value = 'NewTestField2Value1';
        expect(record1.hasChanged).toEqual(false);
        expect(record1.isNew).toEqual(true);

        //todo: have DAO store the PK field separately so it cannot/does not need to be set
        let fieldData = new Map<string, any>();
        fieldData.set('TestField2', 'NewTestField2Value5');
        let record2 = userRs.addRecord(fieldData);
        expect(record2.hasChanged).toEqual(false);
        expect(record2.isNew).toEqual(true);
        
        let count = await userRs.save();
        expect(count).toEqual(2);
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith([record1, record2]);
    });


    it("can discard changes to the dataset", async () => {
        await userRs.load();
        let record = userRs.getRecord(1);
        expect(record.getField('TestField1').value).toEqual('TestField1Value2');
        expect(record.getField('TestField2').value).toEqual('TestField2Value2');
        expect(record.hasChanged).toEqual(false);

        record.getField('TestField1').value = 'NewTestField1Value2';
        record.getField('TestField2').value = 'NewTestField2Value2';
        expect(record.getField('TestField1').value).toEqual('TestField1Value2');
        expect(record.getField('TestField2').value).toEqual('NewTestField2Value2');
        expect(record.hasChanged).toEqual(true);


        record = userRs.getRecord(3);
        expect(record.getField('TestField1').value).toEqual('TestField1Value4');
        expect(record.getField('TestField2').value).toEqual('TestField2Value4');
        expect(record.hasChanged).toEqual(false);

        record.getField('TestField1').value = 'NewTestField1Value4';
        record.getField('TestField2').value = 'NewTestField2Value4';
        expect(record.getField('TestField1').value).toEqual('TestField1Value4');
        expect(record.getField('TestField2').value).toEqual('NewTestField2Value4');
        expect(record.hasChanged).toEqual(true);


        let count = userRs.discard();
        expect(count).toEqual(2);
        record = userRs.getRecord(1);
        expect(record.getField('TestField1').value).toEqual('TestField1Value2');
        expect(record.getField('TestField2').value).toEqual('TestField2Value2');
        expect(record.hasChanged).toEqual(false);
        record = userRs.getRecord(3);
        expect(record.getField('TestField1').value).toEqual('TestField1Value4');
        expect(record.getField('TestField2').value).toEqual('TestField2Value4');
        expect(record.hasChanged).toEqual(false);
    });
});