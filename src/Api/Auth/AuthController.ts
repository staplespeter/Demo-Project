import User from "../../Model/User";
import UserSession from "../../Model/UserSession";
import AuthResult from "./AuthResult";
import IAuthApi from "./IAuthApi";
import Jwt from "./Jwt";

export default class AuthController implements IAuthApi {
    static async register(username: string, password: string): Promise<AuthResult> {
        const result = new AuthResult();

        try {
            let user = await User.load(username);
            if (user) {
                result.error = 'Username already exists';
            }

            user = await User.register(username, password);
            const userSession = await UserSession.startSession(user.id);
            result.token = new Jwt({
                userSessionId: userSession.id,
                sessionEndDate: userSession.calculateEndDate()
            });
        }
        catch (err: any) {
            result.error = (err as Error).message;
        }

        return result;
     }

    static async login(username: string, password: string): Promise<AuthResult> {
        const result = new AuthResult();

        try {
            let user = await User.load(username);
            if (!user) {
                result.error = 'Invalid username/password';
            }
            if (!user.authenticate(password)) {
                result.error = 'Invalid username/password';
            }
            const userSession = await UserSession.startSession(user.id);
            result.token = new Jwt({
                userSessionId: userSession.id,
                sessionEndDate: userSession.calculateEndDate()
            });
        }
        catch (err: any) {
            result.error = (err as Error).message;
        }

        return result;
    }

    static authenticate(token: Jwt): AuthResult {
        //checks validity of token
        //todo: log out feature must update/return token with session end (current) date 
        return null;
    }
}