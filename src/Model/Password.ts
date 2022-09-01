const secureRandomPassword = require('secure-random-password');
import { randomBytes, pbkdf2 } from 'node:crypto';

export default class Password {
    private static GENERATED_PWD_LENGTH = 16;
    private static PWD_BYTE_LENGTH = 32;
    private static SALT_BYTE_LENGTH = 32;
    private static KEYGEN_ITERATIONS = 1000000;
    private static KEYGEN_DIGEST = 'sha256';

    readonly text: string;
    private _hash: string;
    get hash(): string {
        return this._hash;
    }
    private _salt: string;
    get salt(): string {
        return this._salt;
    }
    
    constructor();
    constructor(text: string);
    constructor(hash?: string, salt?: string) {
        if (hash && salt) {
            this._hash = hash;
            this._salt = salt
        }
        else if (hash && !salt) {
            this.text = hash;
        }
        else {
            this.text = secureRandomPassword.randomPassword({
                length: Password.GENERATED_PWD_LENGTH,
                characters: [
                    { characters: secureRandomPassword.lower, exactly: 6 },
                    { characters: secureRandomPassword.lower, exactly: 6 },
                    { characters: secureRandomPassword.digits, exactly: 2 },
                    { characters: secureRandomPassword.symbols, exactly: 2 },
                ]
            });
        }
    }

    async generate() {
        if (this._hash) {
            return;
        }

        return new Promise((resolve, reject) => {
            randomBytes(Password.SALT_BYTE_LENGTH, (err, buf) => {
                if (err) {
                    reject(err);
                }

                this._salt = buf.toString('base64');
                pbkdf2(this.text, this._salt, Password.KEYGEN_ITERATIONS, Password.PWD_BYTE_LENGTH, Password.KEYGEN_DIGEST,
                    (err, derivedKey) => {
                        if (err) {
                            reject(err);
                        }

                        this._hash = derivedKey.toString('base64');
                        resolve(undefined);
                    });
            });
        });
    }

    async verify(text: string): Promise<boolean> {
        if (!this._hash) {
            return false;
        }

        return new Promise((resolve, reject) => {
            pbkdf2(text, this._salt, Password.KEYGEN_ITERATIONS, Password.PWD_BYTE_LENGTH, Password.KEYGEN_DIGEST,
                (err, derivedKey) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(this._hash === derivedKey.toString('base64'));
                });
        });
    }
}