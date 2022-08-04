import IDaoFactory from "./IDaoFactory";
import IDaoFieldDef from "./IDaoFieldDef";
import IDaoRecord from "./IDaoRecord";
import IDatasource from "./IDatasource";
import { DaoType } from "./types";

export default abstract class Datasource implements IDatasource {
    fieldDefs: Array<IDaoFieldDef> = new Array();

    protected _factory: IDaoFactory;
    get factory(): IDaoFactory {
        return this._factory;
    }

    protected _objectName: DaoType;
    get objectName(): DaoType {
        return this._objectName;
    }

    
    //abstract getFieldDefs(objectName: DaoType): Array<IDaoFieldDef>;
    abstract load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<Array<Array<any>>>;
    abstract save(recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>): Promise<number>;
}