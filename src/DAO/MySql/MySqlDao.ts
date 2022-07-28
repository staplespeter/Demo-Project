const mysqlx = require('@mysql/xdevapi');
import { mysqlxConfig } from "../appdata";
import Dao from "../Dao";
import DaoRecord from "../DaoRecord";
import IDaoRecord from "../IDaoRecord";

export default class MySqlDao extends Dao {
    private _populate: boolean = false;
    private _session: any = null;
    private _result: any = null;

    //assumption is that MySQL/XDevAPI RowResult.fetchOne() will request row at  time from the server
    //docs are not clear if this is the case or entire results set cached in client and only flushed one at a a time.
    //https://dev.mysql.com/doc/dev/connector-nodejs/8.0/module-RowResult.html#fetchOne__anchor
    //toArray() suggests it may be the latter - cached in client and flushed one at a time.
    //Also as fetchOne() returns an Array, not a Promise, it must be assumed that the entire result is cached on client.
    //Ignore "populate" and also simplify code? 
    async load(fields: Array<string> = null, filter: string = null, populate: boolean = true): Promise<number> {
        if (!fields || fields.length == 0) {
            fields = null;
        }
        if (!filter || filter == '') {
            filter = null;
        }
        
        this._populate = populate ?? false;
        this._currentRecordIndex = null;
        this._currentRecord = null;
        this._records = new Array();
        this._fields = new Array();
        this._bof = false;
        this._eof = false;

        let error = false;
        try {
            this._session = await mysqlx.getSession(mysqlxConfig);
            let query = this._session.getDefaultSchema().getTable(this.objectName);
            query = fields ? query.select(fields) : query.select();
            query = filter ? query.where(filter) : query;
            this._result = await query.execute();

            let columns = this._result.getColumns();
            for (let column of columns) {
                //using the column alias
                this._fields.push(column.getColumnLabel());
            }

            if (populate) {
                let dataset = this._result.fetchAll();
                for (let row of dataset) {
                    this._records.push(new DaoRecord(row, this._fields));
                }
            }
            else {
                this._records.push(new DaoRecord(this._result.fetchOne(), this._fields));
            }
            if (this._records.length > 0) {
                this._currentRecordIndex = 0;
                this._currentRecord = this._records[this._currentRecordIndex];
                this._bof = true;
            }
            if (populate && this._currentRecordIndex == this._records.length - 1) {
                this._eof = true;
            }
        }
        catch (e: any) {
            console.log(e);
            error = true;
            throw e;
        }
        finally {
            try {
                if ((this._session && populate) || (this._session && error)) {
                    await this._session.close();
                    this._session = null;
                }
            }
            catch (e: any) {
                console.log(e);
            }
        }

        return this.recordCount;
    }

    async next(): Promise<IDaoRecord> {
        if (this._currentRecordIndex == null) {
            return null;
        }
        if (this._eof) {
            return this._currentRecord;
        }

        //if not populated and at the end of the records and session still open
        //then try to load the next one
        if (!this._populate
            && this._session
            && (this._currentRecordIndex == this._records.length - 1))
        {
            let error = false;
            let dataset: any;
            try {
                dataset = this._result.fetchOne();
                if (dataset) {
                    this._records.push(new DaoRecord(dataset, this._fields));
                }
            }
            catch (e: any) {
                console.log(e);
                error = true;
                throw e;
            }
            finally {
                try {
                    if (!dataset || error) {
                        await this._session.close();
                        this._session = null;
                    }
                }
                catch (e: any) {
                    console.log(e);
                }
            }
        }

        if (this._currentRecordIndex < this._records.length - 1) {
            this._currentRecordIndex++;
            this._currentRecord = this._records[this._currentRecordIndex];
        }
        this._bof = this._currentRecordIndex == 0;
        if ((this._populate || this._session == null)
            && this._currentRecordIndex == this._records.length - 1)
        {
            this._eof = true;
        }

        return this._currentRecord;
    }

    async last(): Promise<IDaoRecord> {
        if (this._currentRecordIndex == null) {
            return null;
        }
        if (this._eof) {
            return this._currentRecord;
        }

        //if not populated and session still open
        //then try to load the rest of the records
        if (!this._populate && this._session) {
            let error = false;
            let dataset: any;
            try {
                dataset = this._result.fetchAll();
                for (let row of dataset) {
                    this._records.push(new DaoRecord(row, this._fields));
                }
            }
            catch (e: any) {
                console.log(e);
                error = true;
                throw e;
            }
            finally {
                try {
                    await this._session.close();
                    this._session = null;
                }
                catch (e: any) {
                    console.log(e);
                }
            }
        }

        this._currentRecordIndex = this._records.length - 1;
        this._currentRecord = this._records[this._currentRecordIndex];
        this._bof = this._currentRecordIndex == 0;
        if (this._populate || this._session == null) {
            this._eof = true;
        }

        return this._currentRecord;
    }

    prev(): IDaoRecord {
        if (this._currentRecordIndex == null) {
            return null;
        }
        if (this._bof) {
            return this._currentRecord;
        }

        if (this._currentRecordIndex > 0) {
            this._currentRecordIndex--;
            this._currentRecord = this._records[this._currentRecordIndex];
        }
        this._bof = this._currentRecordIndex == 0;
        this._eof = this._currentRecordIndex == this._records.length - 1;

        return this._currentRecord;
    }

    first(): IDaoRecord {
        if (this._currentRecordIndex == null) {
            return null;
        }
        if (this._bof) {
            return this._currentRecord;
        }

        this._currentRecordIndex = 0;
        this._currentRecord = this._records[this._currentRecordIndex];
        this._bof = true;
        this._eof = this._currentRecordIndex == this._records.length - 1;

        return this._currentRecord;
    }

    save(): number {
        return 0;
    }

    discard(): number {
        return 0;
    }
}