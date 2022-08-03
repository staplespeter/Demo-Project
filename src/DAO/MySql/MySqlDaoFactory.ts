import DaoFactory from "../DaoFactory";
import DaoFieldDef from "../DaoFieldDef";
import IDao from "../IDao";
import IDaoFieldDef from "../IDaoFieldDef";
import { DaoTypes, MySqlDaoFactoryConfig } from "../types";
import MySqlDao from "./MySqlDao";
const mysqlx = require('@mysql/xdevapi');

export default class MySqlDaoFactory extends DaoFactory {
    readonly config: MySqlDaoFactoryConfig = null;

    constructor(config: MySqlDaoFactoryConfig) {
        super();
        this.config = config;
    }

    async getDao(objectName: string): Promise<IDao> {
        let session: any = null;

        if (!this.fieldDefs.has(objectName as DaoTypes)) {
            await mysqlx.getSession(this.config)
                .then((s: any) => {
                    session = s;
                    return session
                        .sql("SELECT COLUMN_NAME, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?")
                        .bind([this.config.schema, objectName])
                        .execute();
                })
                .then((results: any) => {
                    let fieldsRecord = results.toArray();
                    if (fieldsRecord.length == 0) {
                        throw new RangeError(`No column definitions for ${this.config.schema}.${objectName}`);
                    }
                    let fields = fieldsRecord.flat();
                    let fieldDefs = new Array<IDaoFieldDef>();
                    for (let field of fields) {
                        fieldDefs.push(new DaoFieldDef(field[0], field[1] == 'PRI'));
                    }
                    this.fieldDefs.set(objectName as DaoTypes, fieldDefs);
                })
                .catch((e: any) => {
                    console.log(e);
                    throw e;
                })
                .finally(() => {
                    if (session) {
                        return session.close();
                    }
                });
        }

        return new MySqlDao(this, objectName);
    }
}