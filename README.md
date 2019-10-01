

# Welcome to LogicEngine

LogicEngine is a fast and efficient Logic Simulator.

## Implementations

LogicEngine has been implemented in Perl, Python and Javascript. 

## Runs anywhere

For the browser it optionally supports ATM modules or alternatively creates a global variable called "LogicEngine". Note that the simulator itself runs in a web worker and does not impact responsiveness. 

### ATM module

```HTML

<script>

var pub,sub;
requirejs(["LogicEngine"], function(engine){
    pub = engine.publish;
    sub = engine.subscribe;
    sub( "ready",function() {
         pub({ topic : "check" });
    });
});
</script>
```

### Non modular

```HTML

<script src="./LogicEngine.js">
//creates LogicEngine global variable

<script?
var pub = LogicEngine.publish,
    sub = LogicEngine.subscribe;
    sub( "ready",function() {
         pub({ topic : "check" });
    });
});
</script>
```
### node.js

In addition node.js is supported. Here the simulator runs in a child process and does not block the event loop. It brings well behaved number crunching to node.js

```JavaScript
var engine = require('./LogicEngine');

var subscribe = engine.subscribe,
    publish = engine.publish;
```
