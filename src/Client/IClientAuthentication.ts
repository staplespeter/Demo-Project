export default interface IClientAuthentication {
    lastError: string;
    signIn(username: string, password: string): Promise<boolean>;
    signUp(username: string, password: string): Promise<boolean>;
}