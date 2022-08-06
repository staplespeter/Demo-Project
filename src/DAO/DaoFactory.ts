import Dao from "./Dao";
import IDao from "./IDao";
import IDaoFactory from "./IDaoFactory";
import IDaoFieldDef from "./IDaoFieldDef";
import IDatasource from "./IDatasource";
import MySqlDatasource from "./MySql/MySqlDatasource";
import { DaoType, DatasourceType } from "./types";

export default class DaoFactory implements IDaoFactory {
    static async getDao(sourceType: DatasourceType, objectName: DaoType): Promise<IDao> {
        let dataSource: IDatasource = null;

        switch (sourceType) {
            case 'MySQL': {
                    if (!MySqlDatasource.fieldDefs.has(objectName as DaoType)) {
                        MySqlDatasource.fieldDefs.set(objectName as DaoType, await MySqlDatasource.getFieldDefs(objectName));
                    }
                    dataSource = new MySqlDatasource(objectName);
                }
                break;
            default: throw new TypeError('Unknown source type');
        }

        return new Dao(dataSource);
    }
}