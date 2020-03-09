/// <reference types="node" />
import { DB } from './db';
declare type Hasher = (v: Buffer) => Buffer;
declare type Proof = Buffer[];
interface CompactProof {
    bitmask: Buffer;
    proof: Proof;
}
/**
 * Sparse Merkle tree
 */
export declare class SMT {
    _db: DB;
    _root: Buffer;
    _defaultValues: Buffer[];
    _hasher: Hasher;
    constructor(hasher?: Hasher);
    get root(): Buffer;
    put(key: Buffer, value?: Buffer): void;
    get(key: Buffer): Buffer | undefined;
    prove(key: Buffer): Proof;
    verifyProof(proof: Proof, root: Buffer, key: Buffer, value?: Buffer): boolean;
    verifyCompactProof(cproof: CompactProof, root: Buffer, key: Buffer, value?: Buffer): boolean;
    compressProof(proof: Proof): CompactProof;
    decompressProof(cproof: CompactProof): Proof;
    hash(value: Buffer): Buffer;
}
export {};
