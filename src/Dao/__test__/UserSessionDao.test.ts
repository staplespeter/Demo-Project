import UserSession from "../../Model/UserSession";
import { mockMySqlDataSourceUserSession, mockLoad, mockSave } from "../MySql/__mocks__/MockMySqlDatasourceUserSession";
import Recordset from "../RecordSet";
import UserSessionDao from "../UserSessionDao";

describe('UserSessionDao tests', () => {
    afterEach(() => {
        mockLoad.mockClear();
        mockSave.mockClear();
    })

    it('can load an existing session for a user', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.load(101);
        expect(mockLoad).toBeCalledTimes(1);
        expect(us.id).toEqual(1);
        expect(us.startDate).toEqual(new Date('2001-01-01 12:34:56'));
        expect(us.endDate).toEqual(null);
        expect(us.userId).toEqual(101);
    });

    it('will return null when no existing user session is found', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.load(102);
        expect(mockLoad).toBeCalledTimes(1);
        expect(us).toBeNull();
    });

    it('will throw an exception when multiple sessions are found', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const f = async (): Promise<UserSession> => { return dao.load(103) };
        expect(await f).rejects.toThrow('More than one session for user ID 103 found');
    });

    it('can save a new session', async () => {
        const us = new UserSession(null);
        us.id = null;
        us.startDate = new Date('2001-01-04 12:34:56');
        us.endDate = null;
        us.userId = 104;
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        await dao.save(us);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
        expect(us.id).toEqual(4);
    });

    it('can save an existing session', async () => {
        const us = new UserSession(null);
        us.id = 4;
        us.startDate = new Date('2001-01-04 12:34:56');
        us.endDate = null;
        us.userId = 104;
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        await dao.save(us);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
        expect(us.id).toEqual(4);
    });

    it('can throw an exception when a session is not saved', async () => {
        const us = new UserSession(null);
        us.id = 5;
        us.startDate = new Date('2001-01-05 12:34:56');
        us.endDate = null;
        us.userId = 105;
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const f = async (): Promise<void> => { dao.save(us) };
        expect(await f).rejects.toThrow('Unable to save session');
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
    });
});