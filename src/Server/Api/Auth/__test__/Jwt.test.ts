import Jwt from "../Jwt";
import { add } from 'date-fns';
import UserSession from "../../../Model/UserSession";
import { jwtVerify, JWTVerifyResult, SignJWT } from "jose";

describe('Jwt tests', () => {
    it('can create a new Jwt from a TokenData object', () => {
        const date = new Date('2001-01-01 12:34:56');
        const token = new Jwt({
            userSessionId: 1,
            sessionEndDate: date
        });
        expect(token.data.userSessionId).toEqual(1);
        expect(token.data.sessionEndDate).toEqual(date);
        expect(token.value).toBeUndefined();
    });

    it('can create a new Jwt from a token string', () => {
        const token = new Jwt('testTokenString');
        expect(token.value).toEqual('testTokenString');
        expect(token.data).toBeUndefined();
    });

    it('can create a new token refresh date', () => {
        //assume will execute within 1 ms
        const dateValue = add(new Date(), { minutes: UserSession.DEFAULT_SESSION_PERIOD }).valueOf();
        expect(Jwt.refreshDate().valueOf()).toBeGreaterThanOrEqual(dateValue - 1);
    });

    it('can generate a new token string', async () => {
        const token = new Jwt({
            userSessionId: 1,
            sessionEndDate: new Date('2001-01-01 12:34:56')
        });
        await token.generate();
        expect(token.value).toBeDefined();
    });

    it('will not generate a new token string when no token data is provided', async () => {
        const token = new Jwt('testTokenString');
        const f = async () => { return token.generate() };
        expect(f).rejects.toThrow('Missing token data');
    });

    it('will not generate a new token string when no user session ID is provided', async () => {
        const token = new Jwt({
            userSessionId: null,
            sessionEndDate: new Date('2001-01-01 12:34:56')
        });
        const f = async () => { return token.generate() };
        expect(f).rejects.toThrow('Missing token data');
    });

    it('will not generate a new token string when no session end date is provided', async () => {
        const token = new Jwt({
            userSessionId: 1,
            sessionEndDate: null
        });
        const f = async () => { return token.generate() };
        expect(f).rejects.toThrow('Missing token data');
    });


    //expired tokens throw an exception in Jose verification.
    //makes it impossible to retrieve payload and "exp" value (to update actual session end).
    //see https://github.com/panva/jose/discussions/447.
    // it('bug test', async () => {
    //     const date = new Date('2022-01-01 12:34:56');
    //     const secretKey = new Uint8Array(Buffer.from('DEMO-PROJECT-SECRET-KEY', 'ascii'))
    //     const tokenValue = await new SignJWT({
    //             iss: 'demoprojectserver',
    //             aud: ['demoprojectserver', 'demoprojectclient'],
    //             exp: date.valueOf() / 1000,
    //             jti: '101'
    //         })
    //         .setProtectedHeader({ alg: 'HS256' })
    //         .sign(secretKey);

    //     try {
    //         const result: JWTVerifyResult = await jwtVerify(tokenValue, Jwt.secretKey, {
    //             algorithms: ['HS256'],
    //             issuer: 'demoprojectserver',
    //             audience: ['demoprojectserver', 'demoprojectclient']
    //         });

    //         const jti = Number.parseInt(result.payload?.jti);
    //         const exp = new Date(result.payload?.exp * 1000);

    //         expect(jti).not.toBeNaN();
    //         expect(jti).toEqual(101);
    //         expect(exp.valueOf()).toEqual(date.valueOf());
    //     }
    //     catch (err) {
    //         console.log(err);
    //         throw err;
    //     }
    // });


    it('can parse a token string', async () => {
        const date = new Date('2001-01-01 12:34:56');
        const token = new Jwt({
            userSessionId: 1,
            sessionEndDate: date
        });
        await token.generate();
        const newToken = new Jwt(token.value);
        await newToken.parse();
        expect(newToken.data).toBeDefined();
        expect(newToken.data.userSessionId).toEqual(1);
        expect(newToken.data.sessionEndDate.valueOf()).toEqual(date.valueOf());
    });

    it('will not parse a token string when no token value is provided', async () => {
        const date = new Date('2001-01-01 12:34:56');
        const token = new Jwt({
            userSessionId: 1,
            sessionEndDate: date
        });
        const f = async () => { return token.parse() };
        expect(f).rejects.toThrow('Missing token value');
    });

    it('can parse an invalid token string', async () => {
        const token = new Jwt('invalidTokenString');
        await token.parse();
        expect(token.data).toBeUndefined();
        expect(token.isValid).toEqual(false);
    });

    it('can determine if a token has expired', () => {
        let date = add(new Date(), { days: 1 });
        let token = new Jwt({
            userSessionId: 1,
            sessionEndDate: date
        });
        expect(token.hasExpired).toEqual(false);

        date = add(new Date(), { days: -1 });
        token = new Jwt({
            userSessionId: 1,
            sessionEndDate: date
        });
        expect(token.hasExpired).toEqual(true);
    });

    it ('will throw an exception when checking if the token has expired, when token data is missing', () => {
        const token = new Jwt('testTokenString');
        const f = async () => { return token.hasExpired };
        expect(f).rejects.toThrow('Missing token data');
    });

    it ('will throw an exception when checking if the token has expired, when session end date is missing', () => {
        const token = new Jwt({
            userSessionId: 1,
            sessionEndDate: null
        });
        const f = async () => { return token.hasExpired };
        expect(f).rejects.toThrow('Missing token data');
    });
});