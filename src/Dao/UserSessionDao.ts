import UserSession from "../Model/UserSession";
import Dao from "./Dao";
import DaoFactory from "./DaoFactory";

export default class UserSessionDao extends Dao<UserSession> {
    async load(userId: number): Promise<UserSession> {
        if (!this._rs) {
            //todo: move 'MySQL' to a config options file and expose as system level variable.
            this._rs = await DaoFactory.getRecordSet('MySQL', 'UserSession');
        }
        await this._rs.load(['Id', 'StartDate', 'EndDate', 'UserId'], `'UserId' == ${userId} AND 'EndDate IS NULL`);
        if (this._rs.recordCount == 0) {
            return null;
        }
        else if (this._rs.recordCount > 1) {
            //todo: close off open sessions except for the latest. return latest 
            throw new Error(`More than one session for user ID ${userId} found`);
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
            throw new Error('Unable to save session');
        }
        else if (savedCount > 0) {
            o.id = this._rs.currentRecord.getField('Id').value;
        }
    }

    async endExisting(userId: number) {
        //will end all existing sessions
        //todo: implementation
        throw new Error('not implemented');
    }
}