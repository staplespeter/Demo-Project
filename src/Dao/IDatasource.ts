import IFieldDef from "./IFieldDef";
import IRecord from "./IRecord";
import { DaoType } from "./types";

//todo: add typed DAO interface and classes that reside at the same level as the Datasource class.
//both sets provide storage-specific implementations for data access.  The typed DAO will provide
//a use-case-specific access, as opposed to the Recordset+Datasource generic access.
export default interface IDatasource {
    //static readonly fieldDefs: Map<DaoType, Array<IDaoFieldDef>>;
    readonly objectName: DaoType;
    fieldDefs: Array<IFieldDef>;

    //static getFieldDefs(objectName: DaoType): Array<IDaoFieldDef>;
    load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<Array<any>>>;
    save(recordsToUpdate: Array<IRecord>, recordsToInsert: Array<IRecord>): Promise<number>;
}