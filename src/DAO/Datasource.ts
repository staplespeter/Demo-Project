import IDaoFieldDef from "./IDaoFieldDef";
import IDaoRecord from "./IDaoRecord";
import IDatasource from "./IDatasource";
import { DaoType } from "./types";

export default abstract class Datasource implements IDatasource {
    static readonly fieldDefs: Map<DaoType, Array<IDaoFieldDef>> = new Map<DaoType, Array<IDaoFieldDef>>();
    fieldDefs: Array<IDaoFieldDef> = new Array();

    protected _objectName: DaoType;
    get objectName(): DaoType {
        return this._objectName;
    }

    
    //static getFieldDefs(objectName: DaoType): Array<IDaoFieldDef>;
    abstract load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<Array<any>>>;
    abstract save(recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>): Promise<number>;
}