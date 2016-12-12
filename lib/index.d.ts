import 'reflect-metadata';
import { JsonSchema } from 'ts-json-schema';
import * as ajv from 'ajv';
export declare abstract class VerifiedData<T> {
    validator: ajv.ValidateFunction;
    readonly $schema: JsonSchema;
    constructor(fields: any);
}
export declare function ValidatedProperty(opt?: ValidationOptions): (target: any, key: string) => void;
export interface ValidationOptions {
    schema?: JsonSchema;
    optional?: boolean;
}
