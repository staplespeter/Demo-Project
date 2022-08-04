import { DaoType, DatasourceType } from "./types";
import IDao from "./IDao";
import IDaoFieldDef from "./IDaoFieldDef";

export default interface IDaoFactory {
    //TypeScript won't allow static members.  Pointless.
    //static fieldDefs: Map<DaoType, Array<IDaoFieldDef>>;
    //static getDao(sourceType: DatasourceType, objectName: DaoType): Promise<IDao>;
}