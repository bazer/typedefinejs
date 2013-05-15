/// <reference path="../d.ts/DefinitelyTyped/underscore/underscore-typed.d.ts" />

module typedefine {
    export interface Options {
        obj: any;
        name: string;
        version: string;
    }

    export class Reader {
        private obj;
        private typing: Typing;
        private options: Options;
        private objGraph: Type;
        public static functions: Type[] = [];

        constructor(options: Options) {
            this.options = options;
            
            this.objGraph = new Type(options.name, options.obj);
            this.typing = new Typing(options.name, options.version);
        }

        public toString() {
            //return _.map(Reader.functions, x => x.toString()).join("\n");
            return this.objGraph.toString();
        }
    }

    export class Type {
        public isPrimitive: bool = true;
        public primitiveType: string;
        public types: Type[] = [];
        public params: Params[] = [];

        constructor(public name: string, public obj: any) {
            

            this.addType(obj);
            //console.log(name + ": " + this.primitiveType);

            if (!this.isPrimitive) {
                if (_.isFunction(obj)) {
                    this.params.push(new Params(obj));
                }

                var plainKeys = Object.keys(obj);
                var protoKeys = Object.keys(obj['__proto__']);
                var keys = plainKeys.concat(protoKeys).sort();


                _(keys).each((name) => {
                    var variable = obj[name];

                    if (_.isFunction(variable)) {
                        var func = new Type(name, variable);
                        obj[name] = func.replaceFunction(variable);

                        this.types.push(func);
                        //Definejs.Reader.functions.push(func);
                    }
                    else {
                        this.types.push(new Type(name, variable));
                    }
                });
            }
        }

        public addType(obj) {
            if (_.isString(obj))
                this.primitiveType = "string";
            else if (_.isBoolean(obj))
                this.primitiveType = "boolean";
            else if (_.isNumber(obj))
                this.primitiveType = "number";
            else if (_.isElement(obj))
                this.primitiveType = "DOMElement";
            else if (_.isArray(obj))
                this.primitiveType = "Array";
            else if (_.isDate(obj))
                this.primitiveType = "Date";
            else if (_.isRegExp(obj))
                this.primitiveType = "RegExp";
            else if (_.isObject(obj)) {
                this.isPrimitive = false;

                //if (_.isFunction(obj))

            }
        }

        public hasType() {
            return this.isPrimitive && !_.isEmpty(this.primitiveType);
        }
        
        public toString(indent: number = 0) {
            
            var indentation = _.times(indent, x => "    ").join("");
            var str = indentation + this.name;

            if (this.isPrimitive) {

                if (this.hasType())
                    return str + ": " + this.primitiveType;
                else
                    return str;
            }
            else {
                str += ": (";

                str += _(this.params[1])
                        .map(x => x.toString())
                        .join(", ");

                str += ")";

                if (this.hasType())
                    str += " => " + this.primitiveType;

                if (this.types.length > 0) {
                    str += " { \n";

                    str += _(this.types)
                            .map(x => x.toString(indent + 1))
                            .join(",\n");

                    str += "\n" + indentation + "}";
                }

                return str;
            }
        }

        public replaceFunction(originalFunction) {
            var _this = this;

            return function () {
                console.log("override: " + _this.name);

                _this.params.push(new Params(_this.obj, arguments));

                var value = originalFunction.apply(this, arguments);

                _this.addType(value);

                return value;
            }
        }
    }

    export class Params {
        public types: Type[] = [];

        constructor(func, args?: any = []) {
            var params = this.getParameters(func);

            for (var i = 0; i < params.length; i++) {
                this.types.push(new Type(params[i], args[i]));
            }
        }

        private getParameters(obj): string[] {

            // Regex to match the parameters declaration
            var matchParameters = /\(.*\)/;

            // Regex to match trailing and leading whitespace for trimming
            var matchToTrim = /^\s+|\s+$/g;

            // Get the first match for the parameters declaration (the other ones could be anything)
            var strParameters = obj.toString().match(matchParameters)[0];

            // Get rid of the ( and ), then split by the parameter separator (,)
            var arrParameters = strParameters.substring(1, strParameters.length - 1).split(',');

            // Trim whitespace from each parameter name
            arrParameters = arrParameters.map(function (element) {
                return element.replace(matchToTrim, '');
            });

            return arrParameters;
        };
    }

    //export class Variable {
    //    public type: Type[];

    //    constructor(name: string, obj?: any) {

    //    }
    //}

    //export class Function extends Type {
    //    public types: Type[];
    //    public params: Type[];

    //    constructor(name: string, obj: any) {
    //        super(name, obj);

    //        this.types = [];
    //        this.params = [];

    //        if (_.isFunction(obj)) {
    //            _(this.getParameters(obj)).each(x => this.params.push(new Variable(x)));
    //        }

    //        var plainKeys = Object.keys(obj);
    //        var protoKeys = Object.keys(obj.__proto__);
    //        var keys = plainKeys.concat(protoKeys).sort();


    //        _(keys).each((name) => {
    //            var variable = obj[name];

    //            if (_.isFunction(variable)) {
    //                var func = new Function(name, variable);
    //                obj[name] = func.replaceFunction(variable);

    //                this.types.push(func);
    //                Definejs.Reader.functions.push(func);
    //            }
    //            else {
    //                this.types.push(new Variable(name, variable));
    //            }
    //        });
    //    }

    //    public replaceFunction(originalFunction) {
    //        var _this = this;

    //        return function () {
    //            console.log("override: " + _this.name);

    //            for (var i = 0; i < arguments.length; i++){
    //                _this.params[i].addType(arguments[i]);
    //            }

    //            var value = originalFunction.apply(this, arguments);
                
    //            _this.addType(value);

    //            return value;
    //        }
    //    }

    //    public toString(indent: number = 0) {
    //        var indentation = _.times(indent, x => "    ").join("");

    //        var str = indentation + this.name + ": (";

    //        str += _(this.params)
    //                .map(x => x.toString())
    //                .join(", ");

    //        str += ")";

    //        if (this.hasType())
    //            str += " => " + this.primitiveType;

    //        if (this.types.length > 0) {
    //            str += " { \n";

    //            str += _(this.types)
    //                    .map(x => x.toString(indent + 1))
    //                    .join(",\n");

    //            str += "\n" + indentation + "}";
    //        }

    //        return str;
    //    }

    //    private getParameters(obj) {
            

    //        // Regex to match the parameters declaration
    //        var matchParameters = /\(.*\)/;

    //        // Regex to match trailing and leading whitespace for trimming
    //        var matchToTrim = /^\s+|\s+$/g;

    //        // Get the first match for the parameters declaration (the other ones could be anything)
    //        var strParameters = obj.toString().match(matchParameters)[0];

    //        // Get rid of the ( and ), then split by the parameter separator (,)
    //        var arrParameters = strParameters.substring(1, strParameters.length - 1).split(',');

    //        // Trim whitespace from each parameter name
    //        arrParameters = arrParameters.map(function (element) {
    //            return element.replace(matchToTrim, '');
    //        });

    //        return arrParameters;
    //    };
    //}

    //export class Variable extends Type {
    //    constructor(name: string, obj?: any) {
    //        super(name, obj);
    //    }
    //}




    export class Typing {
        //public name: string;
        //public version: string;
        public interfaces : Interface[];

        constructor(public name: string, public version: string) {
            this.interfaces = [];
        }

        public toString() {
            var str = "// Type definitions for " + this.name + " " + this.version + "\n";

            str += _.map(this.interfaces, (x) => {
                return x.toString() + "\n";
            });

            return str;
        }
    }

    export class Interface {
        public definitions: Definition[];

        constructor(public name: string) {
            this.definitions = [];
        }

        public toString() {
            var str = "interface " + name + "{\n";

            str += _.map(this.definitions, (x) => {
                return x.toString() + "\n";
            });

            str += "}\n\n";

            return str;
        }

    }

    export class Definition {
        public name: string;
        public type;

        constructor() {
        }

        public toString() {
            return this.name + ": " + this.type + ";";
        }
    }

    //export class Function extends Definition {
    //    public parameters: Definition[];

    //}

    //export class Member extends Definition {
    //    public parameters;

    //}
}


//class Test {
//    public aTestProperty: string = "foo";
//    public aTestFunction(param1, param2) {
//        return "bar";
//    }
//}
 
var Test = (function () {
    function Test() {
        this.aTestProperty = "foo";
    }
    Test.prototype.aTestFunction = function (param1, param2) {
        return param1.var1 + ", " + param1.var2 + ", " + param2;
    };
    return Test;
})();

window.onload = () => {
    var test = new Test();

    var reader = new typedefine.Reader({
        name: "test",
        version: "0.1",
        obj: test
    });

    
    console.log(test.aTestProperty);
    console.log(test.aTestFunction({var1: "var1", var2: 2, var3: false}, "3", "foo"));

    

    //var reader = new Definejs.Reader({
    //    name: "underscore",
    //    version: "1.4.4",
    //    obj: _
    //});

    //var obj = $("#content");

    //var reader = new Definejs.Reader({
    //    name: "jQuery",
    //    version: "2.0.0",
    //    obj: obj
    //});

    //obj.html("Modifed by jQuery");

    console.log(reader.toString());

    //reader.readObject(_);
    //var num = _.random(10);
    //console.log(num);


};