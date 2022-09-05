import IToken from "./IToken";
import Jwt from "./Jwt";

export default class AuthResult {
    error: string;
    redirectUrl: string;
    token: IToken;
}