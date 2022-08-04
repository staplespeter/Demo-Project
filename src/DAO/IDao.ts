import IDaoFieldDef from "./IDaoFieldDef";
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
    getFieldDef(x: number): IDaoFieldDef;
    

    //JS overloading sucks. Use optional params.
    load(fields?: Array<string>, filter?: string, maxRows?: number): Promise<number>;
    save(): Promise<number>;
    discard(): number;
    addRecord(): IDaoRecord;
    addRecord(values?: Map<string, any>): IDaoRecord;
    first(): IDaoRecord;
    last(): Promise<IDaoRecord>;
    prev(): IDaoRecord;
    next(): Promise<IDaoRecord>;
}