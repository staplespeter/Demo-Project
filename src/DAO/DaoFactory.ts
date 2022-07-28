import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
import { DaoTypes } from "./types";

export default class DaoFactory implements IDaoFactory {
    readonly fieldDefs: Map<DaoTypes, Array<string>> = new Map<DaoTypes, Array<string>>();

    getDao(objectName: string): Promise<IDao> {
        return null;
    }
}