import Dao from "./Dao";
import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
import IDaoFieldDef from "./IDaoFieldDef";
import IDatasource from "./IDatasource";
import MySqlDatasource from "./MySql/MySqlDatasource";
import { DaoType, DatasourceType } from "./types";

export default class DaoFactory implements IDaoFactory {
    static readonly fieldDefs: Map<DaoType, Array<IDaoFieldDef>> = new Map<DaoType, Array<IDaoFieldDef>>();

    static async getDao(sourceType: DatasourceType, objectName: DaoType): Promise<IDao> {
        let dataSource: IDatasource = null;

        switch (sourceType) {
            case 'MySQL': {
                    if (!DaoFactory.fieldDefs.has(objectName as DaoType)) {
                        DaoFactory.fieldDefs.set(objectName as DaoType, await MySqlDatasource.getFieldDefs(objectName));
                    }
                    dataSource = new MySqlDatasource(this, objectName);
                }
                break;
            default: throw new TypeError('Unknown source type');
        }

        return new Dao(this, dataSource);
    }
}