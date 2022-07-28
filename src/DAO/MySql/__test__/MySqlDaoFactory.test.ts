import MySqlDaoFactory from "../MySqlDaoFactory";
import MySqlDao from "../MySqlDao";
import { mysqlxTestConfig } from '../../__test__/appdata';

describe("MySqlDaoFactory tests", () => {
    it("can return a MySqlDao object with no records", async () => {
        let factory = new MySqlDaoFactory(mysqlxTestConfig);
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
        expect(userTable.fieldCount).toEqual(0);
        expect(userTable.recordCount).toEqual(0);
        expect(userTable.currentRecord).toEqual(null);
    });
});