const mysqlx = require('@mysql/xdevapi');
import { mysqlxConfig } from "../appdata";
import Dao from "../Dao";
import DaoFieldDef from "../DaoFieldDef";
import DaoRecord from "../DaoRecord";
import IDaoRecord from "../IDaoRecord";
import { DaoTypes } from "../types";

export default class MySqlDao extends Dao {
    private _session: any = null;
    private _result: any = null;

    async load(fields: Array<string> = null, filter: string = null): Promise<number> {
        if (!fields || fields.length == 0) {
            fields = null;
        }
        if (!filter || filter == '') {
            filter = null;
        }
        
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

            let dataset = this._result.fetchAll();
            for (let row of dataset) {
                this._records.push(new DaoRecord(this._fieldDefs, row));
            }
            
            if (this._records.length > 0) {
                this._currentRecordIndex = 0;
                this._currentRecord = this._records[this._currentRecordIndex];
                this._bof = true;
                this._eof = this._currentRecordIndex == this._records.length - 1;
            }
        }
        catch (e: any) {
            console.log(e);
            error = true;
            throw e;
        }
        finally {
            try {
                if (this._session && error) {
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
        if (!this._eof) {
            if (this._currentRecordIndex < this._records.length - 1) {
                this._currentRecordIndex++;
                this._currentRecord = this._records[this._currentRecordIndex];
            }
            this._bof = this._currentRecordIndex == 0;
            if (this._currentRecordIndex == this._records.length - 1)
            {
                this._eof = true;
            }
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

        this._currentRecordIndex = this._records.length - 1;
        this._currentRecord = this._records[this._currentRecordIndex];
        this._bof = this._currentRecordIndex == 0;
        this._eof = true;

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