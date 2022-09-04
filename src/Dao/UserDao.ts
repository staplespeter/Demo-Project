import User from '../Model/User';
import DaoFactory from './DaoFactory';
import Dao from './Dao';

export default class UserDao extends Dao<User> {
    id: number;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    dateRegistered: Date;

    async load(email: string): Promise<User> {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'User');
        }
        await this._rs.load(['Id', 'Email', 'PasswordHash', 'PasswordSalt', 'DateRegistered'], `WHERE 'Email' = ${email}`);
        if (this._rs.recordCount == 0) {
            return null;
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
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'User');
        }
        if (this._rs.recordCount == 0) {
            this._rs.addRecord();
        }
        this._rs.currentRecord.getField('Id').value = o.id;
        this._rs.currentRecord.getField('Email').value = o.email;
        this._rs.currentRecord.getField('PasswordHash').value = o.passwordHash;
        this._rs.currentRecord.getField('PasswordSalt').value = o.passwordSalt;
        this._rs.currentRecord.getField('DateRegistered').value = o.dateRegistered?.toISOString() ?? null;
        
        const savedCount = await this._rs.save();
        if (savedCount == 0) {
            throw new Error('Unable to save user');
        }
        else if (savedCount > 0) {
            //todo: reload for DateRegistered
            o.id = this._rs.currentRecord.getField('Id').value;
        }
    }
}