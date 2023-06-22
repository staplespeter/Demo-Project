import UserSession from "../Model/UserSession";
import Dao from "./Dao";
import DaoFactory from "./DaoFactory";
import IRecord from "./IRecord";
import { toMySqlDateTimeGmt } from "./MySql/MySqlDateHelper";

export default class UserSessionDao extends Dao<UserSession> {
    public readonly fields: string[] = ['Id', 'StartDate', 'EndDate', 'UserId'];

    async load(id: number, activeSessionsOnly: boolean = true): Promise<UserSession> {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet(process.env.DBENGINE as Dao.DatasourceType, 'UserSession');
        }
        let where = 'Id = ' + id;
        if (activeSessionsOnly) {
            where += ' AND EndDate IS NULL';
        }
        await this._rs.load(this.fields, where);
        if (this._rs.recordCount == 0) {
            return null;
        }

        const us = new UserSession(this);
        us.id = this._rs.currentRecord.getField('Id').value;
        us.startDate = this._rs.currentRecord.getField('StartDate').value ?
            new Date(this._rs.currentRecord.getField('StartDate').value) :
            null;
        us.endDate = this._rs.currentRecord.getField('EndDate').value ?
            new Date(this._rs.currentRecord.getField('EndDate').value) :
            null;
        us.userId = this._rs.currentRecord.getField('UserId').value;
        return us;
    }

    async loadSessionForUser(userId: number): Promise<UserSession> {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet(process.env.DBENGINE as Dao.DatasourceType, 'UserSession');
        }
        //TODO: implement Orderby in Datasource,
        //  or just reference the one with the highest start date.
        //await this._rs.load(this._fields, `UserId = ${userId} AND EndDate IS NULL`, ['StartDate ASC']);
        let latestStartRecord: IRecord = null;
        await this._rs.load(this.fields, `UserId = ${userId} AND EndDate IS NULL`);
        if (this._rs.recordCount == 0) {
            return null;
        }
        else if (this._rs.recordCount == 1) {
            latestStartRecord = this._rs.currentRecord;
        }
        else if (this._rs.recordCount > 1) {
            //TODO: close off open sessions except for the latest. return latest.
            //  No actual use case for it as yet anyway.
            // const endDate = toMySqlDateTimeGmt(new Date());
            // while (!this._rs.eof) {
            //     const startTimestamp = (this._rs.currentRecord.getField('EndDate').value as Date).getTime();
            //     const latestStartTimestamp = (latestStartRecord.getField('EndDate').value as Date).getTime();
            //     if (latestStartRecord == null || startTimestamp > latestStartTimestamp) {
            //         latestStartRecord = this._rs.currentRecord;
            //     }
            //     this._rs.currentRecord.getField('EndDate').value = endDate;
            //     this._rs.next();
            // }
            // latestStartRecord.discard();
    
            // if ((this._rs.recordCount - 1) != await this._rs.save()) {
            //     console.log('Unable to close previous open sessions');
            // }
            throw new Error(`More than one session for user ID ${userId} found`);
        }

        const us = new UserSession(this);
        us.id = latestStartRecord.getField('Id').value;
        us.startDate = latestStartRecord.getField('StartDate').value ?
            new Date(latestStartRecord.getField('StartDate').value) :
            null;
        us.endDate = latestStartRecord.getField('EndDate').value ?
            new Date(latestStartRecord.getField('EndDate').value) :
            null;
        us.userId = latestStartRecord.getField('UserId').value;
        return us;
    }

    async save(o: UserSession) {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'UserSession');
        }
        if ((o.id ?? null) === null) {
            this._rs.addRecord();
        }
        else {
            //TODO: Add recordset filter function .filter(fieldName: string, fieldValue: any)
            this._rs.first();
            while (!this._rs.eof && this._rs.currentRecord.getField('Id').value != o.id) {
                this._rs.next();
            }
            if (this._rs.eof) {
                if (await this._rs.load(this.fields, `Id = ${o.id}`) == 0) {
                    throw new Error(`Existing session for Id ${o.id} not found`);
                }
            }
        }
        this._rs.currentRecord.getField('Id').value = o.id;
        this._rs.currentRecord.getField('StartDate').value = toMySqlDateTimeGmt(o.startDate) ?? null;
        this._rs.currentRecord.getField('EndDate').value = toMySqlDateTimeGmt(o.endDate) ?? null;
        this._rs.currentRecord.getField('UserId').value = o.userId;
        
        const savedCount = await this._rs.save();
        if (savedCount == 0) {
            throw new Error('Unable to save session');
        }
        else if (savedCount > 0) {
            o.id = this._rs.currentRecord.getField('Id').value;
        }
    }

    async endExisting(userId: number): Promise<boolean> {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet(process.env.DBENGINE as Dao.DatasourceType, 'UserSession');
        }
        await this._rs.load(this.fields, `UserId = ${userId} AND EndDate IS NULL`);
        if (this._rs.recordCount == 0) {
            return true;
        };
        const endDate = toMySqlDateTimeGmt(new Date());
        while (!this._rs.eof) {
            this._rs.currentRecord.getField('EndDate').value = endDate;
            this._rs.next();
        }
        return this._rs.recordCount == await this._rs.save();
    }
}