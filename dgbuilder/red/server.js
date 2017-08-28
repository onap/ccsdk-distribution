/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var express = require('express');
var util = require('util');
var multer = require('multer');
var when = require('when');
var exec = require('child_process').exec;

var createUI = require("./ui");
var redNodes = require("./nodes");
var comms = require("./comms");
var storage = require("./storage");
var fs=require('fs');
var path = require("path");
var app = null;
var nodeApp = null;
var server = null;
var settings = null;

var flowShareUsers = require("../flowShareUsers");
	
//console.dir(flowShareUsers);

function createServer(_server,_settings) {
    server = _server;
    settings = _settings;

    comms.init(_server,_settings);
    
    nodeApp = express();
    app = express();
        
    if (settings.httpAdminRoot !== false) {
        
        
        if (!settings.disableEditor) {
            createUI(settings,app);
        }
        
	var slaActions = require("./sla");

        app.get("/flows",function(req,res) {
            res.json(redNodes.getFlows());
        });

        app.get("/loadJSFiles",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var generatedJSDir=appDir + "/generatedJS";
		var glob = require("glob")
		glob(generatedJSDir + "/**/*.js", null, function (er, files) {
			  // files is an array of filenames.
			 // If the `nonull` option is set, and nothing
  			// was found, then files is ["**/*.js"]
  			// er is an error object or null.
			//console.dir(files);
			var sliValuesObj =[];
			for(var i=0;files!= null && i<files.length;i++){
				var f = files[i].replace( new RegExp(generatedJSDir + "/", "g" ), "" );
				console.log("loading file " + f);
				try{
					sliValuesObj.push(require(files[i]));
					//console.dir(sliValuesObj);
				}catch(err){
					console.log("Error:Could not load file " + files[i]);
				}
			}
			res.json({"sliValuesObj" : sliValuesObj});
        	});
        });

        app.get("/loadSelectedModules",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var generatedJSDir=appDir + "/generatedJS";
		//console.dir(req);
		var selectedModulesStr = req.query.selectedModules;
		var selectedModules = [];
		if(selectedModulesStr != undefined && selectedModulesStr != null){ 
		 	selectedModules = selectedModulesStr.split(",");		
		}
		console.log(selectedModules);
		var loaded_modules = {"selected_modules" :selectedModules};
		var file = userDir + "/selected_modules";
		var content = "module.exports=\n" + JSON.stringify(loaded_modules);
		try{
			fs.writeFileSync(file, content, 'utf8');
		}catch(err){
			console.log("could not write to file " + file);
		}
		var sliValuesObj =[];
		for(var i=0;selectedModules!= null && i<selectedModules.length;i++){
			var f = generatedJSDir + "/" + selectedModules[i] + "_inputs.js";
			try{
				delete require.cache[require.resolve(f)]
				require.resolve();
			}catch(err){
				console.log("error deleting loaded module " + f + " from cache");
			}
			//console.log("loading file " + f);
			try{
				sliValuesObj.push(require(f));
			}catch(err){
				console.log("Error:Could not load file " + f);
			}
		}
		//console.dir(sliValuesObj);
		res.json({"sliValuesObj" : sliValuesObj});
        });

        app.get("/initialLoadSelectedModules",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var generatedJSDir=appDir + "/generatedJS";
		var file = userDir + "/selected_modules";
		var sliValuesObj =[];
		var selected_modules = [];
		var selectedModules;
		try{
			selectedModules = require(file);	
			selected_modules=selectedModules["selected_modules"];
			//console.log("selected_modules are ");
			//console.dir(selected_modules);
		}catch(err){
			console.log("Could not load the file " + file);
		}
		for(var i=0;selected_modules!= null && i<selected_modules.length;i++){
			var f = generatedJSDir + "/" + selected_modules[i] + "_inputs.js";
			console.log("loading file " + f);
			try{
				sliValuesObj.push(require(f));
			}catch(err){
				console.log("Error:Could not load file " + f);
			}
		}
		res.json({"sliValuesObj" : sliValuesObj});
        });

        app.get("/listAvailableModules",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var generatedJSDir=appDir + "/generatedJS";
		var glob = require("glob")
		var file = userDir + "/selected_modules";
		var selected_modules = [];
		var selectedModules;
		try{
			delete require.cache[require.resolve(file)]
			require.resolve();
		}catch(err){
			console.log("error deleting loaded module " + file + " from cache");
		}
		try{
			selectedModules = require(file);	
			selected_modules=selectedModules["selected_modules"];
			console.log("selected_modules are ");
			//console.dir(selected_modules);
		}catch(err){
			console.log("Could not load the file " + file);
		}
		glob(generatedJSDir + "/**/*.js", null, function (er, files) {
			var filesList =[];
			for(var i=0;files!= null && i<files.length;i++){
				var f = files[i].replace( new RegExp(generatedJSDir + "/", "g" ), "" );
				f = f.replace("_inputs.js","");
				if(selected_modules != undefined && selected_modules != null && selected_modules.indexOf(f) != -1){
					filesList.push(f + ":checked");
				}else{
					filesList.push(f + ":unchecked");
				}
			}
			res.json({"files" : filesList});
		});
        });

        app.get("/listSLA",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var settingsFile = userDir + "/customSettings.js"; 
		var jsonObj = require(settingsFile);
                slaActions.listSLA(jsonObj,req,res);
        });

        app.get("/listCurrentDGs",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var settingsFile = userDir + "/customSettings.js"; 
		var jsonObj = require(settingsFile);
                slaActions.listCurrentDGs(jsonObj,req,res);
        });

        app.get("/activateDG",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var settingsFile = userDir + "/customSettings.js"; 
		var jsonObj = require(settingsFile);
            slaActions.activateDG(jsonObj,req,res);
        });

        app.get("/deActivateDG",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var settingsFile = userDir + "/customSettings.js"; 
		var jsonObj = require(settingsFile);
            slaActions.deActivateDG(jsonObj,req,res);
        });

        app.get("/deleteDG",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		var settingsFile = userDir + "/customSettings.js"; 
		var jsonObj = require(settingsFile);
            slaActions.deleteDG(jsonObj,req,res);
        });

        app.get("/getCurrentSettings",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		//console.log("userDir:" + userDir);
		var settingsFile = userDir + "/customSettings.js"; 
		var jsonObj = require(settingsFile);
            	res.json(jsonObj);
        });

        app.get("/getCommitsInfo", function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		//console.dir(req);
                var filePath = req.query.filePath;
                var fullFilePath = userDir + "/codecloud/" + filePath ;
		//console.log("fullFilePath:" + fullFilePath);	
		var exec = require('child_process').exec;
		var commandToExec = appDir + "/git_scripts/gitlog " + fullFilePath ;
		console.log("commandToExec:" + commandToExec);
        	var child = exec(commandToExec ,function (error,stdout,stderr){
                if(error){
			console.log("Error occured:" + error);
			if(stderr){
				//console.log("stderr:" + stderr);
				res.send(500,{'error':error,'stderr':stderr});
			}else{
				res.send(500,{'error':error});
			}
			//console.log("stdout :" + stdout);
                }else{
			if(stderr){
				console.log("stderr:" + stderr);
			}
			if(stdout){
				//console.log("output:" + stdout);
				res.send(200,{'stdout':stdout,'stderr':stderr});
                	}
		}
		});
	});

        app.get("/importCodeCloudFlow",
		 function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir = appDir + "/" + settings.userDir;
		//console.dir(req);
                var commitId = req.query.commitId;
                var filePath = req.query.filePath;
                var fullFilePath = userDir + "/codecloud/" + filePath ;
		//console.log("fullFilePath:" + fullFilePath);	
		var exec = require('child_process').exec;
		var commandToExec = appDir + "/git_scripts/gitckout " + commitId + " " + fullFilePath ;
		console.log("commandToExec:" + commandToExec);
        	var child = exec(commandToExec ,{maxBuffer: 1024 * 1024 * 16}, function (error,stdout,stderr){
                if(error){
			console.log("Error occured:" + error);
			if(stderr){
				//console.log("stderr:" + stderr);
				res.send(500,{'error':error,'stderr':stderr});
			}else{
				res.send(500,{'error':error});
			}
                }else{
			if(stderr){
				console.log("stderr:" + stderr);
			}
			if(stdout){
				//console.log("output:" + stdout);
				res.send(200,{'stdout':stdout,'stderr':stderr});
                	}
		}
		});
	});

        app.get("/importGitLocalFlow",
 		function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var gitLocalRepository =  settings.gitLocalRepository;
		//console.dir(req);
                var filePath = req.query.filePath;
                var fullFilePath = gitLocalRepository +"/" + filePath ;
		//console.log("fullFilePath:" + fullFilePath);	
		var exec = require('child_process').exec;
		var commandToExec =  "cat " + fullFilePath ;
		console.log("commandToExec:" + commandToExec);
        	var child = exec(commandToExec ,{maxBuffer: 1024 * 1024 * 16}, function (error,stdout,stderr){
                if(error){
			console.log("Error occured:" + error);
			if(stderr){
				//console.log("stderr:" + stderr);
				res.send(500,{'error':error,'stderr':stderr});
			}else{
				res.send(500,{'error':error});
			}
                }else{
			if(stderr){
				console.log("stderr:" + stderr);
			}
			if(stdout){
				//console.log("output:" + stdout);
				res.send(200,{'stdout':stdout,'stderr':stderr});
                	}
		}
		});
	});


        app.get("/gitcheckout", function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var gitLocalRepository =  settings.gitLocalRepository;
		//console.dir(req);
                var branch = req.query.branch;
		//console.log("fullFilePath:" + fullFilePath);	
		var exec = require('child_process').exec;
		var commandToExec = appDir + "/git_scripts/gitcheckout " + gitLocalRepository + " " + branch ;
		console.log("commandToExec:" + commandToExec);
        	var child = exec(commandToExec ,function (error,stdout,stderr){
                		if(error){
					console.log("Error occured:" + error);
					if(stderr){
						console.log("stderr:" + stderr);
						res.json({"output":stderr});
					}else{
						res.json({"output":error});
					}
                		}else{
					if(stderr){
						console.log("stderr:" + stderr);
					}
					if(stdout){
						res.json({"output": stderr + " " + stdout});
					}
				}
			});
	});

        app.get("/gitpull", function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var gitLocalRepository =  settings.gitLocalRepository;
		//console.dir(req);
                var branch = req.query.branch;
		//console.log("fullFilePath:" + fullFilePath);	
		var exec = require('child_process').exec;
		var commandToExec = appDir + "/git_scripts/gitpull " + gitLocalRepository ;
		console.log("commandToExec:" + commandToExec);
        	var child = exec(commandToExec ,function (error,stdout,stderr){
                		if(error){
					console.log("Error occured:" + error);
					if(stderr){
						console.log("stderr:" + stderr);
						res.json({"output":stderr});
					}else{
						res.json({"output":error});
					}
                		}else{
					if(stderr){
						console.log("stderr:" + stderr);
					}
					if(stdout){
						res.json({"output": stderr + " " + stdout});
					}
				}
			});
	});

        app.get("/gitstatus", function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var gitLocalRepository =  settings.gitLocalRepository;
		//console.dir(req);
                var branch = req.query.branch;
		//console.log("fullFilePath:" + fullFilePath);	
		var exec = require('child_process').exec;
		var commandToExec = appDir + "/git_scripts/gitstatus " + gitLocalRepository ;
		console.log("commandToExec:" + commandToExec);
        	var child = exec(commandToExec ,function (error,stdout,stderr){
                		if(error){
					console.log("Error occured:" + error);
					if(stderr){
						console.log("stderr:" + stderr);
						res.json({"output":stderr});
					}else{
						res.json({"output":error});
					}
                		}else{
					if(stderr){
						console.log("stderr:" + stderr);
					}
					if(stdout){
						res.json({"output": stderr + " " + stdout});
					}
				}
			});
	});
	
        app.post("/getSharedFlow",
            express.json(),
            function(req,res) {
		var qs = require('querystring');
		var body = '';
        	req.on('data', function (data) {
            		body += data;
        	});
        	req.on('end', function () {
			var post = qs.parse(body);
			//console.log("body:" + body);
			fs.readFile(post.filePath, 'utf8', function (err,data) {
  				if (err) {
    					return console.log(err);
  				}
				res.json(data);
  				//console.log(data);
			});
            	//res.sendFile(body.filePath);
        	});
        });
        
        app.post("/downloadYang",
            express.json(),
            function(req,res) {
		var qs = require('querystring');
		var body = '';
        	req.on('data', function (data) {
            		body += data;
        	});
        	req.on('end', function () {
			var post = qs.parse(body);
			var fileName = post.fileName;
			var appDir = path.dirname(require.main.filename);
			var yangDir = appDir + "/yangFiles" ;
			var fullPathToFile = yangDir + "/" + fileName;
			res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
			res.setHeader('Content-type', 'application/yang');
			res.download(fullPathToFile);
        	});
        });

	function writeToFile(fullPathToFileName,str){
        	try{
           		fs.writeFileSync(fullPathToFileName,str);
        	}catch(e){
                	console.log("Error:" + e);
        	}
    	}
	function getCurrentDate(){
        	var d = new Date();
        	var mm = d.getMonth() + 1;
        	var dd =   d.getDate();
        	var yyyy = d.getYear() + 1900;
        	var hr = d.getHours();
        	var min = d.getMinutes();
        	var sec = d.getSeconds();
        	if(mm<10) mm = "0" + mm;
        	if(dd<10) dd = "0" + dd;
        	if(hr<10) hr = "0" + hr;
        	if(min<10) min = "0" + min;
        	if(sec<10) sec = "0" + sec;
        	var formatedValue = mm + "-" + dd + "-" + yyyy + "_" + hr + "" + min + "" + sec;
        	return formatedValue;
	}


        app.post("/downloadXml",
            express.json({'limit':'16mb'}),
            function(req,res) {
		//console.log("Received request and processing:" + new Date());
        	var qs = require('querystring');
        	var body = '';
        	//var msecs1= Date.now();
        	req.on('data', function (data) {
            		body += data;
        	});
        	req.on('end', function () {
			var appDir = path.dirname(require.main.filename);
			var xmlDir = appDir + "/" + settings.xmlPath;
                	//var msecs2= Date.now();
                	//console.log("Time taken to get request body:" + (msecs2 - msecs1));
                	var msecs3= Date.now();
                	var post = qs.parse(body);
                	var msecs4= Date.now();
                	//console.log("Time taken to parse body:" + (msecs4 - msecs3));
                	var xml = post['flowXml'];
			//var pd = require('pretty-data').pd;
			//var formatted_xml = pd.xml(xml);
                	var moduleName = post['moduleName'];
                	var methodName = post['methodName'];
                	if(moduleName == "" || methodName == ""){
                        	res.send({"ERROR":"ServiceLogic Module Name and method name are required."});
                	}else{
                        	//var formatted_date = getCurrentDate();
                        	//var fileNameForServer=moduleName + "_" +methodName+ "_" +  formatted_date + ".xml";
                        	//var fileName=moduleName + "_method_" +methodName+ ".xml";
                        	var fileName=moduleName + "_" +methodName+ ".xml";
                        	var file = xmlDir + "/" + fileName;

                        	//var msecs2= Date.now();
                        	writeToFile(file,xml);
                        	//var msecs3= Date.now();
                        	//console.log("Time taken to write File:" + (msecs3 - msecs2));
                        	res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                        	res.setHeader('Content-type', 'text/xml');
                        	res.end(xml);
                        	//console.log("Response sent:" + new Date());
			}
        	});
	});

        app.post("/downloadJson",
            express.json({'limit':'16mb'}),
            function(req,res) {
			var appDir = path.dirname(require.main.filename);
			var sharedDir = appDir + "/" + settings.sharedDir;
		 	var qs = require('querystring');
        		var body = '';
        		req.on('data', function (data) {
            			body += data;
        		});
        		req.on('end', function () {
                		var post = qs.parse(body);
                		var jsonStr = post['flowJson'];
                		var moduleName = post['moduleName'];
                		var methodName = post['methodName'];
                		//console.log("jsonStr:" + jsonStr);
                		if(moduleName == "" || methodName == ""){
                        		res.send({"ERROR":"ServiceLogic Module Name and method name are required."});
                		}else{
                        		var formatted_date = getCurrentDate();
                        		//console.log("moduleName:" + moduleName);
                        		//console.log("methodName:" + methodName);

                        		//var fileName=moduleName + "_method_" +methodName + ".json";
                        		//var renameOldfileTo=moduleName + "_method_" +methodName+ "_" +  formatted_date + ".json";
                        		var fileName=moduleName + "_" +methodName + ".json";
                        		var renameOldfileTo=moduleName + "_" +methodName+ "_" +  formatted_date + ".json";
                        		var file = sharedDir + "/" + fileName;
                        		//console.log("fileName:" + fileName);
                        		var renameFilePath = sharedDir + "/backups/" + renameOldfileTo;
                        		//console.log("localfile:" + localfile);
                        		fs.rename(file,renameFilePath, function (err) {
                                		if(err){
                                        		console.log('Error :' + err);
                                		}
                                		//write the newer version
                                		writeToFile(file,jsonStr);
                                		res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                                		res.setHeader('Content-type', 'application/json');
                                		//res.download(file);
                                		res.end(jsonStr);
					});
				}
	   		});
	});

        app.post("/flows",
            express.json({'limit':'16mb'}),
            function(req,res) {
		//console.log("Processing Request");
                var flows = req.body;
                redNodes.setFlows(flows).then(function() {
                    res.send(204);
                }).otherwise(function(err) {
                    util.log("[red] Error saving flows : "+err);
                    res.send(500,err.message);
                });
            },
            function(error,req,res,next) {
                res.send(400,"Invalid Flow.  Error " + error);
            }
        );
            
        app.get("/nodes",function(req,res) {
            if (req.get("accept") == "application/json") {
                res.json(redNodes.getNodeList());
            } else {
                res.send(redNodes.getNodeConfigs());
            }
        });
        
        app.post("/nodes",
            express.json(),
            function(req,res) {
                if (!settings.available()) {
                    res.send(400,new Error("Settings unavailable").toString());
                    return;
                }
                var node = req.body;
                var promise;
                if (node.file) {
                    promise = redNodes.addNode(node.file).then(reportAddedModules);
                } else if (node.module) {
                    var module = redNodes.getNodeModuleInfo(node.module);
                    if (module) {
                        res.send(400,"Module already loaded");
                        return;
                    }
                    promise = installModule(node.module);
                } else {
                    res.send(400,"Invalid request");
                    return;
                }
                promise.then(function(info) {
                    res.json(info);
                }).otherwise(function(err) {
                    if (err.code === 404) {
                        res.send(404);
                    } else {
                        res.send(400,err.toString());
                    }
                });
            },
            function(err,req,res,next) {
                console.log(err.toString());
                res.send(400,err);
            }
        );
        
        app.delete("/nodes/:id",
            function(req,res) {
                if (!settings.available()) {
                    res.send(400,new Error("Settings unavailable").toString());
                    return;
                }
                var id = req.params.id;
                var removedNodes = [];
                try {
                    var node = redNodes.getNodeInfo(id);
                    var promise = null;
                    if (!node) {
                        var module = redNodes.getNodeModuleInfo(id);
                        if (!module) {
                            res.send(404);
                            return;
                        } else {
                            promise = uninstallModule(id);
                        }
                    } else {
                        promise = when.resolve([redNodes.removeNode(id)]).then(reportRemovedModules);
                    }
                    
                    promise.then(function(removedNodes) {
                        res.json(removedNodes);
                    }).otherwise(function(err) {
                        console.log(err.stack);
                        res.send(400,err.toString());
                    });
                } catch(err) {
                    res.send(400,err.toString());
                }
            },
            function(err,req,res,next) {
                res.send(400,err);
            }
        );
        
        app.get("/nodes/:id", function(req,res) {
            var id = req.params.id;
            var result = null;
            if (req.get("accept") == "application/json") {
                result = redNodes.getNodeInfo(id);
            } else {
                result = redNodes.getNodeConfig(id);
            }
            if (result) {
                res.send(result);
            } else {
                res.send(404);
            }
        });
        
        app.put("/nodes/:id", 
            express.json(),
            function(req,res) {
                if (!settings.available()) {
                    res.send(400,new Error("Settings unavailable").toString());
                    return;
                }
                var body = req.body;
                if (!body.hasOwnProperty("enabled")) {
                    res.send(400,"Invalid request");
                    return;
                }
                try {
                    var info;
                    var id = req.params.id;
                    var node = redNodes.getNodeInfo(id);
                    if (!node) {
                        res.send(404);
                    } else if (!node.err && node.enabled === body.enabled) {
                        res.json(node);
                    } else {
                        if (body.enabled) {
                            info = redNodes.enableNode(id);
                        } else {
                            info = redNodes.disableNode(id);
                        }
                        if (info.enabled == body.enabled && !info.err) {
                            comms.publish("node/"+(body.enabled?"enabled":"disabled"),info,false);
                            util.log("[red] "+(body.enabled?"Enabled":"Disabled")+" node types:");
                            for (var i=0;i<info.types.length;i++) {
                                util.log("[red] - "+info.types[i]);
                            }
                        } else if (body.enabled && info.err) {
                            util.log("[red] Failed to enable node:");
                            util.log("[red] - "+info.name+" : "+info.err);
                        }
                        res.json(info);
                    }
                } catch(err) {
                    res.send(400,err.toString());
                }            
            }
        );
        app.get("/getCodeCloudFlows",function(req,res) {
		var userDir=settings.userDir;
		var codeCloudDir=userDir + "/codecloud";
		var glob = require("glob")
		glob(codeCloudDir + "/**/*.json", null, function (er, files) {
			  // files is an array of filenames.
			 // If the `nonull` option is set, and nothing
  			// was found, then files is ["**/*.js"]
  			// er is an error object or null.
			//console.dir(files);
			var filesList =[];
			for(var i=0;files!= null && i<files.length;i++){
				var f = files[i].replace( new RegExp(codeCloudDir + "/", "g" ), "" );
				filesList.push(f);

			}
			res.json({"files" : filesList});
		});
        });

        app.get("/getCurrentGitBranch",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir=settings.userDir;
		var settingsFile = appDir + "/" +  userDir + "/customSettings.js"; 
		//console.log("settingsFile:" + settingsFile);
		var jsonObj = require(settingsFile);
		var gitLocalRepository=jsonObj.gitLocalRepository;
		if(gitLocalRepository == undefined || gitLocalRepository == null || gitLocalRepository == ''){
			res.json({"output" : "GIT_LOCAL_REPOSITORY_NOT_SET"});
			return;
		}
		var exec = require('child_process').exec;
		var commandToExec = appDir + "/git_scripts/gitcurbranch " + gitLocalRepository ;
			console.log("commandToExec:" + commandToExec);
        		var child = exec(commandToExec ,function (error,stdout,stderr){
                		if(error){
					console.log("Error occured:" + error);
					if(stderr){
						console.log("stderr:" + stderr);
						res.json({"output":stderr});
					}else{
						res.json({"output":error});
					}
                		}else{
					if(stderr){
						console.log("stderr:" + stderr);
					}
					if(stdout){
						res.json({"output":stdout});
					}
				}
			});
				
	});

        app.get("/getGitLocalFlows",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var userDir=settings.userDir;
		var settingsFile = appDir + "/" +  userDir + "/customSettings.js"; 
		//console.log("settingsFile:" + settingsFile);
		var jsonObj = require(settingsFile);
		var performGitPull = jsonObj.performGitPull;
		if(performGitPull == undefined || performGitPull == null) {
			performGitPull="N";
		}
		var gitLocalRepository=jsonObj.gitLocalRepository;
		if(gitLocalRepository == undefined || gitLocalRepository == null || gitLocalRepository == ''){
			res.json({"files" : ["GIT_LOCAL_REPOSITORY_NOT_SET"]});
			return;
				
		   }

		if(performGitPull == "Y"){	
			var exec = require('child_process').exec;
			var commandToExec = appDir + "/git_scripts/gitpull " + gitLocalRepository ;
			console.log("commandToExec:" + commandToExec);
        		var child = exec(commandToExec ,function (error,stdout,stderr){
                		if(error){
					console.log("Error occured:" + error);
					if(stderr){
						console.log("stderr:" + stderr);
						res.json({"files":[]});
					}else{
						res.json({"files":[]});
					}
                		}else{
					if(stderr){
						console.log("stderr:" + stderr);
					}
					if(stdout){
						var glob = require("glob")
						glob(gitLocalRepository + "/**/*.json", null, function (er, files) {
			  			// files is an array of filenames.
			 			// If the `nonull` option is set, and nothing
  						// was found, then files is ["**/*.js"]
  						// er is an error object or null.
						//console.dir(files);
						var filesList =[];
						for(var i=0;files!= null && i<files.length;i++){
							var f = files[i].replace( new RegExp(gitLocalRepository + "/", "g" ), "" );
							filesList.push(f);

						}
						res.json({"files" : filesList});
						});
                			}
				}
			});
		}else{//git pull not requested
			var glob = require("glob")
			glob(gitLocalRepository + "/**/*.json", null, function (er, files) {
			// files is an array of filenames.
			// If the `nonull` option is set, and nothing
  			// was found, then files is ["**/*.js"]
  			// er is an error object or null.
			//console.dir(files);
			var filesList =[];
			for(var i=0;files!= null && i<files.length;i++){
				var f = files[i].replace( new RegExp(gitLocalRepository + "/", "g" ), "" );
				filesList.push(f);

			}
			res.json({"files" : filesList});
			});
		}
	
        });

        app.get("/flowShareUsers",function(req,res) {
            res.json(flowShareUsers);
        });
        app.get("/getRelease",function(req,res) {
		var userDir = settings.userDir;
		//var release = userDir.replace(/releases/g,"release");
            	res.json({"release" : userDir});
        });
        app.post("/getFiles/:id",function(req,res) {
            var id = req.params.id;
		//console.log("id:" + id);
		var userDir=settings.userDir;
		var flowDir= userDir + "/../" + id + "/flows/shared"; 
		//console.log("flowDir:" + flowDir);
		fs.readdir(flowDir,function(err, files){
			if(err){
				res.json({"files": []});
			}else{
				var onlyFilesArr =[];
				if(files != null && files.length>0){
					files.sort(function(a,b){
						//console.log("file1:" + a);	
						//console.log("file2:" + b);	
						var fileStat1=fs.statSync(flowDir+ "/" + a);	
						var fileStat2=fs.statSync(flowDir+ "/" + b);	
						if(fileStat1.mtime > fileStat2.mtime){
							return 1;
						}else if(fileStat1.mtime < fileStat2.mtime){
							return -1;
						}else{
							return 0;
						}
					});
					for(var i=0;i<files.length;i++){
						var fileStat=fs.statSync(flowDir+ "/" + files[i]);
						if(fileStat.isFile()){
						    onlyFilesArr.push({"filePath":flowDir+ "/" + files[i],"name":files[i]});
						}
					}
					res.json(onlyFilesArr);
				}else{
					res.json({"files": []});
				}
			}
		});
        });

        app.post("/updateConfiguration",
            express.json(),
            function(req,res) {
		var qs = require('querystring');
		//console.log("Received the request:");
		var body ="";
		 req.on('data', function (data) {
            		body += data;
        	});
		req.on('end',function(){
			var post = qs.parse(body);
                	var dbHost = post["dbHost"];
                	var dbPort = post["dbPort"];
                	var dbName = post["dbName"];
                	var dbUser = post["dbUser"];
                	var dbPassword = post["dbPassword"];
                	var gitLocalRepository = post["gitLocalRepository"];
                	var performGitPull = post["performGitPull"];
			var appDir = path.dirname(require.main.filename);
			var userDir = appDir + "/" + settings.userDir;
			console.log("userDir:" + userDir);
			try{
				var settingsFile = userDir + "/customSettings.js"; 
				var jsonObj = require(settingsFile);
				jsonObj.flowFile = jsonObj.flowFile.replace(appDir + "/",'');
				jsonObj.dbHost = dbHost;
				jsonObj.dbPort = dbPort;
				jsonObj.dbName = dbName;
				jsonObj.dbUser = dbUser;
				jsonObj.dbPassword = dbPassword;
				jsonObj.gitLocalRepository = gitLocalRepository;
				jsonObj.performGitPull = performGitPull;
				var updatedSettings = jsonObj;

				var settingsStr= "module.exports=" + JSON.stringify(updatedSettings,null,4);
				//console.log("settingsStr:" + settingsStr);
           			fs.writeFileSync(settingsFile,settingsStr);
				var svcLogicPropStr = "" ;
					svcLogicPropStr += "org.onap.ccsdk.sli.dbtype=jdbc" + "\n";
					svcLogicPropStr += "org.onap.ccsdk.sli.jdbc.url=jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName + "\n";
					svcLogicPropStr += "org.onap.ccsdk.sli.jdbc.database=" + dbName + "\n";
					svcLogicPropStr += "org.onap.ccsdk.sli.jdbc.user=" + dbUser  + "\n";
					svcLogicPropStr += "org.onap.ccsdk.sli.jdbc.password=" + dbPassword;
				
				//create svclogic.properties file in the conf dir
				var svcPropFile = userDir + "/conf/svclogic.properties";
           			fs.writeFileSync(svcPropFile,svcLogicPropStr);

				res.send({"status": "success"});
        		}catch(e){
                		console.log("Error:" + e);
				res.send({"status": "error"});
        		}
		});
            }
	);

        app.post("/deleteYangFile",
            express.json(),
            function(req,res) {
		var qs = require('querystring');
		//console.log("Received the request:");
		var body ="";
		 req.on('data', function (data) {
            		body += data;
        	});
		req.on('end',function(){
			var post = qs.parse(body);
			//console.dir(body);
                	var fileName = post["fileName"];
			var appDir = path.dirname(require.main.filename);
			var yangFilePath = appDir + "/yangFiles/" + fileName;
			try{
				fs.unlinkSync(yangFilePath);
				res.send({"status" :"SUCCESS"});
			}catch(err){
				console.log("error" + err);
				res.send({"status" :"ERROR"});
			}
			//console.log("prevPassword:" + settings.httpAuth.pass );
		});
            }
	);

        app.post("/updatePassword",
            express.json(),
            function(req,res) {
		var qs = require('querystring');
		//console.log("Received the request:");
		var body ="";
		 req.on('data', function (data) {
            		body += data;
        	});
		req.on('end',function(){
			var post = qs.parse(body);
			//console.dir(body);
                	var password = post["password"];
			//console.log("prevPassword:" + settings.httpAuth.pass );
			//console.log("New password:" + password);
			var crypto = require("crypto");
			var cryptPasswd = crypto.createHash('md5').update(password,'utf8').digest('hex')
			var appDir = path.dirname(require.main.filename);
			var userDir = appDir + "/" + settings.userDir;
			//console.log("userDir:" + userDir);
			/*var newSettings = settings;
			newSettings.httpAuth.pass = cryptPasswd;
			var updatedSettings = JSON.stringify(settings,null,4);
			var settingsStr = "module.exports=" + updatedSettings;
			console.log(updatedSettings);
			*/
			try{
				var settingsFile = userDir + "/customSettings.js"; 
				//console.log("settingsFile:" + settingsFile);
				//var buf = fs.readFileSync(settingsFile, "utf8");
				var jsonObj = require(settingsFile);
				//console.log("jsonObj:" + JSON.stringify(jsonObj));
				jsonObj.httpAuth.pass = cryptPasswd;
				jsonObj.httpAdminAuth.pass = cryptPasswd;
				jsonObj.httpNodeAuth.pass = cryptPasswd;
				jsonObj.flowFile = jsonObj.flowFile.replace(appDir + "/",'');
				var updatedSettings = jsonObj;
				/*
    				delete updatedSettings.httpRoot;
    				delete updatedSettings.disableEditor;
    				delete updatedSettings.httpAdminRoot;
    				delete updatedSettings.httpAdminAuth;
    				delete updatedSettings.httpNodeRoot;
    				delete updatedSettings.httpNodeAuth;
    				delete updatedSettings.uiHost;
    				delete updatedSettings.version;
				*/
				var settingsStr= "module.exports=" + JSON.stringify(updatedSettings,null,4);
				//console.log("settingsStr:" + settingsStr);
           			fs.writeFileSync(settingsFile,settingsStr);
				settings.httpAuth.pass = cryptPasswd;
				res.send({"status": "success"});
        		}catch(e){
                		console.log("Error:" + e);
				res.send({"status": "error"});
        		}
		});
            }
	);

	var appDir = path.dirname(require.main.filename);
	var yangDir = appDir + "/yangFiles" ;
	var diskStorage =   multer.diskStorage({
  			destination: function (req, file, callback) {
    						callback(null, yangDir);
  			},
  			filename: function (req, file, callback) {
    				//callback(null, file.fieldname + '-' + Date.now());
    				callback(null, file.originalname);
  			}
	});
	var upload = multer({ storage : diskStorage}).single('yangFile');

	app.post('/api/uploadyang',function(req,res){
    		upload(req,res,function(err) {
        		if(err) {
				console.log(err);
            			return res.end("Error uploading file." + err);
        		}
			//console.dir(req);	
			var fileName = req.file.originalname;
			var yangFileFullPath =  appDir + "/yangFiles/" + fileName;
			console.log("yangFileFullPath:" + yangFileFullPath);
			var commandToExec =""; 
			if(fileName != null){
				var matchedArr = fileName.match(/.zip$/);
				if(matchedArr != null && matchedArr.length >0){
					console.log("uploaded zip file" + fileName);
					//commandToExec = appDir + "/tools/generate_props_from_yangs_zip.sh " + yangFileFullPath ;
					commandToExec = appDir + "/tools/generate_props_from_yang.sh " + yangFileFullPath ;
				}else{
					commandToExec = appDir + "/tools/generate_props_from_yang.sh " + yangFileFullPath ;
					console.log("uploaded file" + fileName);
				}
			}
			var exec = require('child_process').exec;
			console.log("commandToExec:" + commandToExec);
        		var child = exec(commandToExec ,function (error,stdout,stderr){
                		if(error){
					console.log("Error occured:" + error);
					var msg = "File " + fileName + " could not be processed successfully.";
					if(stderr){
						console.log("stderr:" + stderr);
						res.json({"sliValuesObj" : [],"message":msg});
					}else{
						res.json({"sliValuesObj" : [],"message":msg});
					}
                		}else{
					if(stderr){
						console.log("stderr:" + stderr);
					}
					if(stdout){
						console.log("stdout:" + stdout);
					}
					var msg = "File " + fileName + " processed successfully.";
					var generatedJSDir=appDir + "/generatedJS";
					var sliValuesObj =[];
					//var glob = require("glob");
					//glob(generatedJSDir + "/**/*.js", null, function (er, files) {
					/*
						var sliValuesObj =[];
						for(var i=0;files!= null && i<files.length;i++){
							var f = files[i].replace( new RegExp(generatedJSDir + "/", "g" ), "" );
							console.log("loading file " + f);
							try{
								sliValuesObj.push(require(files[i]));
								//console.dir(sliValuesObj);
							}catch(err){
								console.log("Error:Could not load file " + files[i]);
							}
						} 
						res.json({"sliValuesObj" : sliValuesObj,"message":msg});
                			});
					*/
					res.json({"sliValuesObj" : sliValuesObj,"message":msg});
    	                	}
        		});
		});
        });
        app.get("/getYangFiles",function(req,res) {
		var appDir = path.dirname(require.main.filename);
		var yangFilesDir=appDir + "/yangFiles";
		var glob = require("glob")
		glob(yangFilesDir + "/**/*.yang", null, function (er, files) {
			var filesList =[];
			for(var i=0;files!= null && i<files.length;i++){
				var f = files[i].replace( new RegExp(yangFilesDir + "/", "g" ), "" );
				filesList.push(f);

			}
			res.json({"files" : filesList});
		});
        });
	}
}

function reportAddedModules(info) {
    comms.publish("node/added",info,false);
    if (info.length > 0) {
        util.log("[red] Added node types:");
        for (var i=0;i<info.length;i++) {
            for (var j=0;j<info[i].types.length;j++) {
                util.log("[red] - "+
                    (info[i].module?info[i].module+":":"")+
                    info[i].types[j]+
                    (info[i].err?" : "+info[i].err:"")
                    );
            }
        }
    }
    return info;
}

function reportRemovedModules(removedNodes) {
    comms.publish("node/removed",removedNodes,false);
    util.log("[red] Removed node types:");
    for (var j=0;j<removedNodes.length;j++) {
        for (var i=0;i<removedNodes[j].types.length;i++) {
            util.log("[red] - "+(removedNodes[i].module?removedNodes[i].module+":":"")+removedNodes[j].types[i]);
        }
    }
    return removedNodes;
}

function installModule(module) { 
    //TODO: ensure module is 'safe'
    return when.promise(function(resolve,reject) {
        if (/[\s;]/.test(module)) {
            reject(new Error("Invalid module name"));
            return;
        }
        util.log("[red] Installing module: "+module);
        var child = exec('npm install --production '+module, function(err, stdin, stdout) {
            if (err) {
                var lookFor404 = new RegExp(" 404 .*"+module+"$","m");
                if (lookFor404.test(stdout)) {
                    util.log("[red] Installation of module "+module+" failed: module not found");
                    var e = new Error();
                    e.code = 404;
                    reject(e);
                } else {
                    util.log("[red] Installation of module "+module+" failed:");
                    util.log("------------------------------------------");
                    console.log(err.toString());
                    util.log("------------------------------------------");
                    reject(new Error("Install failed"));
                }
            } else {
                util.log("[red] Installed module: "+module);
                resolve(redNodes.addModule(module).then(reportAddedModules));
            }
        });
    });
}

function uninstallModule(module) {
    var list = redNodes.removeModule(module);
    return when.promise(function(resolve,reject) {
        if (/[\s;]/.test(module)) {
            reject(new Error("Invalid module name"));
            return;
        }
        util.log("[red] Removing module: "+module);
        var child = exec('npm remove '+module, function(err, stdin, stdout) {
            if (err) {
                util.log("[red] Removal of module "+module+" failed:");
                util.log("------------------------------------------");
                console.log(err.toString());
                util.log("------------------------------------------");
                reject(new Error("Removal failed"));
            } else {
                util.log("[red] Removed module: "+module);
                reportRemovedModules(list);
                resolve(list);
            }
        });
    });
}

function start() {
    var defer = when.defer();
    
    storage.init(settings).then(function() {
        settings.load(storage).then(function() {
            console.log("\nWelcome to Node-RED\n===================\n");
            if (settings.version) {
                util.log("[red] Version: "+settings.version);
            }
            util.log("[red] Loading palette nodes");
            redNodes.init(settings,storage);
            redNodes.load().then(function() {
                var i;
                var nodes = redNodes.getNodeList();
                var nodeErrors = nodes.filter(function(n) { return n.err!=null;});
                var nodeMissing = nodes.filter(function(n) { return n.module && n.enabled && !n.loaded && !n.err;});
                if (nodeErrors.length > 0) {
                    util.log("------------------------------------------");
                    if (settings.verbose) {
                        for (i=0;i<nodeErrors.length;i+=1) {
                            util.log("["+nodeErrors[i].name+"] "+nodeErrors[i].err);
                        }
                    } else {
                        util.log("[red] Failed to register "+nodeErrors.length+" node type"+(nodeErrors.length==1?"":"s"));
                        util.log("[red] Run with -v for details");
                    }
                    util.log("------------------------------------------");
                }
                if (nodeMissing.length > 0) {
                    util.log("[red] Missing node modules:");
                    var missingModules = {};
                    for (i=0;i<nodeMissing.length;i++) {
                        var missing = nodeMissing[i];
                        missingModules[missing.module] = (missingModules[missing.module]||[]).concat(missing.types);
                    }
                    var promises = [];
                    for (i in missingModules) {
                        if (missingModules.hasOwnProperty(i)) {
                            util.log("[red] - "+i+": "+missingModules[i].join(", "));
                            if (settings.autoInstallModules) {
                                installModule(i).otherwise(function(err) {
                                    // Error already reported. Need the otherwise handler
                                    // to stop the error propagating any further
                                });
                            }
                        }
                    }
                    if (!settings.autoInstallModules) {
                        util.log("[red] Removing modules from config");
                        redNodes.cleanNodeList();
                    }
                }
                defer.resolve();
                
                redNodes.loadFlows();
            }).otherwise(function(err) {
                console.log(err);
            });
            comms.start();
        });
    }).otherwise(function(err) {
        defer.reject(err);
    });
    
    return defer.promise;
}

function stop() {
    redNodes.stopFlows();
    comms.stop();
}

module.exports = { 
    init: createServer,
    start: start,
    stop: stop
}

module.exports.__defineGetter__("app", function() { return app });
module.exports.__defineGetter__("nodeApp", function() { return nodeApp });
module.exports.__defineGetter__("server", function() { return server });
