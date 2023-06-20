import IRecord from "./IRecord";

export default interface IRecordset {
    readonly objectName: string;
    readonly currentRecord: IRecord;
    readonly bof: boolean;
    readonly eof: boolean;
    readonly recordCount: number;
    //JS cannot accept a parameter on an accessor method.  Proper method required.  Language fail
    //could provide iterator.
    getRecord(x: number): IRecord;
    readonly fieldCount: number;
    

    //JS overloading sucks. Use optional params.
    load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<number>;
    save(): Promise<number>;
    discard(): number;
    addRecord(): IRecord;
    addRecord(values?: Map<string, any>): IRecord;
    first(): IRecord;
    last(): IRecord;
    prev(): IRecord;
    next(): IRecord;
}