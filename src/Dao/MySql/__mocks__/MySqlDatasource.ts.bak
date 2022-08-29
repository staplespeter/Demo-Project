import DaoFieldDef from "../../DaoFieldDef";
import IDaoFieldDef from "../../IDaoFieldDef";
import IDaoRecord from "../../IDaoRecord";
import IDatasource from "../../IDatasource";
import { DaoType } from "../../types";

export default class MySqlDatasource implements IDatasource{
    static readonly fieldDefs: Map<DaoType, Array<IDaoFieldDef>> = new Map<DaoType, Array<IDaoFieldDef>>();

    get objectName(): DaoType {
        return 'User';
    }

    //todo: mock these field defs?
    fieldDefs: Array<IDaoFieldDef> = [
        new DaoFieldDef('TestField1', true),
        new DaoFieldDef('TestField2')
    ];

    constructor(objectName: DaoType) {
        MySqlDatasource.fieldDefs.set('User', this.fieldDefs);
    }

    async load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<Array<any>>> {
        return [
            ['TestField1Value1', 'TestField2Value1'],
            ['TestField1Value2', 'TestField2Value2'],
            ['TestField1Value3', 'TestField2Value3'],
            ['TestField1Value4', 'TestField2Value4']
        ];
    }

    async save(recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>): Promise<number>{
        return recordsToUpdate.length + recordsToInsert.length;
    }
}