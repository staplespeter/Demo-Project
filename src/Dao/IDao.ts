import IDaoFactory from "./IDaoFactory";

export default interface IDao<T> {
    load(value: any): Promise<T>;
    save(o: T): void;
}