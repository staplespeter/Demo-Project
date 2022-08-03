import { DaoTypes } from "./types";
import IDao from "./IDao";
import IDaoFieldDef from "./IDaoFieldDef";

export default interface IDaoFactory {
    fieldDefs: Map<DaoTypes, Array<IDaoFieldDef>>;
    getDao(objectName: string): Promise<IDao>;
}