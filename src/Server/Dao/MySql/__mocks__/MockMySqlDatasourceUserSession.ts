import FieldDef from "../../FieldDef";
import IFieldDef from "../../IFieldDef";
import IRecord from "../../IRecord";
import Record from "../../Record";
import MySqlDatasource from "../MySqlDatasource";
jest.mock("../MySqlDatasource");

//even though property getters are documented in Jest they do not work @28.1.3.
//fixed - but i'm pretty sure the changes were never merged to master! :(
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


const mockLoadResult1 = [
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 1)
            .set('StartDate', '2001-01-01 12:34:56.000')
            .set('EndDate', null)
            .set('UserId', 101)),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 2)
            .set('StartDate', '2001-01-03 12:34:56.000')
            .set('EndDate', null)
            .set('UserId', 103)),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 3)
            .set('StartDate', '2001-01-03 12:34:56.000')
            .set('EndDate', null)
            .set('UserId', 103)),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 5)
            .set('StartDate', '2001-01-05 12:34:56.000')
            .set('EndDate', '2001-02-05 12:34:56.000')
            .set('UserId', 105))
];

const mockLoadResult2 = [
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 6)
            .set('StartDate', '2001-01-06 12:34:56.000')
            .set('EndDate', null)
            .set('UserId', 106))
];

const mockLoadFn = async function (fields: Array<string> = null, filter: string = null, maxRows: number = 100) {
    const id = filter.substring("Id = ".length, "Id = ".length + 1);
    const activeOnly = filter.substring("Id = ".length + 1) == ' AND EndDate IS NULL';

    if (id == '6') {
        return mockLoadResult2;
    }
    return mockLoadResult1.filter(r => r.getField('Id').value == id && (activeOnly ? r.getField('EndDate').value === null : true));
}
const mockLoadForUserFn = async function (fields: Array<string> = null, filter: string = null, maxRows: number = 100) {
    const userId = filter.substring("UserId = ".length, filter.length - " AND EndDate IS NULL".length);

    return mockLoadResult1.filter(r => r.getField('UserId').value == userId);
}
export const mockLoad = jest
    .spyOn(MySqlDatasource.prototype, 'load')
    .mockImplementation((fields: Array<string> = null, filter: string = null, maxRows: number = 100) => {
        if (filter.startsWith('Id')) {
            return mockLoadFn(fields, filter, maxRows);
        }
        return mockLoadForUserFn(fields, filter, maxRows);
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