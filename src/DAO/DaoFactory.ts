import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
import IDaoFieldDef from "./IDaoFieldDef";
import { DaoTypes } from "./types";

//todo: replace MySQL factory with factory method here.
//method takes a type parameter or there is a method for each type
//todo: separate DAO into recordset and dataset.
//factory will then create datasets not DAOs.
//can remove factory entirely unless wishing to switch datastore using external config 
export default class DaoFactory implements IDaoFactory {
    readonly fieldDefs: Map<DaoTypes, Array<IDaoFieldDef>> = new Map<DaoTypes, Array<IDaoFieldDef>>();

    getDao(objectName: string): Promise<IDao> {
        return null;
    }
}