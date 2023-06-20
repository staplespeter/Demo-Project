import Jwt from "../../Server/Api/Auth/Jwt";

export default interface IClientSession {
    token: Jwt;
    isValid(): Promise<boolean>;
}