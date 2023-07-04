import TokenData from "./TokenData";

export default interface IToken {
    value: string;
    data: TokenData;
    isValid: boolean;
    hasExpired: boolean;
}