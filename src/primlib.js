/* LogicEngine (c) 2019 Simon Foden */
/* Note all code here runs in a web worker or node child process */
(function (root, factory) {

    var bigFile = './BigInteger.min';
//    var bigFile = 'https://peterolson.github.io/BigInteger.js/BigInteger.min.js'
    if (typeof define === 'function' && define.amd) { // AMD
        define([bigFile], factory);
    } else if (typeof exports === 'object' && typeof module !== 'undefined') { //commonJS
        module.exports = factory(require('big-integer'));
    } else {
        if (root.importScripts)
            importScripts(bigFile + '.js'); // no module WebWorker only
        root.primLib = factory(root.bigInt);
    }
}(this, function (BigNumber) {
    var primlib = {
        buffer: {
            type: "Primitive",
            pins: {
                i: {
                    type: "Input"
                },
            },
            func: function (i) {
                return i;
            }
        },
        add2: {
            type: "Primitive",
            pins: {
                a: {
                    type: "Input"
                },
                b: {
                    type: "Input"
                },
            },
            func: function (a, b) {
                return a + b;
            }
        },
        andb: {
            type: "add2",
            func: function (a, b) {
                return a & b;
            }
        },
        shiftreg: {
            type: "Primitive",
            pins: {
                clock: {
                    type: "Input"
                },
                d: {
                    type: "Input"
                },
                clr: {
                    type: "Input"
                }
            },
            func: function (clock, d, clr) {
                if (clr === 0) {
                    return 0;
                } else if (clock === 0) {
                    return this.value;
                } else {
                    return (this.value << 1) | (d ? 1 : 0);
                }
            }
        },
        invert: {
            type: "buffer",
            func: function (a) {
                return isNaN(a) ? undefined : !a;
            },
        },
        minus: {
            type: "buffer",
            func: function (a) {
                return isNaN(a) ? undefined : -a;
            },
        },
        addBig2: {
            type: "add2",
            func: function (a, b) {
                return (a == undefined) || (b == undefined) ? undefined : BigNumber(a).plus(b);
            },
            "equals": "bigEquals"
        },
        equalsVar: {
            type: "add2",
            func: function (a, b) {
                return a === b;
            }
        },
        alwaysTrue: {
            type: "equalsVar",
            func: function () {
                return true;
            }
        },
        alwaysFalse: {
            type: "equalsVar",
            func: function () {
                return false;
            }
        },
        LT: {
            type: "equalsVar",
            func: function (a, b) {
                return a < b;
            }
        },
        bigEquals: {
            type: "equalsVar",
            func: function (a, b) {
                return a.equals(b);
            }
        },
        bigLT: {
            type: "LT",
            func: function (a, b) {
                return a.lt(b);
            }
        },
        BigNumber: {
            type: "buffer",
            func: function (i) {
                return BigNumber(i);
            }
        },


        BigDigit: {
            type: "Primitive",
            pins: {
                d: {
                    type: "Input"
                },
                index: {
                    type: "Input"
                },
            },
            func: function (d, index) {
                return d.number[index];
            }
        },
        count: {
            type: "Primitive",
            pins: {
                inc: {
                    type: "Input",
                    arg: 0
                },
                qin: {
                    type: "Input",
                    arg: 1
                },
            },
            func: function (inc, qin) {
                if (isNaN(inc)) return undefined;
                else if (isNaN(qin)) return 0.0;
                else return parseFloat(inc) + parseFloat(qin);
            }
        },
        dff: {
            type: "Primitive",
            pins: {
                ck: {
                    type: "Input",
                    arg: 0
                },
                d: {
                    type: "Sensor",
                    arg: 1
                }
            },
            func: function (ck, d) {
                if (isNaN(ck))
                    return undefined;
                else return ck ? d : this.value;
            }
        },
        srff: {
            type: "Primitive",
            pins: {
                s: {
                    type: "Input",
                    arg: 0
                },
                r: {
                    type: "Input",
                    arg: 1
                }
            },
            func: function (s, r) {
                if (isNaN(s) || isNaN(r))
                    return undefined;
                else return s ? true : r ? false : this.value;
            }
        },
        mux2: {
            type: "Primitive",
            pins: {
                s: {
                    type: "Input",
                    arg: 0
                },
                i0: {
                    type: "Input",
                    arg: 1
                },
                i1: {
                    type: "Input",
                    arg: 2
                },
            },
            func: function (s, i0, i1) {
                if (isNaN(s))
                    return undefined;
                else return s ? i1 : i0;
            }
        },
    };
    /*if (typeof BigInt !== 'undefined') {
        primlib.BigNumber.func = function (i) {
            return BigInt(i);
        };
        primlib.bigLT.func = primlib.LT.func;
        primlib.bigEquals.func = primlib.equalsVar.func;
        primlib.addBig2.func = function (a, b) {
            return (a == undefined) || (b == undefined) ? undefined : BigInt(a) + BigInt(b);
        };
    }
*/
    return primlib;
}));