import UserSession from "../Model/UserSession";
import DaoFactory from "./DaoFactory";
import IDao from "./IDao";
import IRecordset from "./IRecordset";
import Recordset from "./RecordSet";

export default class UserSessionDao implements IDao<UserSession> {
    private _rs: IRecordset = null;

    constructor();
    constructor(rs: Recordset);
    constructor(rs?: Recordset) {
        this._rs = rs;
    }

    async load(id: number): Promise<UserSession> {
        if (!this._rs) {
            //todo: move 'MySQL' to a config options file and expose as system level variable.
            this._rs = await DaoFactory.getRecordSet('MySQL', 'UserSession');
        }
        await this._rs.load(['Id', 'StartDate', 'EndDate', 'UserId'], `WHERE 'Id' = ${id}`);
        if (this._rs.recordCount == 0) {
            throw new Error(`No user session with Id ${id} found`);
        }
        else if (this._rs.recordCount > 1) {
            throw new Error(`More than one user session with Id ${id} found`);
        }
        else if (this._rs.recordCount == 1) {
            const us = new UserSession(this);
            us.id = this._rs.currentRecord.getField('Id').value;
            us.startDate = this._rs.currentRecord.getField('StartDate').value ?
                new Date(this._rs.currentRecord.getField('StartDate').value) :
                null;
            us.endDate = this._rs.currentRecord.getField('EndDate').value?
                new Date(this._rs.currentRecord.getField('EndDate').value) :
                null;
            us.userId = this._rs.currentRecord.getField('UserId').value;
            return us;
        }
    }

    async save(o: UserSession) {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'UserSession');
        }
        if (this._rs.recordCount == 0) {
            this._rs.addRecord();
        }
        this._rs.currentRecord.getField('Id').value = o.id;
        this._rs.currentRecord.getField('StartDate').value = o.startDate?.toISOString() ?? null;
        this._rs.currentRecord.getField('EndDate').value = o.endDate?.toISOString() ?? null;
        this._rs.currentRecord.getField('UserId').value = o.userId;
        
        const savedCount = await this._rs.save();
        if (savedCount == 0) {
            throw new Error('Unable to save record');
        }
        else if (savedCount > 0) {
            o.id = this._rs.currentRecord.getField('Id').value;
        }
    }
}