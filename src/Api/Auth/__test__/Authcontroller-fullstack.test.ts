import mysqlx from '@mysql/xdevapi';
import AuthController from "../AuthController";
import { mysqlxTestConfig } from "../../../Dao/__test__/appdata";

describe('AuthController full stack tests', () =>{
    let session: any = null;
    let userTable: any = null;

    beforeAll(async () => {
        session = await mysqlx.getSession(mysqlxTestConfig);
        userTable = session.getDefaultSchema().getTable('User');
        
    });

    afterAll(async () => {
        if (session) {
            await (async () => {
                if (userTable) {
                    await userTable.delete()
                        .where("Email LIKE '%test%'")
                        .execute();
                }
            })();
            await session.close();
        }
    });

    it('can successfully register a user', async () => {
        const result = await AuthController.register('test', 'test');
        expect(result.error).toBeUndefined();
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).not.toBeNull();
    });

    it('can return an error if the user exists, when registering a user', async () => {
        const result = await AuthController.register('test', 'test');
        expect(result.error).toEqual('Username already exists');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('can successfully log in', async () => {
        const result = await AuthController.login('test', 'test');
        expect(result.error).toBeUndefined();
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).not.toBeNull();
    });

    it('can return an error if the user does not exists, when logging in', async () => {
        const result = await AuthController.login('live', 'test');
        expect(result.error).toEqual('Invalid username/password');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('can return an error if the password is incorrect, when logging in', async () => {
        const result = await AuthController.login('test', 'live');
        expect(result.error).toEqual('Invalid username/password');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });
});