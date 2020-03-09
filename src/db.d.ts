/// <reference types="node" />
export declare class DB {
    _db: Map<string, Buffer>;
    constructor();
    set(key: Buffer, value: Buffer): void;
    get(key: Buffer): Buffer | undefined;
}
