import IDaoFieldDef from "./IDaoFieldDef";
import IDaoRecord from "./IDaoRecord";
import { DaoType } from "./types";

export default interface IDatasource {
    //static readonly fieldDefs: Map<DaoType, Array<IDaoFieldDef>>;
    readonly objectName: DaoType;
    fieldDefs: Array<IDaoFieldDef>;

    //static getFieldDefs(objectName: DaoType): Array<IDaoFieldDef>;
    load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<Array<any>>>;
    save(recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>): Promise<number>;
}