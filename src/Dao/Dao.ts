import IDao from "./IDao";
import IRecordset from "./IRecordset";
import Recordset from "./RecordSet";

export default abstract class Dao<T> implements IDao<T> {
    protected _rs: IRecordset = null;

    constructor();
    constructor(rs: Recordset);
    constructor(rs?: Recordset) {
        this._rs = rs;
    }

    abstract load(value: any): Promise<T>;
    abstract save(o: T): Promise<void>;
}