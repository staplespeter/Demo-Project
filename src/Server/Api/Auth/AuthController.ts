import User from "../../Model/User";
import UserSession from "../../Model/UserSession";
import AuthResult from "./AuthResult";
import IAuthApi from "./IAuthApi";
import Jwt from "./Jwt";

export default class AuthController implements IAuthApi {
    static readonly LOGIN_URL = '/login.html';

    static async register(username: string, password: string): Promise<AuthResult> {
        const result = new AuthResult();

        try {
            if (!username || username.length == 0 || !password || password.length == 0){
                result.error = 'Invalid username/password';
            }            
            else {
                let user = await User.load(username);
                if (user) {
                    result.error = 'Username already exists';
                }
                else {
                    user = await User.register(username, password);
                    const userSession = await UserSession.startSession(user.id);
                    const token = new Jwt({
                        userSessionId: userSession.id,
                        sessionEndDate: userSession.calculateEndDate()
                    });
                    await token.generate();
                    result.token = token.value;
                }
            }
        }
        catch (err) {
            //TODO: use a file logger instead of console
            console.log(err);
            result.error = (err as Error).message;
        }

        return result;
     }

    static async login(username: string, password: string): Promise<AuthResult> {
        const result = new AuthResult();

        try {
            if (!username || username.length == 0 || !password || password.length == 0){
                result.error = 'Invalid username/password';
            }            
            else {
                let user = await User.load(username);
                if (!user) {
                    result.error = 'Invalid username/password';
                }
                else if (!await user.authenticate(password)) {
                    result.error = 'Invalid username/password';
                }
                else {
                    const userSession = await UserSession.startSession(user.id);
                    const token = new Jwt({
                        userSessionId: userSession.id,
                        sessionEndDate: userSession.calculateEndDate()
                    });
                    await token.generate();
                    result.token = token.value;
                }
            }
        }
        catch (err) {
            //TODO: use a file logger instead of console
            console.log(err);
            result.error = (err as Error).message;
        }

        return result;
    }

    static async authenticate(tokenValue: string): Promise<AuthResult> {
        //todo: log out feature must update/return token with session end (current) date.
        const result = new AuthResult();

        try {
            const token = new Jwt(tokenValue);
            await token.parse();
            if (!token.isValid) {
                result.error = 'Authorisation token is not valid';
            }
            else if (token.hasExpired) {
                const us = await UserSession.load(token.data.userSessionId);
                if (us === null) {
                    console.log(`Unable to find session with Id ${token.data.userSessionId}`);
                }
                else {
                    await us.endSession(token.data.sessionEndDate);
                }
                result.redirectUrl = AuthController.LOGIN_URL;
            }
            else {
                const newToken = new Jwt({
                    userSessionId: token.data.userSessionId,
                    sessionEndDate: Jwt.refreshDate()
                });
                await newToken.generate();
                result.token = newToken.value;
            }
        }
        catch (err) {
            //TODO: use a file logger instead of console
            console.log(err);
            result.error = (err as Error).message;
        }

        return result;
    }
}