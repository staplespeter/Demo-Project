import DaoField from "./DaoField";
import IDaoField from "./IDaoField";
import IDaoRecord from "./IDaoRecord";

export default class DaoRecord implements IDaoRecord {
    isNew: boolean = false;
    hasChanged: boolean = false;
    fields: Array<IDaoField> = new Array<DaoField>;


    load(): void {

    }

    save(): void {

    }

    discard(): void {
        
    }
}