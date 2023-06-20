import User from "../../Model/User";
import { mockMySqlDataSourceUser, mockLoad, mockSave } from "../MySql/__mocks__/MockMySqlDatasourceUser";
import Recordset from "../RecordSet";
import UserDao from "../UserDao";

describe('UserDao tests', () => {
    afterEach(() => {
        mockLoad.mockClear();
        mockSave.mockClear();
    });

    it("can load a user", async () => {
        const rs = new Recordset(mockMySqlDataSourceUser);
        const dao = new UserDao(rs);
        const u = await dao.load('test@test1.com');
        expect(mockLoad).toBeCalledTimes(1);
        expect(u.id).toEqual(1);
        expect(u.email).toEqual('test@test1.com');
        expect(u.passwordHash).toEqual('testpasswordhash1');
        expect(u.passwordSalt).toEqual('testpasswordsalt1');
        expect(u.dateRegistered).toEqual(new Date('2001-01-01 12:34:56'));
    });

    it('will return null if no user is found', async () => {
        const rs = new Recordset(mockMySqlDataSourceUser);
        const dao = new UserDao(rs);
        const u = await dao.load('test@test2.com');
        expect(mockLoad).toBeCalledTimes(1);
        expect(u).toBeNull();
    });

    it('will throw an exception if more than one user is found', async () => {
        const rs = new Recordset(mockMySqlDataSourceUser);
        const dao = new UserDao(rs);
        const f = async (): Promise<User> => { return dao.load('test@test3.com') };
        expect(f).rejects.toThrow('More than one user with Email test@test3.com found');
    });

    it('can save a new user', async () => {
        const u = new User(null);
        u.id = null;
        u.email = 'test@test4.com';
        u.passwordHash = 'testpasswordhash4';
        u.passwordSalt = 'testpasswordsalt4';
        u.dateRegistered = new Date('2001-01-04 12:34:56');
        const rs = new Recordset(mockMySqlDataSourceUser);
        const dao = new UserDao(rs);
        await dao.save(u);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
        expect(u.id).toEqual(4);
    });

    it('can save an existing user', async () => {
        const u = new User(null);
        u.id = 4;
        u.email = 'test@test4.com';
        u.passwordHash = 'testpasswordhash4';
        u.passwordSalt = 'testpasswordsalt4';
        u.dateRegistered = new Date('2001-01-04 12:34:56');
        const rs = new Recordset(mockMySqlDataSourceUser);
        const dao = new UserDao(rs);
        await dao.save(u);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
        expect(u.id).toEqual(4);
    });

    it('can throw an exception when a user is not saved', async () => {
        const u = new User(null);
        u.id = 5;
        u.email = 'test@test5.com';
        u.passwordHash = 'testpasswordhash5';
        u.passwordSalt = 'testpasswordsalt5';
        u.dateRegistered = new Date('2001-01-05 12:34:56');
        const rs = new Recordset(mockMySqlDataSourceUser);
        const dao = new UserDao(rs);
        const f = async (): Promise<void> => { return dao.save(u) };
        expect(f).rejects.toThrow('Unable to save user');
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
    });
});