const mysqlx = require('@mysql/xdevapi');
import { mysqlxConfig } from "../appdata";
import DaoFactory from "../DaoFactory";
import DaoFieldDef from "../DaoFieldDef";
import Datasource from "../Datasource";
import IDaoFactory from "../IDaoFactory";
import IDaoFieldDef from "../IDaoFieldDef";
import IDaoRecord from "../IDaoRecord";
import { DaoType } from "../types";

export default class MySqlDatasource extends Datasource {
    static async getFieldDefs(objectName: DaoType): Promise<Array<IDaoFieldDef>> {
        let session: any = null;
        let localFieldDefs: Array<IDaoFieldDef> = null;

        try {
            session = await mysqlx.getSession(mysqlxConfig);
            let results = await session
                .sql("SELECT COLUMN_NAME, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?")
                .bind([mysqlxConfig.schema, objectName])
                .execute();
            let fieldsRecord = results.toArray();
            if (fieldsRecord.length == 0) {
                throw new RangeError(`No column definitions for ${mysqlxConfig.schema}.${objectName}`);
            }
            let fields = fieldsRecord.flat();
            let localFieldDefs = new Array<IDaoFieldDef>();
            for (let field of fields) {
                localFieldDefs.push(new DaoFieldDef(field[0], field[1] == 'PRI'));
            }

            return localFieldDefs;
        }
        catch (e: any) {
            console.log(e);
            throw e;
        }
        finally {
            if (session) {
                await session.close();
            }
        }
    }

    constructor(daoFactory: IDaoFactory, objectName: DaoType) {
        super();
        this._factory = daoFactory;
        this._objectName = objectName;
    }

    async load(fields: Array<string> = null, filter: string = null, maxRows: number = 100): Promise<Array<Array<any>>> {
        if (!fields || fields.length == 0) {
            fields = null;
        }
        if (!filter || filter == '') {
            filter = null;
        }
        
        this.fieldDefs = new Array();

        let session: any = null;
        try {
            session = await mysqlx.getSession(mysqlxConfig);
            let query = session.getDefaultSchema().getTable(this._objectName);
            query = fields ? query.select(fields) : query.select();
            query = filter ? query.where(filter) : query;
            query = query.limit(maxRows);
            let result = await query.execute();

            let columns = result.getColumns();
            let fieldDefs = DaoFactory.fieldDefs.get(this._objectName as DaoType);
            if (!fieldDefs) {
                throw new ReferenceError(`Field definitions for object ${this._objectName} not found`);
            }
            for (let column of columns) {
                let fieldDef = fieldDefs.find(fd => fd.name == column.getColumnName());
                if (!fieldDef) {
                    throw new ReferenceError(`Field definition for field ${column.getColumnName()} not found`);
                }
                this.fieldDefs.push(fieldDef);
            }

            return result.fetchAll();
        }
        catch (e: any) {
            console.log(e);
            throw e;
        }
        finally {
            try {
                if (session) {
                    await session.close();
                }
            }
            catch (e: any) {
                console.log(e);
            }
        }
    }

    async save(recordsToUpdate: Array<IDaoRecord>, recordsToInsert: Array<IDaoRecord>): Promise<number> {
        let session: any = null;
        try {
            session = await mysqlx.getSession(mysqlxConfig);
            let table = session.getDefaultSchema().getTable(this.objectName);
            await session.startTransaction();

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

            //todo: move to load fn on super class and have abstract fns for internal load
            //or move to Dao.save()
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
            catch (e: any) {
                console.log(e);
            }
        }
    }
}