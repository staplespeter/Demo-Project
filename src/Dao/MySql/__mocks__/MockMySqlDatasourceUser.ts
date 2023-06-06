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
    new FieldDef('Id', true),
    new FieldDef('Email'),
    new FieldDef('PasswordHash'),
    new FieldDef('PasswordSalt'),
    new FieldDef('DateRegistered')
];
export const mockGetFieldDefs = jest
    .spyOn(MySqlDatasource, 'getFieldDefs')
    .mockResolvedValue(mockFieldDefs);
MySqlDatasource.fieldDefs.set('User', mockFieldDefs);


const mockLoadResult = [
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 1)
            .set('Email', 'test@test1.com')
            .set('PasswordHash', 'testpasswordhash1')
            .set('PasswordSalt', 'testpasswordsalt1')
            .set('DateRegistered', '2001-01-01 12:34:56')),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 3)
            .set('Email', 'test@test3.com')
            .set('PasswordHash', 'testpasswordhash3')
            .set('PasswordSalt', 'testpasswordsalt3')
            .set('DateRegistered', '2001-01-03 12:34:56')),
    new Record(mockFieldDefs,
        new Map<string, any>()
            .set('Id', 3)
            .set('Email', 'test@test3.com')
            .set('PasswordHash', 'testpasswordhash3')
            .set('PasswordSalt', 'testpasswordsalt3')
            .set('DateRegistered', '2001-01-03 12:34:56'))
];
const mockLoadFn = async function (fields: Array<string> = null, filter: string = null, maxRows: number = 100) {
    const flds= fields;
    const email = filter.substring("'Email' = \"".length, filter.length - 1);

    return mockLoadResult.filter(r => r.getField('Email').value == email);
}
export const mockLoad = jest
    .spyOn(MySqlDatasource.prototype, 'load')
    .mockImplementation((fields: Array<string> = null, filter: string = null, maxRows: number = 100) => {
        return mockLoadFn(fields, filter, maxRows);
    });

const mockSaveFn = async function (records: Array<IRecord>) {
    if (records[0].getField('Email').value == 'test@test4.com') {
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

export const mockMySqlDataSourceUser = new MySqlDatasource('User');
mockMySqlDataSourceUser.fieldDefs = mockFieldDefs;