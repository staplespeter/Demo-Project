import { DaoType, DatasourceType } from "./types";
import IRecordset from "./IRecordset";
import IFieldDef from "./IFieldDef";

export default interface IDaoFactory {
    //TypeScript won't allow static members on an interface.  Pointless.
    //static getDao(sourceType: DatasourceType, objectName: DaoType): Promise<IDao>;
}