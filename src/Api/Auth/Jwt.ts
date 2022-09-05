import IToken from "./IToken";
import TokenData from "./TokenData";

export default class Jwt implements IToken {
    value: string;
    data: TokenData;
    get isValid(): boolean {
        return false;
    }
    get hasExpired(): boolean {
        return false;
    }

    constructor(data: TokenData);
    constructor(value: string);
    constructor(value: string | TokenData) {
        if (value instanceof TokenData) {
            this.data = value;
            this.generate();
        }
        else {
            this.value = value;
            this.parse();
        }
    }

    private generate() {
        const header = '';
        const payload = 
    }

    private parse() {

    }
}