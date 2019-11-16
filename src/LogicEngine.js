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

        var worker;
        if (typeof Worker !== 'undefined') {
            var url = document.location;
            var wFile2 = url.origin + "/LogicEngine/src/" + wName + ".js";
            var wFile3 = "http://esfoden.github.io/LogicEngine/src/" + wName + ".js";

            worker = new Worker(wFile3);

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
