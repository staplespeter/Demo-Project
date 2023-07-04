import Password from "../Password";

describe('Password tests', () => {
    it('can create a Password object that generates a text password', () => {
        const pwd = new Password();
        const regexpLowercase = /([a-z])/g;
        const regexpUppercase = /([A-Z])/g;
        const regexpDigit = /([\d])/g;
        const regexpSymbol = /(\W)/g;
        const lowercaseMatches = Array.from(pwd.text.matchAll(regexpLowercase));
        const uppercaseMatches = Array.from(pwd.text.matchAll(regexpUppercase));
        const digitMatches = Array.from(pwd.text.matchAll(regexpDigit));
        const symbolMatches = Array.from(pwd.text.matchAll(regexpSymbol));
        expect(pwd.text).toBeDefined();
        expect(pwd.text.length).toEqual(16);
        expect(lowercaseMatches.length).toEqual(6);
        expect(uppercaseMatches.length).toEqual(6);
        expect(digitMatches.length).toEqual(2);
        expect(symbolMatches.length).toEqual(2);
        expect(pwd.hash).toBeUndefined();
        expect(pwd.salt).toBeUndefined();
    });
    
    it('can create a Password object with a specified text password', () => {
        const pwd = new Password('testPassword');
        expect(pwd.text).toEqual('testPassword');
        expect(pwd.hash).toBeUndefined();
        expect(pwd.salt).toBeUndefined();
    });

    it('can create a Password object with a hashed password and salt', () => {
        const pwd = new Password('testHash', 'testSalt');
        expect(pwd.text).toBeUndefined();
        expect(pwd.hash).toEqual('testHash');
        expect(pwd.salt).toEqual('testSalt');
    })

    it('can generate a password hash and salt', async () => {
        const pwd = new Password('testPassword');
        await pwd.generate();
        expect(pwd.hash).toBeDefined();
        expect(pwd.hash.length).toEqual(44);
        expect(pwd.salt).toBeDefined();
        expect(pwd.salt.length).toEqual(44);
    });

    it('will not generate a hash when one already exists', async () => {
        const pwd = new Password('testHash', 'testSalt');
        expect(pwd.text).toBeUndefined();
        expect(pwd.hash).toEqual('testHash');
        expect(pwd.salt).toEqual('testSalt');
        await pwd.generate();
        expect(pwd.text).toBeUndefined();
        expect(pwd.hash).toEqual('testHash');
        expect(pwd.salt).toEqual('testSalt');
    });

    it('can verify a correct password matches', async () => {
        const pwd = new Password('testPassword');
        await pwd.generate();
        expect(await pwd.verify('testPassword')).toEqual(true);
    });

    it('can verify an incorrect password does not match', async () => {
        const pwd = new Password('testPassword');
        await pwd.generate();
        expect(await pwd.verify('notTestPassword')).toEqual(false);
    });
});