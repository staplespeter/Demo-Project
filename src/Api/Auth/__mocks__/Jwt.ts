import add from "date-fns/add";
import isPast from "date-fns/isPast";
import TokenData from "../TokenData";

export default class Jwt {
    static get secretKey(): Uint8Array {
        return new Uint8Array();
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
        return this._isValid;
    }

    private _hasExpired: boolean = true;
    get hasExpired(): boolean {
        return this._hasExpired;
    }

    static refreshDate(): Date {
        return new Date(3000);
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
        this._value = this._data.userSessionId + '_' + this._data.sessionEndDate.valueOf();
    }

    async parse() {
        switch (this._value) {
            case 'ValidToken':
                this._data = new TokenData();
                this._data.userSessionId = 101;
                this._data.sessionEndDate = new Date(1001);
                this._isValid = true;
                this._hasExpired = false;
                break;
            case 'InvalidToken':
                this._isValid = false;
                this._hasExpired = true;
                break;
            case 'ExpiredToken':
                this._data = new TokenData();
                this._data.userSessionId = 102;
                this._data.sessionEndDate = new Date(2002);
                this._isValid = true;
                this._hasExpired = true;
                break;
            default:
                throw new Error('Unhandled error');
        }
    }
}