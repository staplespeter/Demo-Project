jest.mock('../../../Model/User');
jest.mock('../../../Model/UserSession');
jest.mock('../Jwt');

describe('AuthController tests', () => {
    let AuthController: any;

    beforeAll(async () => {
        AuthController = (await import('../AuthController')).default;
    });
 
    it('can register a user and start a session', async () => {
        const result = await AuthController.register('NonExistingUser', 'password');
        expect(result.error).toBeUndefined();
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toEqual('102_2002');
    });

    it('will return an error when registering a user if that user already exists', async () => {
        const result = await AuthController.register('ExistingUser', 'password');
        expect(result.error).toEqual('Username already exists');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('will return an error when registering a user if there was an unhandled error', async () => {
        const result = await AuthController.register('UnhandledErrorUser', 'password');
        expect(result.error).toEqual('Unhandled error');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('can log in a user and start a session', async () => {
        const result = await AuthController.login('ExistingUser', '1');
        expect(result.error).toBeUndefined();
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toEqual('101_2001');
    });

    it('will return an error when logging in a user if that user does not exist', async () => {
        const result = await AuthController.login('NonExistingUser', 'password');
        expect(result.error).toEqual('Invalid username/password');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('will return an error when logging in a user if the password is incorrect', async () => {
        const result = await AuthController.login('ExistingUser', 'password');
        expect(result.error).toEqual('Invalid username/password');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('will return an error when logging in a user if there was an unhandled error', async () => {
        const result = await AuthController.login('UnhandledErrorUser', 'password');
        expect(result.error).toEqual('Unhandled error');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('can authenticate an existing session', async () => {
        const result = await AuthController.authenticate('ValidToken');
        expect(result.error).toBeUndefined();
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toEqual('101_3000');
    });

    it('will return an error when authenticating if the token is not valid', async () => {
        const result = await AuthController.authenticate('InvalidToken');
        expect(result.error).toEqual('Authorisation token is not valid');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });

    it('will return an error when authenticating if the token has expired', async () => {
        const result = await AuthController.authenticate('ExpiredToken');
        expect(result.error).toBeUndefined();
        expect(result.redirectUrl).toEqual('/login.htm');
        expect(result.token).toBeUndefined();
    });

    it('will return an error when authenticating if there was an unhandled error', async () => {
        const result = await AuthController.authenticate('UnhandledErrorToken');
        expect(result.error).toEqual('Unhandled error');
        expect(result.redirectUrl).toBeUndefined();
        expect(result.token).toBeUndefined();
    });
});