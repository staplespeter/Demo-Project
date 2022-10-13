export default interface IClientAuthentication {
    signIn(username: string, password: string): Promise<boolean>;
    signUp(username: string, password: string): Promise<boolean>;
}