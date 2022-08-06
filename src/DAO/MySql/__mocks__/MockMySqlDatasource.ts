import DaoFieldDef from "../../DaoFieldDef";
import IDaoFieldDef from "../../IDaoFieldDef";
import IDaoRecord from "../../IDaoRecord";
import MySqlDatasource from "../MySqlDatasource";
jest.mock("../MySqlDatasource");

//even though property getters are documented in Jest they do not work @28.1.3.  known issue 
//https://github.com/facebook/jest/issues/9675
//using workaround.
// export const mockGetObjectName = jest
//     .spyOn(MySqlDatasource.prototype, 'objectName', 'get')
//     .mockReturnValue('User');
Object.defineProperty(MySqlDatasource.prototype, 'objectName', jest.fn(() => { return 'User' }));
//console.log(Object.getOwnPropertyDescriptor(MySqlDatasource.prototype, 'objectName'));

//todo: mock these field defs?
const mockFieldDefs: Array<IDaoFieldDef> = [
    new DaoFieldDef('TestField1', true),
    new DaoFieldDef('TestField2')
];
export const mockGetFieldDefs = jest
    .spyOn(MySqlDatasource, 'getFieldDefs')
    .mockResolvedValue(mockFieldDefs);
MySqlDatasource.fieldDefs.set('User', mockFieldDefs);


const mockLoadResult = [
    ['TestField1Value1', 'TestField2Value1'],
    ['TestField1Value2', 'TestField2Value2'],
    ['TestField1Value3', 'TestField2Value3'],
    ['TestField1Value4', 'TestField2Value4']
];
const mockLoadFn = async function (fields: Array<string> = null, filter: string = null, maxRows: number = 100) {
    if (maxRows == 0) {
        return null;
    }
    if (maxRows < mockLoadResult.length) {
        return mockLoadResult.slice(0, maxRows);
    }
    return mockLoadResult;
}
export const mockLoad = jest
    .spyOn(MySqlDatasource.prototype, 'load')
    .mockImplementation((fields, filter, maxRows) => {
        return mockLoadFn(fields, filter, maxRows);
    });

const mockSaveFn = async function (recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>) {
    return recordsToUpdate.length + recordsToInsert.length;
};
export const mockSave = jest
    .spyOn(MySqlDatasource.prototype, 'save')
    .mockImplementation((recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>) => {
        return mockSaveFn(recordsToUpdate, recordsToInsert);
    });

export const mockMySqlDataSource = new MySqlDatasource('User');
mockMySqlDataSource.fieldDefs = mockFieldDefs;