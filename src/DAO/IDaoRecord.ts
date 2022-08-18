import IDaoField from "./IDaoField";

export default interface IDaoRecord {
    isNew: boolean;
    hasChanged: boolean;
    readonly primaryKeyField: IDaoField;
    readonly fieldCount: number;
    getField(name: string): IDaoField;
    getFieldByIndex(x: number): IDaoField;

    //todo: record specific load and save
    //load(): void;
    //save(table: any): Promise<void>;
    discard(): number;
}