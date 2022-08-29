import FieldDef from "../FieldDef";

describe('Field tests', () => {
    it('can initialise correctly', () => {
        let fieldDef = new FieldDef('TestDef');
        expect(fieldDef.name).toEqual('TestDef');
        expect(fieldDef.isPrimaryKey).toEqual(false);

        fieldDef = new FieldDef('TestDef', true);
        expect(fieldDef.name).toEqual('TestDef');
        expect(fieldDef.isPrimaryKey).toEqual(true);
    });
});