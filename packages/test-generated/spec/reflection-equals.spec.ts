import type {UnknownMessage} from "@protobuf-ts/runtime";
import {
    normalizeFieldInfo,
    reflectionEquals,
    ScalarType
} from "@protobuf-ts/runtime";
import {EnumFieldMessage} from "../ts-out/msg-enum";
import {ScalarMapsMessage} from "../ts-out/msg-maps";
import {OneofScalarMemberMessage} from "../ts-out/msg-oneofs";


enum TestEnum {
    A = 0,
    B = 1,
    C = 2,
}


describe('reflectionEquals()', function () {


    beforeEach(function () {
        jasmine.addCustomEqualityTester((a, b) =>
            (a instanceof Uint8Array && b instanceof Uint8Array) ? a.byteLength === b.byteLength : undefined
        );
    });


    it('should return true for same instance', function () {
        let eq = reflectionEquals({typeName: "test", fields: [], options: {}}, {}, {});
        expect(eq).toBeTrue();
    });

    it('should return true for undefined, undefined', function () {
        let eq = reflectionEquals({typeName: "test", fields: [], options: {}}, undefined, undefined);
        expect(eq).toBeTrue();
    });

    it('should return false for message, undefined', function () {
        let eq = reflectionEquals({typeName: "test", fields: [], options: {}}, {}, undefined);
        expect(eq).toBeFalse();
    });

    it('should return false for different scalar field value', function () {
        let eq = reflectionEquals({
            typeName: "test", fields: [
                normalizeFieldInfo({no: 1, name: "value", kind: "scalar", T: ScalarType.INT32}),
                normalizeFieldInfo({no: 2, name: "unit", kind: "enum", T: () => ["spec.TestEnum", TestEnum]})
            ], options: {}
        }, {
            unit: 1,
            value: 429,
        }, {
            unit: 1,
            value: 458,
        });
        expect(eq).toBeFalse();
    });

    it('should ignore excess properties', function () {
        let info = {typeName: "test", fields: [], options: {}};
        let eq = reflectionEquals(info, {x: 123}, {});
        expect(eq).toBeTrue();
    });

    it('should detect non-equal bytes fields', function () {
        let info = {
            typeName: "test",
            fields: [normalizeFieldInfo({no: 1, name: "bytes", kind: "scalar", T: ScalarType.BYTES})],
            options: {}
        };
        let a = {bytes: new Uint8Array([1, 2, 3])};
        let b = {bytes: new Uint8Array([4, 5, 6])};
        let c = {bytes: new Uint8Array([1, 2, 3])};
        expect(reflectionEquals(info, a, b)).toBeFalse();
        expect(reflectionEquals(info, a, c)).toBeTrue();
    });

    it('oneof scalars are equal', () => {
        const make = (): OneofScalarMemberMessage => ({
            result: {
                oneofKind: "value",
                value: 42
            }
        });
        const eq = reflectionEquals(
            OneofScalarMemberMessage,
            make() as unknown as UnknownMessage,
            make() as unknown as UnknownMessage
        );
        expect(eq).toBeTrue();
    });

    it('enum messages are equal', () => {
        const make = (): EnumFieldMessage => ({
            enumField: 1,
            repeatedEnumField: [0, 1, 2],
            aliasEnumField: 1,
            prefixEnumField: 2,
        });

        const eq = reflectionEquals(
            EnumFieldMessage,
            make() as unknown as UnknownMessage,
            make() as unknown as UnknownMessage
        );
        expect(eq).toBeTrue();
    });

    it('maps messages are equal', () => {
        const make = (): ScalarMapsMessage => ({
            strStrField: {"a": "a"},
            strInt32Field: {"a": 42},
            strInt64Field: {"a": BigInt("42")},
            int32StrField: {42: "a"},
            int64StrField: {"42": "a"},
            strBoolField: {"a": true},
            strBytesField: {"a": new Uint8Array()},
            boolStrField: {true: "a"}
        });

        const eq = reflectionEquals(
            ScalarMapsMessage,
            make() as unknown as UnknownMessage,
            make() as unknown as UnknownMessage
        );
        expect(eq).toBeTrue();
    });

});
