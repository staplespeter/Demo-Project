import DataObject from './DataObject';
import UserSessionDao from '../Dao/UserSessionDao';

//todo: remove Token field from DDL
export default class UserSession extends DataObject {
    //session period in minutes
    static readonly DEFAULT_SESSION_PERIOD = 60;

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

    //properties should not be set directly
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
        if (!startDate) {
            startDate = new Date();
        }

        if (!this.startDate) {
            this.userId = userId;
            this.startDate = startDate;
            await this._dao.save(this);
        }
    }

    async endSession(): Promise<void>;
    async endSession(endDate: Date): Promise<void>;
    async endSession(endDate?: Date) {
        if (!endDate) {
            endDate = new Date();
        }

        if (this.id && this.startDate && !this.endDate) {
            this.endDate = endDate;
            await this._dao.save(this);
        }
    }
}