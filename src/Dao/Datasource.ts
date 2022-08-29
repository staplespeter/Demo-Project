import IFieldDef from "./IFieldDef";
import IRecord from "./IRecord";
import IDatasource from "./IDatasource";
import { DaoType } from "./types";

export default abstract class Datasource implements IDatasource {
    static readonly fieldDefs: Map<DaoType, Array<IFieldDef>> = new Map<DaoType, Array<IFieldDef>>();
    fieldDefs: Array<IFieldDef> = new Array();

    protected _objectName: DaoType;
    get objectName(): DaoType {
        return this._objectName;
    }

    
    //static getFieldDefs(objectName: DaoType): Array<IDaoFieldDef>;
    abstract load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<Array<any>>>;
    abstract save(recordsToUpdate: Array<IRecord>, recordsToInsert: Array<IRecord>): Promise<number>;
}