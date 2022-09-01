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

    
    //static getFieldDefs(objectName: DaoType): Array<IFieldDef>;
    abstract load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<IRecord>>;
    abstract save(records: Array<IRecord>): Promise<number>;
}