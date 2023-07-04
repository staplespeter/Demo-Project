export default interface IPassword {
    text: string;
    hash: string;
    salt: string;

    generate(): void;
    verify(text: string): Promise<boolean>;
}