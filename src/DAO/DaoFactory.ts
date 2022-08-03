import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
import IDaoFieldDef from "./IDaoFieldDef";
import { DaoTypes } from "./types";

export default class DaoFactory implements IDaoFactory {
    readonly fieldDefs: Map<DaoTypes, Array<IDaoFieldDef>> = new Map<DaoTypes, Array<IDaoFieldDef>>();

    getDao(objectName: string): Promise<IDao> {
        return null;
    }
}