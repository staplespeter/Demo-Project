const mysqlx = require('@mysql/xdevapi');
import { mysqlxConfig } from "../appdata";
import Dao from "../Dao";
import DaoFieldDef from "../DaoFieldDef";
import DaoRecord from "../DaoRecord";
import IDaoRecord from "../IDaoRecord";
import { DaoTypes } from "../types";

export default class MySqlDao extends Dao {
    private _populate: boolean = false;
    private _session: any = null;
    private _result: any = null;

    //assumption is that MySQL/XDevAPI RowResult.fetchOne() will request row at  time from the server
    //docs are not clear if this is the case or entire results set cached in client and only flushed one at a a time.
    //https://dev.mysql.com/doc/dev/connector-nodejs/8.0/module-RowResult.html#fetchOne__anchor
    //toArray() suggests it may be the latter - cached in client and flushed one at a time.
    //Also as fetchOne() returns an Array, not a Promise, it must be assumed that the entire result is cached on client.
    //todo: Ignore "populate" and also simplify code
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
        this._fieldDefs = new Array();
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
            let fieldDefs = this._factory.fieldDefs.get(this.objectName as DaoTypes);
            if (!fieldDefs) {
                throw new ReferenceError(`Field definitions for object ${this.objectName} not found`);
            }
            for (let column of columns) {
                let fieldDef = fieldDefs.find(fd => fd.name == column.getColumnName());
                if (!fieldDef) {
                    throw new ReferenceError(`Field definition for field ${column.getColumnName()} not found`);
                }
                this._fieldDefs.push(fieldDef);
            }

            if (populate) {
                let dataset = this._result.fetchAll();
                for (let row of dataset) {
                    this._records.push(new DaoRecord(this._fieldDefs, row));
                }
            }
            else {
                this._records.push(new DaoRecord(this._fieldDefs, this._result.fetchOne()));
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
                    this._records.push(new DaoRecord(this._fieldDefs, dataset));
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
                    this._records.push(new DaoRecord(this._fieldDefs, row));
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

    async save(): Promise<number> {
        let table: any = null;
        try {
            this._session = await mysqlx.getSession(mysqlxConfig);
            table = this._session.getDefaultSchema().getTable(this.objectName);
            await this._session.startTransaction();

            let recordsToUpdate = this._records.filter(r => r.hasChanged);
            for (let record of recordsToUpdate) {
                if (!record.primaryKeyField) {
                    throw new ReferenceError('Primary key field is not defined.  Unable to update record');
                }

                let query = table.update()
                    .where(`${record.primaryKeyField.fieldDef.name} = ${record.primaryKeyField.value}`);
                for (let x = 0; x < record.fieldCount; x++) {
                    let field = record.getFieldByIndex(x);
                    if (field.hasChanged && !field.fieldDef.isPrimaryKey) {
                        query = query.set(field.fieldDef.name, field.value);
                    }
                }

                await query.execute();
            }

            let insertIds = [];
            let recordsToInsert = this._records.filter(r => r.isNew);
            for (let record of recordsToInsert) {
                //inserting one row at a time as there may be different sets of fields with values assigned
                let fieldNames = [];
                let fieldValues = [];
                for (let x = 0; x < record.fieldCount; x++) {
                    let field = record.getFieldByIndex(x);
                    if (field.value && !field.fieldDef.isPrimaryKey) {
                        fieldNames.push(field.fieldDef.name);
                        fieldValues.push(field.value);
                    }
                }
                let result = await table.insert(fieldNames).values(fieldValues).execute();
                insertIds.push(result.getAutoIncrementValue());
            }

            await this._session.commit();

            for (let record of recordsToUpdate) {
                for (let x = 0; x < record.fieldCount; x++) {
                    let field = record.getFieldByIndex(x);
                    if (field.hasChanged) {
                        field.save();
                    }
                }
            }

            for (let x = 0; x < recordsToInsert.length; x++) {
                if (recordsToInsert[x].primaryKeyField) {
                    recordsToInsert[x].primaryKeyField.value = insertIds[x];
                }
                for (let y = 0; y < recordsToInsert[x].fieldCount; y++) {
                    recordsToInsert[x].getFieldByIndex(y).save();
                }
            }

            return recordsToUpdate.length + recordsToInsert.length;
        }
        catch (e: any) {
            if (this._session) {
                this._session.rollback();
            }

            console.log(e);
            throw e;
        }
        finally {
            try {
                if (this._session) {
                    await this._session.close();
                    this._session = null;
                }
            }
            catch (e: any) {
                console.log(e);
            }
        }
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

    addRecord(): IDaoRecord;
    addRecord(values?: Map<string, any>): IDaoRecord {
        let row: any = [];
        if (values) {
            for (let fieldDef of this._fieldDefs) {
                if (values.has(fieldDef.name)) {
                    row.push(values.get(fieldDef.name));
                }
            }
        }

        let record = new DaoRecord(this._fieldDefs, row, true);
        this._records.push(record);
        return record;
    }
}