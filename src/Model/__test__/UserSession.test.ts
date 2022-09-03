import UserSessionDao from '../../Dao/UserSessionDao';
import UserSession from '../UserSession';

describe('UserSession tests', () => {
    const mockSave = jest.spyOn(UserSessionDao.prototype, 'save')
        .mockImplementation(async (us) => {
            us.id = 1;
        });

    afterEach(() => {
        mockSave.mockClear();
    });

    it('can create a new session with a default (current) start date', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        expect(us.id).toBeNull();
        expect(us.startDate).toBeNull();
        expect(us.endDate).toBeNull();
        expect(us.userId).toBeNull();
        await us.startSession(101);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith(us);
        expect(us.id).toEqual(1);
        expect(us.startDate instanceof Date).toEqual(true);
        expect(us.endDate).toBeNull();
        expect(us.userId).toEqual(101);
    });

    it('can create a new session with a specified start date', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        await us.startSession(101, new Date('2001-01-01 12:34:56'));
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith(us);
        expect(us.id).toEqual(1);
        expect(us.startDate).toEqual(new Date('2001-01-01 12:34:56'));
        expect(us.endDate).toBeNull();
        expect(us.userId).toEqual(101);
    });

    it('cannot create a new session when a start date exists', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        await us.startSession(101);
        expect(mockSave).toBeCalledTimes(1);
        expect(us.id).toEqual(1);
        expect(us.startDate instanceof Date).toEqual(true);
        expect(us.endDate).toBeNull();
        expect(us.userId).toEqual(101);
        mockSave.mockClear();

        await us.startSession(101);
        expect(mockSave).toBeCalledTimes(0);
        expect(us.id).toEqual(1);
        expect(us.startDate instanceof Date).toEqual(true);
        expect(us.endDate).toBeNull();
        expect(us.userId).toEqual(101);
    });

    it('can end an existing session with a default (current) end date', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        await us.startSession(101);
        mockSave.mockClear();

        await us.endSession();
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith(us);
        expect(us.id).toEqual(1);
        expect(us.startDate instanceof Date).toEqual(true);
        expect(us.endDate instanceof Date).toEqual(true);
        expect(us.userId).toEqual(101);
    });

    it('can end an existing session with a specified end date', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        await us.startSession(101);
        mockSave.mockClear();

        await us.endSession(new Date('2001-01-01 12:34:56'));
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith(us);
        expect(us.id).toEqual(1);
        expect(us.startDate instanceof Date).toEqual(true);
        expect(us.endDate).toEqual(new Date('2001-01-01 12:34:56'));
        expect(us.userId).toEqual(101);
    });

    it('cannot end an existing session when an ID is not assigned', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        await us.startSession(101);
        us.id = null;
        mockSave.mockClear();

        await us.endSession();
        expect(mockSave).toBeCalledTimes(0);
        expect(us.id).toBeNull();
        expect(us.startDate instanceof Date).toEqual(true);
        expect(us.endDate).toBeNull();
        expect(us.userId).toEqual(101);
    });

    it('cannot end an existing session when a start date is not assigned', async () => {
        const dao = new UserSessionDao(null);
        const us = new UserSession(dao);
        us.id = 1;
        await us.endSession();
        expect(mockSave).toBeCalledTimes(0);
        expect(us.id).toEqual(1);
        expect(us.startDate).toBeNull();
        expect(us.endDate).toBeNull();
        expect(us.userId).toBeNull();
    });
});