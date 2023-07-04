import IField from "./IField";

export default interface IRecord {
    isNew: boolean;
    hasChanged: boolean;
    readonly primaryKeyField: IField;
    readonly fieldCount: number;
    getField(name: string): IField;
    getFieldByIndex(x: number): IField;

    //todo: record specific load and save
    //load(): void;
    //save(table: any): Promise<void>;
    discard(): number;
}