import FieldDef from "../../FieldDef";
import IFieldDef from "../../IFieldDef";
import IRecord from "../../IRecord";
import Record from "../../Record";
import MySqlDatasource from "../MySqlDatasource";
jest.mock("../MySqlDatasource");

//even though property getters are documented in Jest they do not work @28.1.3.
//fixed
export const mockGetObjectName = jest
    .spyOn(MySqlDatasource.prototype, 'objectName', 'get')
    .mockReturnValue('User');

//todo: mock these field defs?
const mockFieldDefs: Array<IFieldDef> = [
    new FieldDef('TestField1', true),
    new FieldDef('TestField2')
];
export const mockGetFieldDefs = jest
    .spyOn(MySqlDatasource, 'getFieldDefs')
    .mockResolvedValue(mockFieldDefs);
MySqlDatasource.fieldDefs.set('User', mockFieldDefs);


const mockLoadResult = [
    new Record(mockFieldDefs, new Map<string, any>().set('TestField1', 'TestField1Value1').set('TestField2', 'TestField2Value1')),
    new Record(mockFieldDefs, new Map<string, any>().set('TestField1', 'TestField1Value2').set('TestField2', 'TestField2Value2')),
    new Record(mockFieldDefs, new Map<string, any>().set('TestField1', 'TestField1Value3').set('TestField2', 'TestField2Value3')),
    new Record(mockFieldDefs, new Map<string, any>().set('TestField1', 'TestField1Value4').set('TestField2', 'TestField2Value4'))
];
const mockLoadFn = async function (fields: Array<string> = null, filter: string = null, maxRows: number = 100) {
    if (maxRows < mockLoadResult.length) {
        return mockLoadResult.slice(0, maxRows);
    }
    return mockLoadResult;
}
export const mockLoad = jest
    .spyOn(MySqlDatasource.prototype, 'load')
    .mockImplementation((fields: Array<string> = null, filter: string = null, maxRows: number = 100) => {
        return mockLoadFn(fields, filter, maxRows);
    });

const mockSaveFn = async function (records: Array<IRecord>) {
    return records.length;
};
export const mockSave = jest
    .spyOn(MySqlDatasource.prototype, 'save')
    .mockImplementation((records: Array<IRecord>) => {
        return mockSaveFn(records);
    });

export const mockMySqlDataSource = new MySqlDatasource('User');
mockMySqlDataSource.fieldDefs = mockFieldDefs;