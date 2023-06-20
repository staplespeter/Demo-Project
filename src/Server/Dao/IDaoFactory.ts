import { DaoType, DatasourceType } from "./types";
import IRecordset from "./IRecordset";
import IFieldDef from "./IFieldDef";

export default interface IDaoFactory {
    //TypeScript won't allow static members on an interface.  Pointless.
    //static getDatasource(sourceType: DatasourceType, objectName: DaoType): Promise<IDatasource>;
    //static getRecordSet(sourceType: DatasourceType, objectName: DaoType): Promise<IRecordset>;
}