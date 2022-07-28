import IDaoRecord from "./IDaoRecord";

export default interface IDao {
    readonly objectName: string;
    readonly currentRecord: IDaoRecord;
    readonly bof: boolean;
    readonly eof: boolean;
    readonly recordCount: number;
    //JS cannot accept a parameter on an accessor method.  Proper method required.  Language fail
    //could provide iterator.
    getRecord(x: number): IDaoRecord;
    readonly fieldCount: number;
    getField(x: number): string;
    

    //JS overloading sucks. Use optional params.
    load(fields?: Array<string>, filter?: string, populate?: boolean): Promise<number>;
    save(): number;
    discard(): number;
    first(): IDaoRecord;
    last(): Promise<IDaoRecord>;
    prev(): IDaoRecord;
    next(): Promise<IDaoRecord>;
}