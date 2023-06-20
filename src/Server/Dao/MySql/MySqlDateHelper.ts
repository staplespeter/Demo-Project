export function toMySqlDateTimeGmt(datetime?: Date) {
    //"2011-10-05T14:48:00.000Z" => "2011-10-05 14:48:00.000"
    return datetime?.toISOString().replace('T', ' ').slice(0, 23);
}