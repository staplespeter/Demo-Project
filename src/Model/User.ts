import UserDao from "../Dao/UserDao";
import DataObject from "./DataObject";
import Password from "./Password";
import UserSession from "./UserSession";

export default class User extends DataObject {
    id: number 
    email: string;
    passwordHash: string;
    passwordSalt: string;
    dateRegistered: Date;

    currentSession: UserSession;

    static async load(email: string): Promise<User> {
        const dao = new UserDao();
        return dao.load(email);
    }

    static async register(email: string, password: string): Promise<User> {
        const dao = new UserDao();
        const u = new User(dao);
        u.email = email;
        await u.setPassword(password);
        if (!await u.save()) {
            console.log()
            throw new Error('Unable to save new user');
        }
        return u;
    }

    constructor(dao: UserDao) {
        //todo: validate email before querying
        super();
        this._dao = dao;
    }

    async setPassword(password?: string) {
        const pwdObj = new Password(password);
        await pwdObj.generate();
        this.passwordHash = pwdObj.hash;
        this.passwordSalt = pwdObj.salt;
    }

    async authenticate(password: string): Promise<boolean> {
        if (!this.passwordHash || !this.passwordSalt) {
            return false;
        }

        const pwd = new Password(this.passwordHash, this.passwordSalt);
        return pwd.verify(password);
    }

    async save(): Promise<boolean> {
        if (!this.email || !this.passwordHash || ! this.passwordSalt) {
            return false;
        }

        await this._dao.save(this);
        return true;
    }
}