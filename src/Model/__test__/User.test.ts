import UserDao from "../../Dao/UserDao";
import User from "../User";

describe('User tests', () => {
    const mockSave = jest.spyOn(UserDao.prototype, 'save')
        .mockImplementation(async (u) => {
            u.id = 1;
        });

    it('can set a password', async () => {
        const u = new User(null);
        await u.setPassword('testPassword');
        expect(u.passwordHash).toBeDefined();
        expect(u.passwordHash.length).toEqual(44);
        expect(u.passwordSalt).toBeDefined();
        expect(u.passwordSalt.length).toEqual(44);
    });

    it('can save a user', async () => {
        const dao = new UserDao(null);
        const u = new User(dao);
        u.email = 'testEmail';
        u.passwordHash = 'testPasswordHash';
        u.passwordSalt = 'testPasswordSalt';
        expect(await u.save()).toEqual(true);
        expect(mockSave).toBeCalledTimes(1);
        expect(mockSave).toBeCalledWith(u);
        expect(u.id).toEqual(1);
        expect(u.email).toEqual('testEmail');
        expect(u.passwordHash).toEqual('testPasswordHash');
        expect(u.passwordSalt).toEqual('testPasswordSalt');
    });

    it('will not save a user with no email', async () => {
        const u = new User(null);
        u.passwordHash = 'testPasswordHash';
        u.passwordSalt = 'testPasswordSalt';
        expect(await u.save()).toEqual(false);
    });

    it('will not save a user with no password hash', async () => {
        const u = new User(null);
        u.email = 'testEmail';
        u.passwordSalt = 'testPasswordSalt';
        expect(await u.save()).toEqual(false);
    });

    it('will not save a user with no password salt', async () => {
        const u = new User(null);
        u.email = 'testEmail';
        u.passwordHash = 'testPasswordHash';
        expect(await u.save()).toEqual(false);
    });
});