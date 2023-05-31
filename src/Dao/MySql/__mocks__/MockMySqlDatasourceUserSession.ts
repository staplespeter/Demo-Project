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
    .mockReturnValue('UserSession');

//todo: mock these field defs?
const mockFieldDefs: Array<IFieldDef> = [
    new FieldDef('Id', true),
    new FieldDef('StartDate'),
    new FieldDef('EndDate'),
    new FieldDef('UserId')
];
export const mockGetFieldDefs = jest
    .spyOn(MySqlDatasource, 'getFieldDefs')
    .mockResolvedValue(mockFieldDefs);
MySqlDatasource.fieldDefs.set('UserSession', mockFieldDefs);


const mockLoadResult = [
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 1)
            .set('StartDate', '2001-01-01 12:34:56')
            .set('EndDate', null)
            .set('UserId', 101)),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 3)
            .set('StartDate', '2001-01-03 12:34:56')
            .set('EndDate', null)
            .set('UserId', 103)),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 3)
            .set('StartDate', '2001-01-03 12:34:56')
            .set('EndDate', null)
            .set('UserId', 103))
];
const mockLoadFn = async function (fields: Array<string> = null, filter: string = null, maxRows: number = 100) {
    const flds= fields;
    const userId = filter.substring("'UserId' == ".length, filter.length - " AND 'EndDate IS NULL".length);

    return mockLoadResult.filter(r => r.getField('UserId').value == userId);
}
export const mockLoad = jest
    .spyOn(MySqlDatasource.prototype, 'load')
    .mockImplementation((fields: Array<string> = null, filter: string = null, maxRows: number = 100) => {
        return mockLoadFn(fields, filter, maxRows);
    });

const mockSaveFn = async function (records: Array<IRecord>) {
    if (records[0].getField('UserId').value == 104) {
        records[0].primaryKeyField.value = 4;
    }

    if (records[0].primaryKeyField.value == 5) {
        return 0;
    }
    return records.length;
};
export const mockSave = jest
    .spyOn(MySqlDatasource.prototype, 'save')
    .mockImplementation((records: Array<IRecord>) => {
        return mockSaveFn(records);
    });

export const mockMySqlDataSourceUserSession = new MySqlDatasource('UserSession');
mockMySqlDataSourceUserSession.fieldDefs = mockFieldDefs;