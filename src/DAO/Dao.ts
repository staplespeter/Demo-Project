import IDaoFactory from "./IDaoFactory";
import IDaoRecord from "./IDaoRecord";

export default class Dao {
    readonly factory: IDaoFactory;
    readonly objectName: string = null;
    readonly fields: Array<string> = new Array<string>();
    readonly records: Array<IDaoRecord> = null;
    readonly currentRecord: IDaoRecord = null;
    filterField: string = null;
    filterValue: any = null;

    constructor(daoFactory: IDaoFactory, objectName: string) {
        this.factory = daoFactory;
        this.objectName = objectName;
    }

    load(populate?: boolean): Number { 
        return 0;
    }

    loadWithFilter(filterField: string, filterValue: any, populate?: boolean): Number {
        return 0;
    }

    loadFields(fields: string, filterField?: string, filterValue?: any, populate?: boolean): Number {
        return 0;
    }

    save(): Number {
        return 0;
    }

    discard(): Number {
        return 0;
    }

    first(): IDaoRecord {
        return null;
    }

    last(): IDaoRecord {
        return null;
    }

    prev(): IDaoRecord {
        return null;
    }

    next(): IDaoRecord {
        return null;
    }
}