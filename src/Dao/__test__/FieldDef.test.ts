import FieldDef from "../FieldDef";

describe('DaoField tests', () => {
    it('can initialise correctly', () => {
        let fieldDef = new FieldDef('TestDef');
        expect(fieldDef.name).toEqual('TestDef');
        expect(fieldDef.isPrimaryKey).toEqual(false);

        fieldDef = new FieldDef('TestDef', true);
        expect(fieldDef.name).toEqual('TestDef');
        expect(fieldDef.isPrimaryKey).toEqual(true);
    });
});