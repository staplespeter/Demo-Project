import MySqlDaoFactory from "../MySqlDaoFactory";
import MySqlDao from "../MySqlDao";
const mysqlxConfig = { host: 'localhost', port: 33060, user: 'TestRunner', password: 'TestRunner', schema: 'DemoProject' };

describe("MySqlDaoFactory tests", () => {
    it("can return a MySqlDao object with no records", async () => {
        let factory = new MySqlDaoFactory(mysqlxConfig);
        let userTable = await factory.getDao("User");

        expect(factory.fieldDefs.size).toEqual(1);
        expect(factory.fieldDefs.has("User")).toBe(true);

        let userFields = factory.fieldDefs.get("User");
        expect(userFields.length).toEqual(5);
        expect(userFields.findIndex((element) => element == "Id")).toBeGreaterThanOrEqual(0);
        expect(userFields.findIndex((element) => element == "Email")).toBeGreaterThanOrEqual(0);
        expect(userFields.findIndex((element) => element == "PasswordHash")).toBeGreaterThanOrEqual(0);
        expect(userFields.findIndex((element) => element == "PasswordSalt")).toBeGreaterThanOrEqual(0);
        expect(userFields.findIndex((element) => element == "DateRegistered")).toBeGreaterThanOrEqual(0);

        expect(userTable instanceof MySqlDao).toEqual(true);
        expect(userTable.objectName).toEqual("User");
        expect(userTable.fields.length).toEqual(0);
        expect(userTable.records).toEqual(null);
        expect(userTable.currentRecord).toEqual(null);
        expect(userTable.filterField).toEqual(null);
        expect(userTable.filterValue).toEqual(null);
    });
});