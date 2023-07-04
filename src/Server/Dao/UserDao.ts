import User from '../Model/User';
import DaoFactory from './DaoFactory';
import Dao from './Dao';
import { toMySqlDateTimeGmt } from './MySql/MySqlDateHelper'

export default class UserDao extends Dao<User> {
    public readonly fields: string[] = ['Id', 'Email', 'PasswordHash', 'PasswordSalt', 'DateRegistered'];

    async load(email: string): Promise<User> {
        if (!this._rs) {
            this._rs = await DaoFactory.getRecordSet('MySQL', 'User');
        }

        //TODO: really need an agnostic filter interface.  MySQL is quite deviant from standard SQL
        //  resulting in a coupling of these DAOs to MySQLDataSource, even though the point was to separate them.
        //  Or Implement these DAOs as storage-coupled objects, so there is a set for MySQL, for SQL Server etc. 
        await this._rs.load(this.fields, `Email = "${email}"`);
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
        this._rs.currentRecord.getField('Id').value = o.id ?? null;
        this._rs.currentRecord.getField('Email').value = o.email;
        this._rs.currentRecord.getField('PasswordHash').value = o.passwordHash;
        this._rs.currentRecord.getField('PasswordSalt').value = o.passwordSalt;
        this._rs.currentRecord.getField('DateRegistered').value = toMySqlDateTimeGmt(o.dateRegistered) ?? null;
        
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