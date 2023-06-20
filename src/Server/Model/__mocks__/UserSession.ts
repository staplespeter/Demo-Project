//expects 1 <= UserID <= 99
// -> 101 <= ID <= 199
// -> 1001 <= StartDate.valueOf() <= 1099
// -> 2001 <= EndDate.valueOf() <= 2099
export default class UserSession {
    static async load(id: number): Promise<UserSession> {
        const us = new UserSession();
        us.id = id;
        us.startDate = new Date(id);
        us.userId = id - 100;
        return us;
    }

    static async startSession(userId: number): Promise<UserSession>
    static async startSession(userId: number, startDate?: Date): Promise<UserSession> {
        const us = new UserSession();
        await us.startSession(userId, startDate);
        return us;
    }
    
    id: number = null;
    startDate: Date = null;
    endDate: Date = null;
    userId: number = null;

    async startSession(userId: number): Promise<void>;
    async startSession(userId: number, startDate: Date): Promise<void>;
    async startSession(userId: number, startDate?: Date) {
        this.id = userId + 100;
        this.startDate = startDate ? startDate : new Date(this.id + 900);
        this.userId = userId;
    }

    async endSession(): Promise<void>;
    async endSession(endDate: Date): Promise<void>;
    async endSession(endDate?: Date) {
    }

    calculateEndDate(): Date {
        return new Date(this.startDate.valueOf() + 1000);
    }
}