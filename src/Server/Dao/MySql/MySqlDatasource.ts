import mysqlx from '@mysql/xdevapi';
import { mysqlxConfig } from "../appdata";
import { mysqlxTestConfig } from "../__test__/appdata";
import FieldDef from "../FieldDef";
import Datasource from "../Datasource";
import IFieldDef from "../IFieldDef";
import IRecord from "../IRecord";
import { DaoType } from "../types";
import Record from "../Record";

export default class MySqlDatasource extends Datasource {
    private static mySqlConfig = process.env.NODE_ENV == 'test' ? mysqlxTestConfig : mysqlxConfig;

    static async getFieldDefs(objectName: DaoType): Promise<Array<IFieldDef>> {
        let session: any = null;

        try {
            session = await mysqlx.getSession(MySqlDatasource.mySqlConfig);
            let results = await session
                .sql("SELECT COLUMN_NAME, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?")
                .bind([mysqlxConfig.schema, objectName])
                .execute();
            let fieldsRecord = results.toArray();
            if (fieldsRecord.length == 0) {
                throw new RangeError(`No column definitions for ${mysqlxConfig.schema}.${objectName}`);
            }
            let fields = fieldsRecord.flat();
            let localFieldDefs = new Array<IFieldDef>();
            for (let field of fields) {
                localFieldDefs.push(new FieldDef(field[0], field[1] == 'PRI'));
            }

            return localFieldDefs;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        finally {
            if (session) {
                await session.close();
            }
        }
    }

    constructor(objectName: DaoType) {
        super();
        this._objectName = objectName;
        this.fieldDefs = MySqlDatasource.fieldDefs.get(objectName as DaoType);
        if (!this.fieldDefs) {
            throw new ReferenceError(`Field definitions for object ${this._objectName} not found`);
        }
    }

    async load(fields: Array<string> = null, filter: string = null, maxRows: number = 100): Promise<Array<IRecord>> {
        if (!fields || fields.length == 0) {
            fields = null;
        }
        if (!filter || filter == '') {
            filter = null;
        }
        
        const sourceFieldDefs = MySqlDatasource.fieldDefs.get(this._objectName as DaoType);
        if (!sourceFieldDefs) {
            throw new ReferenceError(`Field definitions for object ${this._objectName} not found`);
        }
        const fieldNames = fields ? fields : ((fds: IFieldDef[]) => { 
            const fns: string[] = [];
            fds.forEach(fd => fns.push(fd.name));
            return fns;
        })(sourceFieldDefs);

        let session: any = null;
        try {
            this.fieldDefs = new Array();

            session = await mysqlx.getSession(MySqlDatasource.mySqlConfig);
            let query = session.getDefaultSchema().getTable(this._objectName);
            query = query.select(fieldNames);
            query = filter ? query.where(filter) : query;
            query = query.limit(maxRows);
            let result = await query.execute();

            let columns = result.getColumns();
            for (let column of columns) {
                let fieldDef = sourceFieldDefs.find(fd => fd.name == column.getColumnName());
                if (!fieldDef) {
                    throw new ReferenceError(`Field definition for field ${column.getColumnName()} not found`);
                }
                this.fieldDefs.push(fieldDef);
            }

            let records: IRecord[] = [];
            const dataset: Array<Array<any>> = result.fetchAll();
            dataset.forEach(row => {
                const values = new Map<string, any>();
                fieldNames.forEach((fn, x) => {
                    values.set(fn, row[x]);
                });
                records.push(new Record(this.fieldDefs, values));
            });

            return records;
        }
        catch (e) {
            this.fieldDefs = sourceFieldDefs;
            console.log(e);
            throw e;
        }
        finally {
            try {
                if (session) {
                    await session.close();
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    //TODO: Add support for externally controlled transactions.
    //  This needs to extend up to the DAOs, where awareness of dependant objects resides.
    //  Any higher and DB is fully abstracted away, i.e. no transaction knowledge.
    //  Any lower and object interdependance is not abstract enough.
    async save(records: Array<IRecord>): Promise<number> {
        let session: any = null;
        if (!records || records.length == 0) {
            return 0;
        }

        if (records.some(r => r.primaryKeyField === undefined)) {
            throw new ReferenceError('Primary key field is not defined.  Unable to save records');
        }

        //TODO: handling of non-autoincremnting PK fields.
        //Checking for null or undefined on PK fields.
        const recordsToUpdate = records.filter(r => (r.primaryKeyField.value ?? null) !== null);
        const recordsToInsert = records.filter(r => (r.primaryKeyField.value ?? null) === null);
        if (recordsToUpdate.length + recordsToInsert.length == 0) {
            return 0;
        }

        try {
            session = await mysqlx.getSession(MySqlDatasource.mySqlConfig);
            let table = session.getDefaultSchema().getTable(this.objectName);
            await session.startTransaction();

            for (let record of recordsToUpdate) {
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

            await session.commit();

            for (let x = 0; x < recordsToInsert.length; x++) {
                recordsToInsert[x].primaryKeyField.value = insertIds[x];
            }

            for (let record of records) {
                for (let x = 0; x < record.fieldCount; x++) {
                    let field = record.getFieldByIndex(x);
                    if (field.isNew || field.hasChanged) {
                        field.save();
                    }
                }
            }

            return records.length;
        }
        catch (e) {
            if (session) {
                session.rollback();
            }

            console.log(e);
            throw e;
        }
        finally {
            try {
                if (session) {
                    await session.close();
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}