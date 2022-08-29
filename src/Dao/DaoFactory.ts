import Recordset from "./RecordSet";
import IRecordset from "./IRecordset";
import IDaoFactory from "./IDaoFactory";
import IDatasource from "./IDatasource";
import MySqlDatasource from "./MySql/MySqlDatasource";
import { DaoType, DatasourceType } from "./types";

//todo: tests for DaoFactory
export default class DaoFactory implements IDaoFactory {
    static async getDao(sourceType: DatasourceType, objectName: DaoType): Promise<IRecordset> {
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

        return new Recordset(dataSource);
    }
}