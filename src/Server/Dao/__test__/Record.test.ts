import FieldDef from "../FieldDef";
import Record from "../Record";

describe("Record tests", () => {
    let fieldDefs = [
        new FieldDef('TestDef1', true),
        new FieldDef('TestDef2')
    ];

    it ('can be initialised correctly for an existing record', () => {
        let record = new Record(fieldDefs, new Map<string, any>()
            .set('TestDef1', 1)
            .set('TestDef2', 'TestValue2'));
        expect(record.fieldCount).toEqual(2);
        expect(record.isNew).toEqual(false);
        expect(record.hasChanged).toEqual(false);
        expect(record.getFieldByIndex(0)).toEqual(record.primaryKeyField);
        expect(record.getFieldByIndex(0).fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0).value).toEqual(1);
        expect(record.getFieldByIndex(1).fieldDef.name).toEqual('TestDef2');
        expect(record.getFieldByIndex(1).value).toEqual('TestValue2');
    });

    it ('can be initialised correctly for a new record with no field values', () => {
        let record = new Record(fieldDefs, null, true);
        expect(record.fieldCount).toEqual(2);
        expect(record.isNew).toEqual(true);
        expect(record.hasChanged).toEqual(false);
        expect(record.primaryKeyField.fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0)).toEqual(record.primaryKeyField);
        expect(record.getFieldByIndex(0).fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0).value).toBeNull()
        expect(record.getFieldByIndex(1).fieldDef.name).toEqual('TestDef2');
        expect(record.getFieldByIndex(1).value).toBeNull();

        record = new Record(fieldDefs, new Map<string, any>(), true);
        expect(record.fieldCount).toEqual(2);
        expect(record.isNew).toEqual(true);
        expect(record.hasChanged).toEqual(false);
        expect(record.primaryKeyField.fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0)).toEqual(record.primaryKeyField);
        expect(record.getFieldByIndex(0).fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0).value).toBeNull()
        expect(record.getFieldByIndex(1).fieldDef.name).toEqual('TestDef2');
        expect(record.getFieldByIndex(1).value).toBeNull();
    });

    it ('can be initialised correctly for a new record with field values', () => {
        let record = new Record(fieldDefs, new Map<string, any>()
            .set('TestDef1', 1)
            .set('TestDef2', 'TestValue2')
            .set('MissingDef', 'MissingTestValue'), true);
        expect(record.fieldCount).toEqual(2);
        expect(record.isNew).toEqual(true);
        expect(record.hasChanged).toEqual(false);
        expect(record.primaryKeyField.fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0)).toEqual(record.primaryKeyField);
        expect(record.getFieldByIndex(0).fieldDef.name).toEqual('TestDef1');
        expect(record.getFieldByIndex(0).value).toEqual(1);
        expect(record.getFieldByIndex(1).fieldDef.name).toEqual('TestDef2');
        expect(record.getFieldByIndex(1).value).toEqual('TestValue2');
    });

    it('will throw an exception if no field definitions are supplied during initialisation', () => {
        let f = () => { new Record(null, new Map<string, any>()) };
        expect(f).toThrow('No field definitions');

        f = () => { new Record([], new Map<string, any>()) };
        expect(f).toThrow('No field definitions');
    })

    it('can get a field by name', () => {
        let record = new Record(fieldDefs, new Map<string, any>()
            .set('TestDef1', 1)
            .set('TestDef2', 'TestValue2'));
        expect(record.getField('TestDef2')).toEqual(record.getFieldByIndex(1));
    });

    it('can determine if any fields have changed on an existing record', () => {
        let record = new Record(fieldDefs, new Map<string, any>()
            .set('TestDef1', 1)
            .set('TestDef2', 'TestValue2'));
        expect(record.isNew).toEqual(false);
        expect(record.hasChanged).toEqual(false);

        record.getField('TestDef2').value = 'NewTestValue2';
        expect(record.isNew).toEqual(false);
        expect(record.hasChanged).toEqual(true);
    });

    it("can discard changes on an existing record", () => {
        let record = new Record(fieldDefs, new Map<string, any>()
        .set('TestDef1', 1)
        .set('TestDef2', 'TestValue2'));
        expect(record.getFieldByIndex(1).value).toEqual('TestValue2');
        expect(record.getFieldByIndex(1).oldValue).toBeNull();
        expect(record.hasChanged).toEqual(false);
        
        record.getFieldByIndex(0).value = 2;
        record.getFieldByIndex(1).value = 'NewTestValue2';
        expect(record.getFieldByIndex(0).value).toEqual(1);
        expect(record.getFieldByIndex(0).oldValue).toBeNull();
        expect(record.getFieldByIndex(1).value).toEqual('NewTestValue2');
        expect(record.getFieldByIndex(1).oldValue).toEqual('TestValue2');
        expect(record.hasChanged).toEqual(true);
        
        record.discard();
        expect(record.getFieldByIndex(0).value).toEqual(1);
        expect(record.getFieldByIndex(0).oldValue).toBeNull();
        expect(record.getFieldByIndex(1).value).toEqual('TestValue2');
        expect(record.getFieldByIndex(1).oldValue).toBeNull();
        expect(record.hasChanged).toEqual(false);
    });

    it("cannot discard changes on a new record", () => {
        let record = new Record(fieldDefs, new Map<string, any>()
            .set('TestDef1', null)
            .set('TestDef2', 'TestValue2'), true);
        expect(record.getFieldByIndex(1).value).toEqual('TestValue2');
        expect(record.getFieldByIndex(1).oldValue).toBeNull();
        expect(record.hasChanged).toEqual(false);

        record.getFieldByIndex(1).value = 'NewTestValue2';
        expect(record.getFieldByIndex(1).value).toEqual('NewTestValue2');
        expect(record.getFieldByIndex(1).oldValue).toBeNull();
        expect(record.hasChanged).toEqual(false);
        
        record.discard();
        expect(record.getFieldByIndex(1).value).toEqual('NewTestValue2');
        expect(record.getFieldByIndex(1).oldValue).toBeNull();
        expect(record.hasChanged).toEqual(false);
    });

    //todo: record specific load and save
    // it("can reload a record that has changed in the database", () => {
    //     expect(false).toBe(true);
    // });

    // it("can save changes on an existing record", () => {
    //     expect(false).toBe(true);
    // });

    // it("can save changes on a new record", () => {
    //     expect(false).toBe(true);
    // });
});