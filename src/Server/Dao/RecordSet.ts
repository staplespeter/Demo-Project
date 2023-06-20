import Record from "./Record";
import IRecordset from "./IRecordset";
import IRecord from "./IRecord";
import IDatasource from "./IDatasource";

export default class Recordset implements IRecordset {
    private readonly _datasource: IDatasource = null;

    readonly objectName: string;
    get fieldCount(): number {
        return this._datasource.fieldDefs.length;
    }

    private _records: Array<IRecord> = new Array();
    get recordCount(): number {
        return this._records.length;
    }
    getRecord(x: number): IRecord {
        if (x < 0 || x >= this._records.length) {
            return null;
        }
        return this._records[x];
    }

    private _currentRecordIndex: number = null;
    private _currentRecord: IRecord = null;
    get currentRecord(): IRecord {
        return this._currentRecord;
    }

    private _bof: boolean = true;
    get bof(): boolean {
        return this._bof;
    }

    private _eof: boolean = true;
    get eof(): boolean {
        return this._eof;
    }


    constructor(datasource: IDatasource) {
        this._datasource = datasource;
    }

    async load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<number> {
        this._currentRecordIndex = null;
        this._currentRecord = null;
        this._records = new Array();
        this._bof = true;
        this._eof = true;

        this._records = await this._datasource.load(fields, filter, maxRows);
        
        if (this._records.length > 0) {
            this._currentRecordIndex = 0;
            this._currentRecord = this._records[this._currentRecordIndex];
            this._bof = false;
            this._eof = false;
        }

        return this.recordCount;
    }

    async save(): Promise<number> {
        let records = this._records.filter(r => r.hasChanged || r.isNew);
        return this._datasource.save(records);
    }

    discard(): number {
        let discardedCount = 0;
        let changedRecords = this._records.filter(r => r.hasChanged);
        for (let record of changedRecords) {
            record.discard();
            discardedCount++;
        }

        return discardedCount;
    }

    addRecord(): IRecord;
    addRecord(values?: Map<string, any>): IRecord {
        if (!values) {
            values = new Map<string, any>();
        }
        let record = new Record(this._datasource.fieldDefs, values, true);
        this._records.push(record);
        this._currentRecord = record;
        this._currentRecordIndex = this._records.length - 1;
        this._bof = false;
        this._eof = false;
        return record;
    }

    //TODO: delete()
    
    prev(): IRecord {
        if (this._bof) {
            return null;
        }
        if (this._eof) {
            return this.last();
        }

        if (this._currentRecordIndex > 0) {
            this._currentRecordIndex--;
            this._currentRecord = this._records[this._currentRecordIndex];
        }
        else if (this._currentRecordIndex == 0) {
            this._bof = true;
            this._currentRecordIndex = null;
            this._currentRecord = null;
        }

        return this._currentRecord;
    }

    first(): IRecord {
        if (this._records.length == 0) {
            return null;
        }

        this._currentRecordIndex = 0;
        this._currentRecord = this._records[this._currentRecordIndex];
        this._bof = false;
        this._eof = false;

        return this._currentRecord;
    }

    next(): IRecord {
        if (this._eof) {
            return this._currentRecord;
        }
        if (this._bof) {
            return this.first();
        }
        
        if (this._currentRecordIndex < this._records.length - 1) {
            this._currentRecordIndex++;
            this._currentRecord = this._records[this._currentRecordIndex];
        }
        else if (this._currentRecordIndex == this._records.length - 1) {
            this._eof = true;
            this._currentRecordIndex = null;
            this._currentRecord = null;
        }
        
        return this._currentRecord;
    }

    last(): IRecord {
        if (this._records.length == 0) {
            return null;
        }

        this._currentRecordIndex = this._records.length - 1;
        this._currentRecord = this._records[this._currentRecordIndex];
        this._bof = false;
        this._eof = false;

        return this._currentRecord;
    }
}