import Recordset from "./RecordSet";
import IRecordset from "./IRecordset";
import IDaoFactory from "./IDaoFactory";
import IDatasource from "./IDatasource";
import MySqlDatasource from "./MySql/MySqlDatasource";


//todo: tests for DaoFactory
export default class DaoFactory implements IDaoFactory {
    static async getDataSource(sourceType: Dao.DatasourceType, objectName: Dao.DaoType): Promise<IDatasource> {
        let dataSource: IDatasource = null;

        switch (sourceType.toUpperCase()) {
            case 'MYSQL': {
                    if (!MySqlDatasource.fieldDefs.has(objectName as Dao.DaoType)) {
                        MySqlDatasource.fieldDefs.set(objectName as Dao.DaoType, await MySqlDatasource.getFieldDefs(objectName));
                    }
                    dataSource = new MySqlDatasource(objectName);
                }
                break;
            default: throw new TypeError('Unknown source type');
        }

        return dataSource;
    }

    static async getRecordSet(sourceType: Dao.DatasourceType, objectName: Dao.DaoType): Promise<IRecordset> {
        return new Recordset(await DaoFactory.getDataSource(sourceType, objectName));
    }
}