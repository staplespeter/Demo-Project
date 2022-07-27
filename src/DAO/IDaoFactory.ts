import { DaoTypes } from "./types";
import IDao from "./IDao";

export default interface IDaoFactory {
    fieldDefs: Map<DaoTypes, Array<string>>;
    getDao(objectName: string): Promise<IDao>;
}