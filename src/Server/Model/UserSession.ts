import DataObject from './DataObject';
import UserSessionDao from '../Dao/UserSessionDao';
import { add } from 'date-fns';


export default class UserSession extends DataObject {
    //session period in minutes
    static readonly DEFAULT_SESSION_PERIOD = 60*12;

    static async load(id: number): Promise<UserSession> {
        const dao = new UserSessionDao();
        return dao.load(id);
    }

    static async startSession(userId: number): Promise<UserSession>
    static async startSession(userId: number, startDate?: Date): Promise<UserSession> {
        const dao = new UserSessionDao();
        const us = new UserSession(dao);
        await us.startSession(userId, startDate);
        return us;
    }
    
    id: number = null;
    startDate: Date = null;
    endDate: Date = null;
    userId: number = null;

    constructor(dao: UserSessionDao) {
        super();
        this._dao = dao;
    }

    async startSession(userId: number): Promise<void>;
    async startSession(userId: number, startDate: Date): Promise<void>;
    async startSession(userId: number, startDate?: Date) {
        await (this._dao as UserSessionDao).endExisting(userId);

        //TODO: Node does not use the locale for generating date times.
        //  this results in the time being UTC+0 for the User.DateRegistered field (set by DB).
        //  MySQL uses the local so UserSession date fields have UTC+1 i.e. British Summer Time.
        //  Update the settings for MySQL to use UTC+0?
        if (!this.startDate) {
            this.userId = userId;
            this.startDate = startDate ?? new Date();
            await this._dao.save(this);
        }
    }

    async endSession(): Promise<void>;
    async endSession(endDate: Date): Promise<void>;
    async endSession(endDate?: Date) {
        if (this.id && this.startDate && !this.endDate) {
            this.endDate = endDate ?? new Date();
            await this._dao.save(this);
        }
    }

    calculateEndDate(): Date {
        if (!this.startDate) {
            throw new Error('StartDate is not defined');
        }
        return add(this.startDate, { minutes: UserSession.DEFAULT_SESSION_PERIOD });
    }
}