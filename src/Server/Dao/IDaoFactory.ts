import IRecordset from "./IRecordset";
import IFieldDef from "./IFieldDef";

export default interface IDaoFactory {
    //TypeScript won't allow static members on an interface.  Pointless.
    //static getDatasource(sourceType: Dao.DatasourceType, objectName: Dao.DaoType): Promise<IDatasource>;
    //static getRecordSet(sourceType: Dao.DatasourceType, objectName: Dao.DaoType): Promise<IRecordset>;
}