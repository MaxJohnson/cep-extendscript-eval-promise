/*
MIT License

Copyright (c) 2019 Max Johnon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// parts of this code have been modified from the Adobe Generator so here's the
// copyright thingie


/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*
# Summary

*/

// UMD for compatability with AMD and Node require
(
/**
 * ExtendScriptEvalPromise constructor
 * @module new ExtendScriptEvalPromise
 * @return {Object}               Self for chaining
 */

function(global, factory) {

    var util = require('./node_modules/util');
    var fs = require('fs');
    var readFileAsync = util.promisify(fs.readFile);

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([require('fs').existsSync, readFileAsync, require('path').resolve], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS
        module.exports = factory(require('fs').existsSync, readFileAsync, require('path').resolve);
    } else {throw Error('Requires AMD or Node module functionality.');}
}
// IIFE straight in... args are dependencies
// - fsExistsSync = fs.existsSync()
// - readFileAsync = promisified readFile()
// - pathResolve = path.resolve()
(this, function(fsExistsSync, readFileAsync, pathResolve) { //

    var ExtendScriptEvalPromise = {};
    var self = ExtendScriptEvalPromise;

    _jSXCache = {}; // I'm private! I save the contents of .jsx files for later...
    _isLogEnabled = false;
    _isEncapsulateEnabled = true;

    /**
     * test if logging available
     * @method
     * @return {Bool} if logging is available
     */
    _canLog = function()
    {
        return ( _isLogEnabled && self.logger );
    };


    /**
     * Takes a relative path and resolves it with cached extension root to absolute OS path
     * @method
     * @param  {String} jsxPath Path relative to cached extension root
     * @return {String}         OS friendly absolute path
     */
    _getAbsolutePath = function ( jsxPath ) {
        jsxPath = jsxPath.replace(/^[\\\/]/,"");
        var absPath = pathResolve(jsxPath);
        if(fsExistsSync(absPath)) {
            return absPath;
        } else {
        return pathResolve(self.extensionRoot, jsxPath);
        }
    };


    /**
     * Reads file contents to and/or retrieves cached contents from jsx cache
     * @method  _loadJSX
     * @param  {String} jsxPath File path to .jsx to read/load
     * @return {String}         Contents of .jsx file
     */
    _loadJSX = function ( jsxPath ) {
        if (_jSXCache.hasOwnProperty(jsxPath) && _jSXCache[jsxPath] !== "") {
            return _jSXCache[jsxPath];
        } else {
            return (
                readFileAsync(jsxPath, {
                    encoding: "utf8"
                })
                .then(function(data) {
                    _jSXCache[jsxPath] = data;
                    return data;
                })
                .catch(function(fileErr) {
                    throw fileErr;
                })
            );
        }
    };


    /**
     * Toggle for enabling script scope encapsulation withing an IIFE
     * @method
     * @param  {Boolean} doEncapsulate Flag to wrap script in its own IIFE scope. Default is true
     * @return {ExtendScriptEvalPromise} Returns self for chaining
     */
    ExtendScriptEvalPromise.enableEncapsulate = function(doEncapsulate){
        _isEncapsulateEnabled = (doEncapsulate !== false);// default true
        if(_canLog()){
            self.logger.log( ((_isEncapsulateEnabled)?"En":"Dis") + "abling scope encapsulation for ExtendScriptEvalPromise." );
        }
        return self;
    };


    /**
     * Toggle for enabling log printing
     * @method
     * @param  {Boolean} doEnable Flag to enable. Default is true
     * @return {ExtendScriptEvalPromise} Returns self for chaining
     */
    ExtendScriptEvalPromise.enableLog = function(doEnable){
        _isLogEnabled = (doEnable !== false);// default true
        if(_canLog()){
            self.logger.log( ((_isLogEnabled)?"En":"Dis") + "abling log output for ExtendScriptEvalPromise.");
        }
        return self;
    };


    /**
     * Initialize with parameters
     * @method
     * @param  {String} [scriptsPath]        root path for scripts, defaults to extension dir
     * @param  {Boolean} [encapsulate=false]       Flag to wrap script in its own IIFE scope, defaults true
     * @param  {String} [paramsVarName]      variable name to save parameter obj in, defaults "params"
     * @param  {Boolean} [enableLog=false]         Toggle to print logs
     * @param  {Object} [logger]             Replacement logger. Defaults to "console"
     * @param  {CSInterface} [csInterface]   An existing CSInterface object. A new one is made by default.
     * @return {ExtendscriptEvalPromise}      Self for chaining
     */
    ExtendScriptEvalPromise.init = function(scriptsPath, encapsulate, paramsVarName, enableLog, logger, csInterface) {
        try{
            if(!CSInterface) {
                require('./lib/CSInterface.js');
            }

            if(typeof JSON == 'undefined')
            {
                require('./lib/json2.js');
            }

            self.paramsVarName = (typeof paramsVarName == "string") ? paramsVarName : "params";
            self.logger = logger || console;
            self.csInterface = csInterface || new CSInterface();
            self.extensionRoot = (typeof scriptsPath == "string") ? scriptsPath : self.csInterface.getSystemPath(SystemPath.EXTENSION) + "/";

            self.enableLog( (enableLog==true) );// default init false...
            self.enableEncapsulate( (encapsulate == true) );// default false cause otherwise 'return' is required to get anything from script eval

            _jSXCache = {};// create/clear cache

            if(_canLog()){ self.logger.log("ExtendScript Eval Promise Initialized...");}

        } catch (err) {
            throw err;
        }

        return ExtendScriptEvalPromise;
    };


    /**
    * Wrapper for evalScript to jsx context as promise
    * @param {String} command String to send to JSX context for evalScript = function(script, callback)
    * @return {promise} a promise that will resolve later with the result of the eval
    */
    ExtendScriptEvalPromise.evalScript = function(command, encapsulate) {
        return new Promise(function(resolve, reject) {
            // encapsulate in iife... or not
            encapsulate = (typeof encapsulate == "boolean")? encapsulate: _isEncapsulateEnabled;
            if(encapsulate == true) {
                command = "(function (){\n" + command + "\n}() );";
            }

            if(_canLog()){self.logger.log("EvalScript command");}
            if(_canLog()){self.logger.log({"script":command,"encapsulate":encapsulate});}
            function checkOutput( result )
            {
                if( result === 'EvalScript error.') {
                    if(_canLog()){self.logger.log(new EvalError(result));}
                    reject(new EvalError(result));
                } else {
                    resolve(result);
                }
            }
            self.csInterface.evalScript(command, checkOutput);
        });
    };


    /**
     * Evaluate a file in Extendscript as a promise
     * @method
     * @param  {String} scriptPath  path of script file
     * @param  {Boolean} encapsulate Adds encapsulation IIFE around eval
     * @return {Promise}             Promise for async script resolution
     */
    ExtendScriptEvalPromise.evalFile = function(scriptPath, encapsulate) {
        if(_canLog()){self.logger.log("Sending JSX file ["+scriptPath+"] ");}

        return new Promise(function(resolve, reject) {
            Promise.resolve(_loadJSX( _getAbsolutePath(scriptPath) ))
            .then( function(data) {
                //if(_canLog()){self.logger.log(data);}
                resolve( self.evalScript(data, encapsulate) );
            })
            .catch(reject);
        });
    };


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
    ExtendScriptEvalPromise.evalFileWithParams = function(scriptPath, params, paramsVarName, encapsulate) {
        if (params) {
            try {
                paramsVarName = paramsVarName || self.paramsVarName;
                var newJSX = paramsVarName + " = " + JSON.stringify(params) + ";\n ";

                // if(_canLog()){self.logger.log("Sending JSX file ["+scriptPath+"] with params: \n " + newJSX);}

                return new Promise(function(resolve, reject) {
                    var output = "";
                    self.evalConcat( [ newJSX, _getAbsolutePath(scriptPath) ], encapsulate )
                    .then( function(result) {
                        // clear params so they aren't persistent
                        self.evalScript(paramsVarName + " = undefined;");
                        if(_canLog()){self.logger.log("Tried to clear the params");}
                        return result;
                    })
                    .then( resolve )
                    .catch( reject );
                });
            } catch (jsonError) {
                return Promise.reject(jsonError);
            }
        } else {
            return Promise.reject(new TypeError("No params object given."));
        }
    };


    /**
     * Concatenate files and javascript strings into a single eval in Extendscript as a promise
     * @method
     * @param  {String Array} jsxlist  any combo of files or javascript strings
     * @param  {Boolean} encapsulate Adds encapsulation IIFE around eval
     * @return {Promise}             Promise for async script resolution
     */
    ExtendScriptEvalPromise.evalConcat = function( jsxList, encapsulate ) {
        return new Promise(function(resolve, reject) {
            // error check and sanitize input
            if( jsxList instanceof Array == false || jsxList.length === 0) {
                reject(new TypeError("ExtendScriptEvalPromise.evalConcat() invalid input. Requires String Array..."));
            }

            var promiseList = [];
            for(var j in jsxList) {
                var jsxPathTest = _getAbsolutePath( jsxList[j] );
                if( fsExistsSync(jsxPathTest) ){
                    promiseList.push( _loadJSX( jsxPathTest ) );
                } else {
                    promiseList.push( Promise.resolve( jsxList[j] ) );
                }
            }

            Promise.all(promiseList)
            .then(function(jsxStrings) {

                newJSX = jsxStrings.join("\n ;\n");
                // if(_canLog()){self.logger.log("Sending JSX file [", scriptPath, "] with params: \nvar " + paramsVarName + " = ", jsxStrings[1]);}
                // if(_canLog()){self.logger.log(newJSX);}
                resolve( self.evalScript(newJSX, encapsulate) );
            })
            .catch(reject);
        });
    };


    // initialize with defaults
    return ExtendScriptEvalPromise.init();

}));
