import UserSession from "../../Model/UserSession";
import { toMySqlDateTimeGmt } from "../MySql/MySqlDateHelper";
import { mockMySqlDataSourceUserSession, mockLoad, mockSave } from "../MySql/__mocks__/MockMySqlDatasourceUserSession";
import Recordset from "../RecordSet";
import UserSessionDao from "../UserSessionDao";

describe('UserSessionDao tests', () => {
    afterEach(() => {
        mockLoad.mockClear();
        mockSave.mockClear();
    })

    it('can load an existing active session', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.load(1);
        expect(mockLoad).toBeCalledTimes(1);
        //TODO: Log bug in Jest -> mocked fns with args with default values do not receive the default value 
        expect(mockLoad).toBeCalledWith(dao.fields, 'Id = 1 AND EndDate IS NULL', undefined);
        expect(us.id).toEqual(1);
        expect(us.startDate).toEqual(new Date('2001-01-01 12:34:56'));
        expect(us.endDate).toEqual(null);
        expect(us.userId).toEqual(101);
    });

    it('can load an existing finished session', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.load(5, false);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(dao.fields, 'Id = 5', undefined);
        expect(us.id).toEqual(5);
        expect(us.startDate).toEqual(new Date('2001-01-05 12:34:56'));
        expect(us.endDate).toEqual(new Date('2001-02-05 12:34:56'));
        expect(us.userId).toEqual(105);
    });

    it('will return null when no existing user session is found', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.load(4);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(dao.fields, 'Id = 4 AND EndDate IS NULL', undefined);
        expect(us).toBeNull();
    });

    it('can load an existing session for a user', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.loadSessionForUser(101);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(dao.fields, 'UserId = 101 AND EndDate IS NULL', undefined);
        expect(us.id).toEqual(1);
        expect(us.startDate).toEqual(new Date('2001-01-01 12:34:56'));
        expect(us.endDate).toEqual(null);
        expect(us.userId).toEqual(101);
    });

    it('will return null when no existing user session is found for a user', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const us = await dao.loadSessionForUser(102);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(dao.fields, 'UserId = 102 AND EndDate IS NULL', undefined);
        expect(us).toBeNull();
    });

    it('will throw an exception when multiple sessions are found for a user', async () => {
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const f = async (): Promise<UserSession> => { return dao.loadSessionForUser(103) };
        expect(f).rejects.toThrow('More than one session for user ID 103 found');
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(dao.fields, 'UserId = 103 AND EndDate IS NULL', undefined);
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
        expect(rs.currentRecord.getField('Id').value).toEqual(us.id);
        expect(rs.currentRecord.getField('StartDate').value).toEqual(toMySqlDateTimeGmt(us.startDate));
        expect(rs.currentRecord.getField('EndDate').value).toBeNull();
        expect(rs.currentRecord.getField('UserId').value).toEqual(us.userId);
    });

    it('can save (close) an existing session already in the recordset', async () => {
        const us = new UserSession(null);
        us.id = 1;
        us.startDate = new Date('2001-01-01 12:34:56');
        us.endDate = new Date('2001-02-01 12:34:56');
        us.userId = 101;
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        await dao.load(1);
        mockLoad.mockClear();
        expect(rs.currentRecord.getField('Id').value).toEqual(us.id);
        expect(rs.currentRecord.getField('StartDate').value).toEqual(toMySqlDateTimeGmt(us.startDate));
        expect(rs.currentRecord.getField('EndDate').value).toBeNull();
        expect(rs.currentRecord.getField('UserId').value).toEqual(us.userId);
        await dao.save(us);
        expect(mockLoad).toBeCalledTimes(0);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
        expect(us.id).toEqual(1);
        expect(rs.currentRecord.getField('Id').value).toEqual(us.id);
        expect(rs.currentRecord.getField('StartDate').value).toEqual(toMySqlDateTimeGmt(us.startDate));
        expect(rs.currentRecord.getField('EndDate').value).toEqual(toMySqlDateTimeGmt(us.endDate));
        expect(rs.currentRecord.getField('UserId').value).toEqual(us.userId);
    });

    it('can save an existing session not in the recordset', async () => {
        const us = new UserSession(null);
        us.id = 6;
        us.startDate = new Date('2001-01-06 12:34:56');
        us.endDate = new Date('2001-02-06 12:34:56');
        us.userId = 106;
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        await dao.save(us);
        expect(mockLoad).toBeCalledTimes(1);
        expect(mockLoad).toBeCalledWith(dao.fields, 'Id = 6', undefined);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith([rs.currentRecord]);
        expect(us.id).toEqual(6);
        expect(rs.currentRecord.getField('Id').value).toEqual(us.id);
        expect(rs.currentRecord.getField('StartDate').value).toEqual(toMySqlDateTimeGmt(us.startDate));
        expect(rs.currentRecord.getField('EndDate').value).toEqual(toMySqlDateTimeGmt(us.endDate));
        expect(rs.currentRecord.getField('UserId').value).toEqual(us.userId);
    });

    it('can throw an exception when a session is not saved', async () => {
        const us = new UserSession(null);
        us.id = 5;
        us.startDate = new Date('2001-01-05 12:34:56');
        us.endDate = null;
        us.userId = 105;
        const rs = new Recordset(mockMySqlDataSourceUserSession);
        const dao = new UserSessionDao(rs);
        const f = async (): Promise<void> => { return dao.save(us) };
        expect(f).rejects.toThrow('Unable to save session').then(() => {
            expect(mockSave).toBeCalledTimes(1);
            expect(mockSave).toBeCalledWith([rs.currentRecord]);
        });
    });
});