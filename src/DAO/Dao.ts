import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
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

    protected _fields: Array<string> = new Array();
    get fieldCount(): number {
        return this._fields.length;
    }
    getField(x: number): string {
        if (x < 0 || x >= this._fields.length) {
            return null;
        }
        return this._fields[x];
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
    abstract save(): number;
    abstract discard(): number;
    abstract first(): IDaoRecord;
    abstract last(): Promise<IDaoRecord>;
    abstract prev(): IDaoRecord;
    abstract next(): Promise<IDaoRecord>;
}