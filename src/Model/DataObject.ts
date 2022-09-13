import IDao from '../Dao/IDao';

export default class DataObject {
    protected _dao: IDao<DataObject>;

    //sub class data properties should not be set directly
}