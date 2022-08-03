import DaoFieldDef from "../DaoFieldDef";

describe('DaoField tests', () => {
    it('can initialise correctly', () => {
        let fieldDef = new DaoFieldDef('TestDef');
        expect(fieldDef.name).toEqual('TestDef');
        expect(fieldDef.isPrimaryKey).toEqual(false);

        fieldDef = new DaoFieldDef('TestDef', true);
        expect(fieldDef.name).toEqual('TestDef');
        expect(fieldDef.isPrimaryKey).toEqual(true);
    });
});