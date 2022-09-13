import AuthResult from "../AuthResult";
import IAuthApi from "../IAuthApi";

export default class AuthController implements IAuthApi {
    static async register(username: string, password: string): Promise<AuthResult> {
        const result = new AuthResult();
        switch (username) {
            case 'testUsername':
                result.token = 'testTokenValue';
                break;
            case 'existingUsername':
                result.error = 'Internal processing error';
                break;
        }
        return result;
     }

    static async login(username: string, password: string): Promise<AuthResult> {
        const result = new AuthResult();
        switch (username) {
            case 'testUsername':
                result.token = 'testTokenValue';
                break;
            case 'nonExistingUsername':
                result.error = 'Internal processing error';
                break;
        }
        return result;
    }

    static async authenticate(tokenValue: string): Promise<AuthResult> {
        const result = new AuthResult();
        switch (tokenValue) {
            case 'testTokenValue':
                result.token = 'newTestTokenValue';
                break;
            case 'invalidTokenValue':
                result.error = 'Internal processing error';
                break;
            case 'expiredTokenValue':
                result.redirectUrl = '/test/redirectTarget.htm';
                break;
        }
        return result;
    } 
}