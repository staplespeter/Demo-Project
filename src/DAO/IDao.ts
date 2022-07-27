import IDaoRecord from "./IDaoRecord";

export default interface IDao {
    objectName: string;
    fields: Array<string>;
    records: Array<IDaoRecord>;
    currentRecord: IDaoRecord;
    filterField: string;
    filterValue: any;

    load(populate?: boolean): Number;
    loadWithFilter(filterField: string, filterValue: any, populate?: boolean): Number;
    loadFields(fields: string, filterField?: string, filterValue?: any, populate?: boolean): Number;
    save(): Number;
    discard(): Number;
    first(): IDaoRecord;
    last(): IDaoRecord;
    prev(): IDaoRecord;
    next(): IDaoRecord;
}