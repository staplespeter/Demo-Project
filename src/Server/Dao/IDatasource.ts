import IFieldDef from "./IFieldDef";
import IRecord from "./IRecord";

//todo: add typed DAO interface and classes that reside at the same level as the Datasource class.
//  Both sets provide storage-specific implementations for data access.  The typed DAO will provide
//  a use-case-specific access, as opposed to the Recordset+Datasource generic access.
export default interface IDatasource {
    //static readonly fieldDefs: Map<DaoType, Array<IFieldDef>>;
    readonly objectName: Dao.DaoType;
    fieldDefs: Array<IFieldDef>;

    //static getFieldDefs(objectName: DaoType): Array<IFieldDef>;
    load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<IRecord>>;
    save(records: Array<IRecord>): Promise<number>;
}