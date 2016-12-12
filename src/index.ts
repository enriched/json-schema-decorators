import 'reflect-metadata';
import { JsonSchemaBuilder, JsonSchema } from 'ts-json-schema';
import * as ajv from 'ajv';

/**
 * The circular references must go through JSON Schema definitions so that they avoid deadlocks.
 */

let localAjv = ajv();

let SchemaCache = {};
const SCHEMA_KEY = '$schema'

export abstract class VerifiedData<T> {
  validator: ajv.ValidateFunction;
  get $schema(): JsonSchema {
    return Reflect.getMetadata(SCHEMA_KEY, this);
  }

  constructor(fields: any) {
    let schema = Reflect.getMetadata(SCHEMA_KEY, this);
    this.validator = localAjv.compile(schema);
    if (!this.validator(fields)) {
      throw new Error('Data was invalid:\n  ' + this.validator.errors.map(e => e.message).join('\n  '));
    }
  }
}

export function ValidatedProperty(opt?: ValidationOptions) {
  if (!opt) {
    opt = {};
  }
  return (target: any, key: string) => {
    // let metadataKeys = Reflect.getMetadataKeys(target, key);
    // console.log(metadataKeys);
    let reflectType = Reflect.getMetadata('design:type', target, key);
    let typeSchema = getSchema(reflectType);
    let currentSchema: JsonSchema = Reflect.getMetadata(SCHEMA_KEY, target);
    let builder = new JsonSchemaBuilder(currentSchema);
    if (!currentSchema) {
      currentSchema = {};
    }
    if (typeSchema) {
      console.dir(typeSchema);
      builder.property(key, typeSchema);
    } else {

    }
    let type = reflectTypeToSchemaType(reflectType);
    if (opt.schema) {
      builder.property(key, opt.schema);
    } else if (typeSchema) {

    } else {
      builder.property(key, (property) => {
        if (type) {
          property.type(type);
        }
      });
    }
    if (!opt.optional) {
      builder.property(key, b => b.required())
    }
    currentSchema = builder.build();
    Reflect.defineMetadata(SCHEMA_KEY, currentSchema, target);
  }
}

export interface ValidationOptions {
  schema?: JsonSchema;
  optional?: boolean;
}

function getSchema(target: any) {
  if (target.prototype) {
    return Reflect.getMetadata(SCHEMA_KEY, target.prototype);
  }
}

function reflectTypeToSchemaType(reflectType: any): string {
  console.dir(Object.getOwnPropertyNames(reflectType));
  if (reflectType.name) {
    console.log(reflectType.name);
    return reflectType.name.toLowerCase();
  }
}

class SomeOtherData extends VerifiedData<SomeData> {
  @ValidatedProperty()
  propA: string;
  @ValidatedProperty()
  propB: number;
}


class SomeData extends VerifiedData<SomeData> {
  @ValidatedProperty()
  propOne: string;
  @ValidatedProperty()
  propTwo: number;
  @ValidatedProperty()
  propThree: SomeOtherData;
}



let someData = new SomeData({
  propOne: 'hi',
  propTwo: 2,
  propThree: {
    propA: 'hi',
    propB: 3
  }
});

let someOtherData = new SomeOtherData({
  propA: 'hi',
  propB: 2
});

