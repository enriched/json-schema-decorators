"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
require("reflect-metadata");
var ts_json_schema_1 = require("ts-json-schema");
var ajv = require("ajv");
/**
 * The circular references must go through JSON Schema definitions so that they avoid deadlocks.
 */
var localAjv = ajv();
var SchemaCache = {};
var SCHEMA_KEY = '$schema';
var VerifiedData = (function () {
    function VerifiedData(fields) {
        var schema = Reflect.getMetadata(SCHEMA_KEY, this);
        this.validator = localAjv.compile(schema);
        if (!this.validator(fields)) {
            throw new Error('Data was invalid:\n  ' + this.validator.errors.map(function (e) { return e.message; }).join('\n  '));
        }
    }
    Object.defineProperty(VerifiedData.prototype, "$schema", {
        get: function () {
            return Reflect.getMetadata(SCHEMA_KEY, this);
        },
        enumerable: true,
        configurable: true
    });
    return VerifiedData;
}());
exports.VerifiedData = VerifiedData;
function ValidatedProperty(opt) {
    if (!opt) {
        opt = {};
    }
    return function (target, key) {
        // let metadataKeys = Reflect.getMetadataKeys(target, key);
        // console.log(metadataKeys);
        var reflectType = Reflect.getMetadata('design:type', target, key);
        var typeSchema = getSchema(reflectType);
        var currentSchema = Reflect.getMetadata(SCHEMA_KEY, target);
        var builder = new ts_json_schema_1.JsonSchemaBuilder(currentSchema);
        if (!currentSchema) {
            currentSchema = {};
        }
        if (typeSchema) {
            console.dir(typeSchema);
            builder.property(key, typeSchema);
        }
        else {
        }
        var type = reflectTypeToSchemaType(reflectType);
        if (opt.schema) {
            builder.property(key, opt.schema);
        }
        else if (typeSchema) {
        }
        else {
            builder.property(key, function (property) {
                if (type) {
                    property.type(type);
                }
            });
        }
        if (!opt.optional) {
            builder.property(key, function (b) { return b.required(); });
        }
        currentSchema = builder.build();
        Reflect.defineMetadata(SCHEMA_KEY, currentSchema, target);
    };
}
exports.ValidatedProperty = ValidatedProperty;
function getSchema(target) {
    if (target.prototype) {
        return Reflect.getMetadata(SCHEMA_KEY, target.prototype);
    }
}
function reflectTypeToSchemaType(reflectType) {
    console.dir(Object.getOwnPropertyNames(reflectType));
    if (reflectType.name) {
        console.log(reflectType.name);
        return reflectType.name.toLowerCase();
    }
}
var SomeOtherData = (function (_super) {
    __extends(SomeOtherData, _super);
    function SomeOtherData() {
        return _super.apply(this, arguments) || this;
    }
    return SomeOtherData;
}(VerifiedData));
__decorate([
    ValidatedProperty()
], SomeOtherData.prototype, "propA", void 0);
__decorate([
    ValidatedProperty()
], SomeOtherData.prototype, "propB", void 0);
var SomeData = (function (_super) {
    __extends(SomeData, _super);
    function SomeData() {
        return _super.apply(this, arguments) || this;
    }
    return SomeData;
}(VerifiedData));
__decorate([
    ValidatedProperty()
], SomeData.prototype, "propOne", void 0);
__decorate([
    ValidatedProperty()
], SomeData.prototype, "propTwo", void 0);
__decorate([
    ValidatedProperty()
], SomeData.prototype, "propThree", void 0);
var someData = new SomeData({
    propOne: 'hi',
    propTwo: 2,
    propThree: {
        propA: 'hi',
        propB: 3
    }
});
var someOtherData = new SomeOtherData({
    propA: 'hi',
    propB: 2
});
