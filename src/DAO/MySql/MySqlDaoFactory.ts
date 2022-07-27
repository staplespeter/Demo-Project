import DaoFactory from "../DaoFactory";
import IDao from "../IDao";
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

        await mysqlx.getSession(this.config)
            .then((s: any) => {
                session = s;
                return session
                    .sql("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?")
                    .bind([this.config.schema, objectName])
                    .execute();
            })
            .then((results: any) => {
                let fieldsRecord = results.toArray();
                if (fieldsRecord.length == 0) {
                    throw new RangeError(`No results for ${this.config.schema}.${objectName}`);
                }
                let fields = fieldsRecord.flat(2);
                this.fieldDefs.set(objectName as DaoTypes, fields);
            })
            .catch((e: any) => {
                console.log(e);
                throw e;
            })
            .finally(() => {
                if (session) {
                    session.close();
                }
            });

        return new MySqlDao(this, objectName);
    }
}