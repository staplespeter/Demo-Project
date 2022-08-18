import DaoField from "../DaoField";
import DaoFieldDef from "../DaoFieldDef";

describe("DaoField tests", () => {
    let fieldDef = new DaoFieldDef('TestField');
    let fieldDefPk = new DaoFieldDef('TestField', true);

    it("should initialise correctly for an existing record", () => {
        let field = new DaoField(fieldDef, 'TestValue');
        expect(field.fieldDef).toEqual(fieldDef);
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('TestValue');
    });

    it("can set a value for an existing record", () => {
        let field = new DaoField(fieldDef, 'TestValue');
        field.value = 'NewTestValue';
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(true);
        expect(field.oldValue).toEqual('TestValue');
        expect(field.value).toEqual('NewTestValue');

        field.value = 'NewTestValue2';
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(true);
        expect(field.oldValue).toEqual('TestValue');
        expect(field.value).toEqual('NewTestValue2');
    });

    it("cannot set a value on a Primary Key field for an existing record", () => {
        let field = new DaoField(fieldDefPk, 'TestValue');
        field.value = 'NewTestValue';
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('TestValue');
    });

    it("can discard changes for an existing record", () => {
        let field = new DaoField(fieldDef, 'TestValue');
        field.value = 'NewTestValue';
        field.discard();
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('TestValue');

        field.value = 'NewTestValue';
        field.value = 'TestValue';
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('TestValue');
    });

    it("can save changes for an existing record", () => {
        let field = new DaoField(fieldDef, 'TestValue');
        field.value = 'NewTestValue';
        field.save();
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('NewTestValue');
    });

    it("should initialise correctly for an new record", () => {
        let field = new DaoField(fieldDef, 'TestValue', true);
        expect(field.fieldDef).toEqual(fieldDef);
        expect(field.isNew).toEqual(true);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('TestValue');
    });

    it("can set a value for a new record", () => {
        let field = new DaoField(fieldDef, 'TestValue', true);
        field.value = 'NewTestValue';
        expect(field.isNew).toEqual(true);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('NewTestValue');

        field.value = 'NewTestValue2';
        expect(field.isNew).toEqual(true);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('NewTestValue2');
    });


    it("can set a value on a Primary Key field for a new record", () => {
        let field = new DaoField(fieldDefPk, 'TestValue', true);
        field.value = 'NewTestValue';
        expect(field.isNew).toEqual(true);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('NewTestValue');
    });

    it("cannot discard changes for a new record", () => {
        let field = new DaoField(fieldDef, 'TestValue', true);
        field.value = 'NewTestValue';
        field.discard();
        expect(field.isNew).toEqual(true);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('NewTestValue');
    });

    it("can save changes for a new record", () => {
        let field = new DaoField(fieldDef, 'TestValue', true);
        field.value = 'NewTestValue';
        field.save();
        expect(field.isNew).toEqual(false);
        expect(field.hasChanged).toEqual(false);
        expect(field.oldValue).toBeUndefined();
        expect(field.value).toEqual('NewTestValue');
    });
});