/* LogicEngine (c) 2019 Simon Foden */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(factory);
    } else if (typeof exports === 'object' && typeof module !== 'undefined') { //commonJS
        module.exports = factory();
    } else {
        root.LogicEngine = factory();
    }
}(this, function () {

    var isAMD = typeof define === 'function' && define.amd,
        isNode = typeof exports === 'object' && typeof module !== 'undefined';

    var engineTopics = Object.create(null);
    var engineError = Error;
    var wName = 'pWorker'; //'obfuscated';
    var wFile = './' + wName + '.js';
    var send, bHubReady = false,
        pubBuffer = [];

    function pub(oo) {
        //    console.log("hub "+oo.topic);
        if (!oo.topic) {
            engineError('no topic');
        }
        var array = engineTopics[oo.topic];
        if (!array) {
            engineError('unheard: ' + oo.topic);
        } else {
            for (var i = 0, len = array.length; i < len; i++) {
                array[i].call(this, oo);
            }
        }
    }

    function sub(topic, handler) {
        (engineTopics[topic] || (engineTopics[topic] = [])).push(handler);
    }

    function publish(mm) {
        if (engineTopics[mm.topic]) {
            pub(mm);
        } else {
            if (bHubReady) {
                send(mm);
            } else {
                pubBuffer.push(mm);
            }
        }
    }
    sub('worker ready', function () {
        bHubReady = true;
        pubBuffer.forEach(function (mm) {
            send(mm);
        });
        publish({
            topic: "ready"
        });
    });


    if (isNode) {
        var cp = require('child_process');
        var argv = process.execArgv.join();
        var isDebug = argv.includes('inspect');
        var execArgv = process.env.WorkerDebug || '--inspect-brk=40777';

        var hubChild = isDebug ? cp.fork(wFile, [], {
            execArgv: [execArgv]
        }) : cp.fork(wFile);

        hubChild.on('message', pub);
        send = function (mm) {
            hubChild.send(mm);
        };
    } else {
        var blob = new Blob(['!function(e,i){var n="http://esfoden.github.io/LogicEngine/dist/primlib";if("undefined"==typeof window&&"undefined"!=typeof importScripts){try{importScripts("./require.min.js")}catch(t){importScripts(n+".js"),i(e.primLib)}"undefined"!=typeof require&&require({baseUrl:"../src/"},[n],i)}else"object"==typeof exports&&"undefined"!=typeof module?module.exports=i(require("./"+n)):"function"==typeof define&&define.amd&&define([n],i)}(this,function(t){var e,i="undefined"==typeof window&&"undefined"!=typeof importScripts,n="object"==typeof exports&&"undefined"!=typeof module,r=t.BigNumber.func,s=t.addBig2.func,o=Object.create(null),a=Error;function u(t){(e=t)({topic:"worker ready"})}function c(t){if(!t.topic)throw a("no topic");var e=o[t.topic];if(!e)throw a("unheard: "+t.topic);for(var i=0,n=e.length;i<n;i++)e[i].call(this,t)}function l(t,e){(o[t]||(o[t]=[])).push(e)}function p(t){o[t.topic]?c(t):e(t)}function h(t,e){for(var i in t){var n=t[i].tell(e);if(n)return n}return 0}Object.prototype.tell=function(t){var e=this[t.topic];return e instanceof Function?e.call(this,t):this.broadcast(t)},Object.prototype.broadcast=function(t,e){var i=e||this;for(var n in this)if(Object.prototype.hasOwnProperty.call(this,n)){var r=this[n];r.name=n,r.parent=i;var s=r.tell(t);if(s)return s}return 0},Object.prototype.bless=function(t){if(Object.prototype.hasOwnProperty.call(this,"type")){var e=b(this.type);if(!e)throw a("bless fail "+this.type);Object.setPrototypeOf(this,e),this._type=this.type,delete this.type,Object.prototype.hasOwnProperty.call(this,"pins")&&this.tellPins(t)}return this.broadcast(t)},Array.prototype.broadcast=function(t){for(var e=0,i=this.length;e<i;e++){var n=this[e].tell(t);if(n)return n}return 0};var f={},d="_",v=100,y="?";function b(t){return f[t]}function m(t,e){f[t]=e}function O(t){Object.setPrototypeOf(t,f),(f=t).tell({topic:"bless"})}var P=Object.create(null),g=[],j={},w=t.bigLT.func,S=r(0),I="0",N={tellInputs:function(t){return this.inputs.tell(t)},tellOutputs:function(t){return this.outputs.tell(t)},pushvalues:function(t){return t.pargs.push(this.value),0},markEvaluation:function(t){return t.evalList[this.id]=this,0},record:function(t){return t.data[this.id]=this.value,0},stringify:function(t){var e=this.id;return t.st+=e+",",0},addInput:function(t){this.inputs.push(q(t))},addOutput:function(t){this.outputs.push(q(t))},toString:function(){function t(t){var e=t.st,i=e.length-1;","===e.charAt(i)&&(t.st=e.substr(0,i))}var e={topic:"stringify",st:this.id};return"constant"===this.func?e.st+=" = "+this.value:(e.st+=" (",this.tellInputs(e),t(e),e.st+=") "+this.func),e.st+=" -> (",this.tellOutputs(e),t(e),e.st+=")",e.st},dump:function(){return console.log(this.toString()),0},initFunc:function(){F(this.delay||v,this,this.value)},evaluate:function(){var t={topic:"pushvalues",pargs:[]};this.tellInputs(t);var e=this.iFunc.apply(this,t.pargs);return this.equalsFunc(e,this.last)||F(s(this.delay,S),this,e),0}};function q(t){var e=P[t];return e||((e=Object.create(N)).id=t,e.inputs=[],e.outputs=[],P[t]=e),e}function F(t,e,i){var n=t.toString(),r=j[n];r?r.push(e,i):(g.push(t),j[n]=[e,i]),e.last=i}var x={Constant:{type:"Primitive",func:function(){return this.value},equals:"alwaysFalse"},pubObject:{type:"Primitive",pins:{i0:{type:"Input"},o:{type:"Output"}},func:function(){var t={topic:"record",id:this.id,data:{}};return this.tellInputs(t),t.topic=this.pubTopic,p(t),this.value}},pubArray:{type:"pubObject",func:function(){for(var t={},e=0,i=arguments.length;e<i;e++){var n=arguments[e];t[e]=null==n?y:n.toString()}return p({topic:this.data,id:this.id,data:t}),this.value}},serialProperties:{type:"pubObject",func:function(t,e){var i=this.delay,n=S,r=e;if(void 0===r&&(r=this.propertis),void 0!==r){for(var s=r.split(" "),o=s.length,a=0;a<o;a++)F(n+=i,this,s[a]);F(n+i,this,void 0)}else{for(var u in t)!{}.hasOwnProperty.call(t,u)||F(n+=i,this,u);F(n+i,this,void 0)}return this.value}},display:{type:"pubObject",func:function(t){return p({topic:"displayText",text:t.toString(),id:this.id}),0}}};function k(t){if("constant"!==t.func||!P[t.id]){var e=q(t.id);for(var i in delete t.topic,t)!{}.hasOwnProperty.call(t,i)||(e[i]=t[i]);e.func=e.func||"constant";var n=b(e.func);if(!n)throw a("bad function "+e.func);e.iFunc=n.func,e.delay=e.delay?parseInt(e.delay):v,e.equalsFunc=e.equalsFunc||b(e.equals||"equalsVar").func,void 0!==e.value&&F(e.delay,e,e.value)}}function T(t,e,i){if(!t||!e)throw SimError("bad connection");var n=q(e);isNaN(i)?n.addInput(t):n.inputs[i]=q(t)}function E(t,e){if(!t||!e)throw SimError("bad connection");q(t).addOutput(e)}function C(t){return h(P,t)}function V(t,e,i){if("string"==typeof e){var n=b(e);if(!n)throw a("unknown type"+e);e=n}var r=Object.create(e);return r._type=t,Object.assign(r,i),m(t,r),r}function L(){return 0}l("createNode",k),l("connect",function(t){"sensor"!==t.mode&&E(t.from,t.to),"stimulus"!==t.mode&&T(t.from,t.to,t.input)}),l("addInput",function(t){q(t.ix).addInput(t.ax)}),l("addOutput",function(t){q(t.ix).addOutput(t.ax)}),l("updateNodeProperty",function(t){var e=q(t.id);delete t.id,delete t.topic,e.addProperties(t)}),l("schedule",function(t){var e=q(t.id),i=t.absolute?r(t.absolute):s(t.relative?t.relative:e.delay,S),n=t.value;t.bigValue?n=r(t.bigValue):t.eValue,F(i,e,n)}),l("step",function(){var t=function(){g.sort(w);var t=g.shift();if(void 0===t)return p({topic:"finished"}),1;I=(S=t).toString();var e=j[I];delete j[I];for(var i=e.shift(),n=Object.create(null);i;)i.value=e.shift(),i.tellOutputs({topic:"markEvaluation",evalList:n}),i=e.shift();return h(n,{topic:"evaluate"}),0<g.length}();p({topic:"simAdvance",time:I,bEventsPending:t})}),l("tellNodes",function(t){t.topic=t.message,C(t)}),l("resetSimulation",function(){g=[],j={},S=r(0),C({topic:"initFunc"});var t=b("resetSequence");if(t)for(var e=0,i=t.length;e<i;e++)p(t[e])});var M=V("Pin",{},{broadcast:L,copyPin:function(t){var e=t.dest;if(e.pins[this.name])throw SimError("duplicate pin");var i=Object.assign(Object.create(this),this);return i.driver=0,e.pins[this.name]=i,0},copyId:function(t){return t.template.pins[this.name].id=this.driver.id,0}}),_=V("Input",M,{resolve:function(t){if(!this.connect)return 0;var e=this.connect,i=this.cPin,n=t.caller.interior[e];if(!n)throw a("no such instance "+e);for(;"Via"==n._type;){var r=n.pins.i;if(e=r.connect,i=r.cPin,!(n=t.caller.interior[e]))throw a("no such instance "+e)}var s=i?n.pins[i]:n.OutputPin();if(!s)throw a("no output "+e);if(this.driver){if(s.driver)throw a("driver?");s.driver=this.driver}else s.driver||(s.driver=t.caller.internal(e,i)),this.driver=s.driver;return 0},connectNodes:function(t){if(!this.driver)return 0;var e=this.driver.id;return E(e,t.id),T(e,t.id,this.arg),0}}),A=V("Output",M,{resolveFinal:function(t){return this.driver||(this.driver=t.caller.internal(this.parent.name)),0}}),z=V("Internal",M,{copyId:function(t){return this.id=this.parent.fullName+this.name,0}}),B=(V("Stimulus",_,{connectNodes:function(t){return E(this.driver.id,t.id),0}}),V("Sensor",_,{connectNodes:function(t){return T(this.driver.id,t.id,this.arg),0}}),V("Scalar",{},{OutputPin:function(){return this.pins.o},tellPins:function(t){return this.pins?this.pins.broadcast(t,this):0},copyPins:function(t){t.pins=t.pins||{},this.pins.broadcast({topic:"copyPin",dest:t})},createPin:function(t,e){return this.pins=this.pins||{},this.pins[t]=this.pins[t]||Object.create(e),this.pins[t]},broadcast:L,check:L,resolveTerminal:L,resolveFinal:L,resolveInternal:L,size:L}));V("Primitive",B,{check:function(t){return this.pins&&this.OutputPin()||this.createPin("o",A),0},resolveInternal:function(t){return this.tellPins({topic:"resolve",caller:this.parent})},resolveFinal:function(t){return this.tellPins({topic:"resolveFinal",caller:this.parent})},createNodes:function(t){var e=this.OutputPin().driver.id;return k({id:e,func:Object.getPrototypeOf(this).name,delay:this.delay,value:this.value,data:this.data,equals:this.equals}),this.tellPins({topic:"connectNodes",id:e}),0}}),V("Module",B,{broadcast:function(t){return t.flatten&&(this.fullName=Object.prototype.hasOwnProperty.call(this.parent,"fullName")?this.parent.fullName+this.name+d:"",this.tellPins({topic:"copyId",template:Object.getPrototypeOf(this)}),this.internals.broadcast({topic:"copyId"},this)),this.interior.broadcast(t,this)},resolve:function(t){this.broadcast({topic:"resolveTerminal"}),this.broadcast({topic:"resolveInternal"}),this.broadcast({topic:"resolveFinal"})},resolveInternal:function(t){return this.tellPins({topic:"resolve",caller:this.parent})},parsePin:function(t,e){var i=this.interior[t];if(!i)throw a("no such instance "+t);var n=e?i.pins[e]:i.OutputPin();if(!n)throw a("no output");return n},internal:function(t,e){var i=t;e&&(i+=d+e);var n=this.internals[i];return n||(n=Object.create(z),this.internals[i]=n),n},performCheck:function(){"Module"==Object.getPrototypeOf(this)._type&&(this.internals={}),this.broadcast({topic:"check"})},size:function(t){return t.nodeCount+=this.internals?Object.keys(this.internals).length:0,this.broadcast(t),0}});var G=V("Terminal",B,{resolveTerminal:function(t){return this.tellPins({topic:"resolve",caller:this.parent})}});V("TermIn",G,{check:function(t){return this.createPin("o",A).driver=this.parent.createPin(this.name,_),0}}),V("TermOut",G,{check:function(t){var e=this.createPin("o",_);return e.parent=this,e.connect=this.connect,e.cPin=this.cPin,e.driver=this.parent.createPin(this.name,A),0}}),V("Via",B,{check:function(t){return this.pins&&this.OutputPin()||this.createPin("o",A),0}});function H(t){var e=JSON.parse(t.txt),i=e.library;O(i),i.tell({topic:"performCheck"}),i.tell({topic:"resolve"});var n={topic:"size",top:"top",nodeCount:0};i.top.tell(n),console.log("creating "+n.nodeCount+" nodes"),i.top.tell({topic:"createNodes",top:"top",flatten:!0}),m("resetSequence",e.resetSequence),t.dump&&p({topic:"tellNodes",message:"dump"}),p({topic:t.endMessage||"consumed"})}return i?(onmessage=function(t){c(t.data)},u(function(t){postMessage(t)})):n&&(process.on("message",c),u(function(t){process.send(t)})),O(x),O(t),l("processText",function(t){H(t)}),l("read",n?function(i){require("fs").readFile(i.file,"utf8",function(t,e){if(t)throw t;i.txt=e,H(i)})}:function(t){var e=new XMLHttpRequest;e.onreadystatechange=function(){if(200!=e.status||4!=e.readyState)throw a("read failed");t.txt=e.responseText,H(t)},e.open("GET",t.file,!0),e.send()}),{publish:p,subscribe:l,receive:c,setSend:u}});'], {
            "type": 'application/javascript'
        });

        var worker;
        if (typeof Worker !== 'undefined') {
            //            worker = new Worker( window.URL.createObjectURL(blob));
            worker = new Worker(wFile);

            worker.onerror = function (event) {
                engineError(event.message + event);
            };

            worker.onmessage = function (e) {
                pub(e.data);
            };
            send = function (mm) {
                worker.postMessage(mm);
            };
        } else {
            require({
                    baseUrl: "./"
                },
                [wName],
                function (iworker) {
                    send = function (mm) {
                        iworker.receive(mm);
                    };
                    iworker.setSend(function (d) {
                        pub(d);
                    });
                }
            );
        }
    }


    return {
        publish: publish,
        subscribe: sub
    };
}));
