import UserSession from "../UserSession";

//expects 1 <= ID <= 99
export default class User {
    id: number 
    email: string;
    passwordHash: string;
    passwordSalt: string;
    dateRegistered: Date;

    currentSession: UserSession;

    static async load(email: string): Promise<User> {
        switch (email) {
            case 'NonExistingUser':
                return null;
            case 'UnhandledErrorUser':
                throw new Error('Unhandled error');
            default:
                const u = new User();
                u.id = 1;
                u.passwordHash = '1_PasswordHash';
                u.passwordSalt = '1_PasswordSalt';
                u.dateRegistered = new Date(1);
                return u;
        }
    }

    static async register(email: string, password: string): Promise<User> {
        const u = new User();
        u.id = 2;
        u.passwordHash = '2_PasswordHash';
        u.passwordSalt = '2_PasswordSalt';
        u.dateRegistered = new Date(2);
        return u;
    }

    async setPassword(password?: string) {
        this.passwordHash = password + '_PasswordHash';
        this.passwordSalt = password + '_PasswordSalt';
    }

    async authenticate(password: string): Promise<boolean> {
        return this.passwordHash == password + '_PasswordHash';
    }

    async save(): Promise<boolean> {
        return false;
    }
}