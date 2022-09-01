import IDao from './IDao';
import User from '../Model/User';
import IRecordset from './IRecordset';
import DaoFactory from './DaoFactory';

export default class UserDao implements IDao<User> {
    private _rs: IRecordset;

    id: number;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    dateRegistered: Date;

    async load(email: string): Promise<User> {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'UserSession');
        }
        await this._rs.load(['Id', 'Email', 'PasswordHash', 'PasswordSalt', 'DateRegistered'], `WHERE 'Email' = ${email}`);
        if (this._rs.recordCount == 0) {
            throw new Error(`No user with Email ${email} found`);
        }
        else if (this._rs.recordCount > 1) {
            throw new Error(`More than one user with Email ${email} found`);
        }
        else if (this._rs.recordCount == 1) {
            const u = new User(this);
            u.id = this._rs.currentRecord.getField('Id').value;
            u.email = this._rs.currentRecord.getField('Email').value;
            u.passwordHash = this._rs.currentRecord.getField('PasswordHash').value;
            u.passwordSalt = this._rs.currentRecord.getField('PasswordSalt').value;
            u.dateRegistered = new Date(this._rs.currentRecord.getField('DateRegistered').value);
            return u;
        }
        return new User(this);
    }

    async save(o: User) {
        
    }
}