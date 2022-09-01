import IDao from "../Dao/IDao";
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

    constructor(dao: UserDao) {
        //todo: validate email before querying
        super();
        this._dao = dao;
    }

    async setPassword(password?: string) {
        const pwdObj = new Password(password);
        this.passwordHash = pwdObj.hash;
        this.passwordSalt = pwdObj.salt;
    }
}