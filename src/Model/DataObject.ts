import DaoFactory from '../Dao/DaoFactory';
import IDao from '../Dao/IDao';

export default class DataObject {
    protected _dao: IDao<DataObject>;
}