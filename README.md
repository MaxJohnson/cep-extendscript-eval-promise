# Summary
An interface for CEP panels to run Adobe ExtendScript evals and files (with arguments!) as promises with cross-compatibility for AMD and node.js require.

Trying to split the difference between too-basic and OMG-features-and-dependencies.

# Features
- Run (eval) ExtendScript files **with arguments** as promises
- Works with node.js require and AMD(probably)
- Optional logger replacement (defaults to console.log)

## Recommended additional modules
- Send logging or data from running scripts via [ExtendScript_Log](https://github.com/MaxJohnson/extendscript_log)
- Script logs to a log file via [ExtendScript_LogFile](https://github.com/MaxJohnson/extendscript_logfile)

# Import
## NPM
If running Node NPM, you can `npm install cep-extendscript-eval-promise` to add to your node_modules folder
Bonus points for adding to your package.json with `npm install cep-extendscript-eval-promise --save`
## github
Clone or download the repo and copy to your project?

# Include
`var esp = require("cep-extendscript-eval-promise");`

# Use:
## init()
```
    /**
     * Initialize with parameters
     * @method
     * @param  {String} [scriptsPath]        root path for scripts, defaults to extension dir
     * @param  {Boolean} [encapsulate=false] Flag to wrap script in its own IIFE scope, defaults true
     * @param  {String} [paramsVarName="params"]      variable name to save parameter obj in
     * @param  {Boolean} [enableLog=false]   Toggle to print logs
     * @param  {Object} [logger]             Replacement logger. Defaults to "console"
     * @param  {CSInterface} [csInterface]   An existing CSInterface object. A new one is made by default.
     * @return {ExtendscriptEvalPromise}      Self for chaining
     */
    esp.init(scriptsPath, encapsulate, paramsVarName, enableLog, logger, csInterface);

```
## enableEncapsulate()
```
    /**
     * Toggle for enabling script scope encapsulation withing an IIFE
     * @method
     * @param  {Boolean} doEncapsulate Flag to wrap script in its own IIFE scope. Default is true
     * @return {ExtendScriptEvalPromise} Returns self for chaining
     */
    esp.enableEncapsulate(doEncapsulate);

```
## enableLog()
```
    /**
     * Toggle for enabling log printing
     * @method
     * @param  {Boolean} doEnable Flag to enable. Default is true
     * @return {ExtendScriptEvalPromise} Returns self for chaining
     */
    esp.enableLog(doEnable);

```
## evalScript()
```
    /**
    * Wrapper for evalScript to jsx context as promise
    * @param {String} command String to send to JSX context for evalScript = function(script, callback)
    * @return {promise} a promise that will resolve later with the result of the eval
    */
    evalScript(command, encapsulate);

```
## evalFile()
```
    /**
     * Evaluate a file in Extendscript as a promise
     * @method
     * @param  {String} scriptPath  path of script file
     * @param  {Boolean} encapsulate Adds encapsulation IIFE around eval
     * @return {Promise}             Promise for async script resolution
     */
    evalFile(scriptPath, encapsulate);
```
## evalFileWithParams()
```
    /**
     * Evaluate a file with argument parameters passed as an object in Extendscript as a promise
     * @method
     * @param  {String} scriptPath  path of script file
     * @param  {Object} params  parameters object to pass to script
     *                          var params = {
     *                             "title":"Prompt",
     *                             "text":"Message"
     *                          }
     * @param  {String} paramsVarName optional name for parameter variable definition
     * @param  {Boolean} encapsulate Adds encapsulation IIFE around eval
     * @return {Promise}             Promise for async script resolution
     */
    evalFileWithParams(scriptPath, params, paramsVarName, encapsulate)
```
## evalConcat()
```
    /**
     * Concatenate files and javascript strings into a single eval in Extendscript as a promise
     * @method
     * @param  {String Array} jsxlist  any combo of files or javascript strings
     * @param  {Boolean} encapsulate Adds encapsulation IIFE around eval
     * @return {Promise}             Promise for async script resolution
     */
    evalConcat( jsxList, encapsulate );
```
#Example
```
    /** contents of photoshop.jsx
    *
    * if(typeof params == 'object') {
    *     $.writeln(params.log);  
    *     alert(params.message);
    * }
    */

    var myFilePath = csInterface.getSystemPath(SystemPath.EXTENSION)+'/host/photoshop.jsx';
    var params = { "log":"Sent alarms...", "message":"Alarming!" };

    var esp = require("cep-extendscript-eval-promise");

    esp.enableLog(true);

    esp.evalFileWithParams(myFilePath, params).then(
        function jsxResolve(data){
            console.info('The thing got did.');
            esp.evalScript('alert("This is informative.");');
        },
        function jsxReject(data){
            console.log(data);
            console.error('Failed to do that extendscript thing.');
        }
    );
```
