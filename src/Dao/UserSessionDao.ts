import UserSession from "../Model/UserSession";
import DaoFactory from "./DaoFactory";
import IDao from "./IDao";
import IRecordset from "./IRecordset";

export default class UserSessionDao implements IDao<UserSession> {
    private _rs: IRecordset = null;

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
        else if (this._rs.recordCount== 1) {
            const us = new UserSession(this);
            us.id = this._rs.currentRecord.getField('Id').value;
            us.startDate = new Date(this._rs.currentRecord.getField('StartDate').value);
            us.endDate = new Date(this._rs.currentRecord.getField('EndDate').value);
            us.userId = this._rs.currentRecord.getField('UserId').value;
            return us;
        }
    }

    async save(o: UserSession) {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'UserSession');
        }
        let dataMap = new Map();
        dataMap.set('UserId', o.userId);
        dataMap.set('StartDate', o.startDate.toISOString());
        this._rs.addRecord(dataMap);
        if (await this._rs.save() > 0) {
            o.id = this._rs.currentRecord.getField('Id').value;
        }
    }
}