import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
import IDaoFieldDef from "./IDaoFieldDef";
import IDaoRecord from "./IDaoRecord";

export default abstract class Dao implements IDao {
    protected readonly _factory: IDaoFactory;

    protected _records: Array<IDaoRecord> = new Array();
    get recordCount(): number {
        return this._records.length;
    }
    getRecord(x: number): IDaoRecord {
        if (x < 0 || x >= this._records.length) {
            return null;
        }
        return this._records[x];
    }

    protected _fieldDefs: Array<IDaoFieldDef> = new Array();
    get fieldCount(): number {
        return this._fieldDefs.length;
    }
    getFieldDef(x: number): IDaoFieldDef {
        if (x < 0 || x >= this._fieldDefs.length) {
            return null;
        }
        return this._fieldDefs[x];
    }

    protected _currentRecordIndex: number = null;
    protected _currentRecord: IDaoRecord = null;
    get currentRecord(): IDaoRecord {
        return this._currentRecord;
    }

    protected _bof: boolean = true;
    get bof(): boolean {
        return this._bof;
    }

    protected _eof: boolean = false;
    get eof(): boolean {
        return this._eof;
    }

    readonly objectName: string = null;


    constructor(daoFactory: IDaoFactory, objectName: string) {
        this._factory = daoFactory;
        this.objectName = objectName;
    }

    abstract load(fields?: Array<string>, filter?: string, populate?: boolean): Promise<number>;
    abstract save(): Promise<number>;
    abstract discard(): number;
    abstract addRecord(): IDaoRecord;
    abstract addRecord(values?: Map<string, any>): IDaoRecord;
    abstract first(): IDaoRecord;
    abstract last(): Promise<IDaoRecord>;
    abstract prev(): IDaoRecord;
    abstract next(): Promise<IDaoRecord>;
}