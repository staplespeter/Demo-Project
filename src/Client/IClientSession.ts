import Jwt from "../Api/Auth/Jwt";

export default interface IClientSession {
    token: Jwt;
    isValid(): Promise<boolean>;
}