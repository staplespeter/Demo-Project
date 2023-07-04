import IToken from "./IToken";
import TokenData from "./TokenData";
import { add, isPast } from 'date-fns';
import UserSession from "../../Model/UserSession";
import { SignJWT, jwtVerify, JWTVerifyResult } from 'jose';

export default class Jwt implements IToken {
    private static readonly ALGORITHM = 'HS256';
    private static readonly ISSUER = 'http://demoprojectserver';
    private static readonly AUDIENCE = 'demoprojectclient';

    private static readonly SECRET_KEY = 'DEMO-PROJECT-SECRET-KEY';
    static get secretKey(): Uint8Array {
        const buf = Buffer.from(Jwt.SECRET_KEY, 'ascii');
        return new Uint8Array(buf);
    }

    private _value: string;
    get value() : string {
        return this._value;
    }

    private _data: TokenData;
    get data(): TokenData {
        return this._data;
    }

    private _isValid: boolean = false;
    get isValid(): boolean {
        if (!this._data || !this._data.userSessionId || !this._data.sessionEndDate) {
            return false;
        }

        return this._isValid && !Number.isNaN(this._data.userSessionId);
    }

    get hasExpired(): boolean {
        if (!this._data || !this._data.sessionEndDate) {
            throw new Error('Missing token data');
        }

        return isPast(this._data.sessionEndDate);
    }

    static refreshDate(): Date {
        return add(new Date(), { minutes: UserSession.DEFAULT_SESSION_PERIOD });
    }

    constructor(data: TokenData);
    constructor(value: string);
    constructor(value: string | TokenData) {
        if (typeof value == 'string') {
            this._value = value;
        }
        else {
            this._data = value;
        }
    }

    async generate() {
        if (!this._data || !this._data.userSessionId || !this._data.sessionEndDate) {
            throw new Error('Missing token data');
        }

        this._value = await new SignJWT({
                iss: Jwt.ISSUER,
                aud: [Jwt.ISSUER, Jwt.AUDIENCE],
                //jwtVerify throws an error when the token has expired.  Cannot get the payload.
                //behaviour of the Jose package -> https://github.com/panva/jose/discussions/447.
                //jest also complains "Cannot find module 'jose/dist/types/util/errors' from 'src/Api/Auth/Jwt.ts'"
                //when importing the error type.
                //manually check for expiry.
                //exp: this._data.sessionEndDate.valueOf() / 1000,
                jti: this._data.userSessionId.toString(),
                sessionEndDate: this._data.sessionEndDate.valueOf()
            })
            .setProtectedHeader({ alg: Jwt.ALGORITHM})
            .sign(Jwt.secretKey);
    }

    async parse() {
        if (!this._value) {
            throw new Error('Missing token value');
        }

        try {
            const result: JWTVerifyResult = await jwtVerify(this._value, Jwt.secretKey, {
                    algorithms: [Jwt.ALGORITHM],
                    issuer: Jwt.ISSUER,
                    audience: [Jwt.ISSUER, Jwt.AUDIENCE]
                });
            
            this._data = new TokenData();
            this._data.userSessionId = Number.parseInt(result.payload?.jti);
            if (Number.isNaN(this._data.userSessionId)) {
                this._data.userSessionId = undefined;
            }
            if (typeof result.payload?.sessionEndDate == 'number') {
                this._data.sessionEndDate = new Date(result.payload?.sessionEndDate as number);
            }

            this._isValid = true;
        }
        catch (err) {
            //TODO: use a file logger instead of console
            console.log(err);
            this._isValid = false;
        }
    }
}