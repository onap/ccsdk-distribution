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


module.exports = function(RED) {
    "use strict";
    var util = require("util");
    var vm = require("vm");
    //var dgxml=require("/home/users/schinthakayala/nodered/sheshi/dgxml/dgxml2");
    var _=require('lodash');
    var fs=require('fs');
    var path = require('path');
    var appDir = path.dirname(require.main.filename);
    var userDir = appDir + "/" + RED.settings.userDir;
    var dbHost = RED.settings.dbHost;
    var request = require('request');
    var sharedDir = appDir + "/" + RED.settings.sharedDir;
    var xmlDir = appDir + "/" + RED.settings.xmlPath;

    //console.log("appDir:" + appDir);
    //var dgeraw=fs.readFileSync(appDir + "/dge.json").toString();
    //var dgejson=JSON.parse(dgeraw);
    //var uploadUrl=dgejson.slaHost + dgejson.uploadUrl;
    //var slaUrl=dgejson.slaHost + dgejson.slaUrl;
    //var uploadUrl=RED.settings.slaHost +  RED.settings.uploadUrl;
    //var slaUrl=RED.settings.slaHost + RED.settings.slaUrl;
    var uploadUrl="";
    var slaUrl="";
    //console.log("Upload url: " + uploadUrl);

    function dgstart(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.topic = n.topic;
    }

    function writeHtmlToFile(fileName,str){
      var localfile = appDir + "/" + RED.settings.htmlPath + fileName;
	try{
      	   fs.writeFileSync(localfile,str);
	}catch(e){
		console.log("Error:" + e);
	}
    }	 

    function writeXmlToFile(fileName,str){
      var localfile = appDir + "/" + RED.settings.xmlPath + fileName;
	try{
      	   fs.writeFileSync(localfile,str);
	}catch(e){
		console.log("Error:" + e);
	}
    }	 

    function sendXml(fileName,res) {
      var needle, localfile, data;
      needle = require('needle')
      localfile = appDir + "/" + RED.settings.xmlPath + fileName;
	console.log("localfile:" + localfile);
      data={
        uploadedfile: { file: localfile, content_type: 'text/xml' }
      }
      needle.post(uploadUrl, data, { multipart: true }, function(err, resp, body) {
        //console.log(body)
	if(resp != undefined && resp != null){
        	console.log("resp Code for sendXml:" + resp.statusCode);
	}
	fs.unlink(localfile, function (error) {
           if (error) {
		 console.log("Error deleting file "+localfile);
	   }else{
		 //console.log("deleted file:" + localfile);
	   }	
	});

	if(err){
		console.log("Error posting to slaUrl:" + slaUrl);	
		console.log("Error:" +err);
        	res.json({"error":err});
	}else{
	        //console.dir(resp);
		//console.log("slaUrl:" + slaUrl);	
        	res.json({"url":slaUrl});
        }

      });
    }	 

    function oldsendXml(fileName) {
      console.log("In sendXML for file: " + fileName);
      var fileStream, formdata, localfile;
      localfile = appDir + "/" + RED.settings.xmlPath + fileName;

      formdata = {
        MAX_FILE_SIZE: "100000",
        uploadedfile: {
          options: {
            contentType: 'audio/mpeg'
          }
        }

      };

      console.log("Attempting to upload file: " + localfile);
      console.log("Sending to: " + uploadUrl);
      formdata.uploadedfile.value = fs.createReadStream(localfile);
      fileStream = formdata.uploadedfile.value;

//console.log("Formdata:");
//console.dir(formdata);

      request.post({
        url: uploadUrl,
        proxy: false,
        formData: formdata
        }, function(err, resp, body) {
        fileStream.close();
        console.log("err: " + err);
        return console.log("body: " + body);
      });

    };

    RED.nodes.registerType("dgstart",dgstart);
/*
    RED.httpAdmin.post("/uploadxml", function(req,res) {
	console.dir(req);
	console.log("USER:" + req.user);
      console.log("Got request to upload xml to SDN-C.");
      console.log("Requested filename to upload: " + req.params.fileName);
      console.log("Requested xml to upload: " + req.params.xmlStr);
	writeToFile( req.params.fileName,req.params.xmlStr);
	
      sendXml(req.params.fileName,res);
      // res.send("Attempt complete.");
      // res.redirect(slaUrl);
    });
*/

    RED.httpAdmin.post("/OldUploadxml", function(req,res) {
	//console.dir(req);
	//console.log("USER:" + req.user);
	var qs = require('querystring');
	var body = '';
        req.on('data', function (data) {
            body += data;
            // Too much POST data, kill the connection!
            /*if (body.length > 1e6)
                request.connection.destroy();
		*/
        });
        req.on('end', function () {
		//console.log("BODY:" + body);
		var d = new Date().getTime();
		var user = req.user;
		var fileName= user + "_" + d +".xml";
            	var post = qs.parse(body);
		//console.log(JSON.stringify(post));
            // use post['blah'], etc.
      		var localfile = appDir + "/" + RED.settings.xmlPath + fileName;
		//console.log("localfile:" + localfile);	
		var xmlStr = post['flowXml'];
		writeXmlToFile(fileName,xmlStr);
		sendXml(fileName,res);
		
            });

        });

    RED.httpAdmin.post("/uploadxml", function(req,res) {
	//console.dir(req);
	//console.log("USER:" + req.user);
	var qs = require('querystring');
	var body = '';
        req.on('data', function (data) {
            body += data;
            // Too much POST data, kill the connection!
            /*if (body.length > 1e6)
                request.connection.destroy();
		*/
        });
        req.on('end', function () {
		//console.log("BODY:" + body);
		var d = new Date().getTime();
		var user = req.user;
		var fileName= user + "_" + d +".xml";
            	var post = qs.parse(body);
		//console.log(JSON.stringify(post));
            // use post['blah'], etc.
      		var localfile = appDir + "/" + RED.settings.xmlPath + fileName;
		//console.log("localfile:" + localfile);	
		var xmlStr = post['flowXml'];
		var moduleName = post['module'];
		var rpc = post['rpc'];
		writeXmlToFile(fileName,xmlStr);
		uploadDG(localfile,moduleName,rpc,res);
            });

        });


function uploadDG(filePath,moduleName,rpc,res){
	console.log("called uploadDG...");
	var exec = require('child_process').exec;
	var commandToExec = appDir + "/svclogic/svclogic.sh load " + filePath + " " + userDir + "/conf/svclogic.properties";
	console.log("commandToExec:" + commandToExec);
        var child = exec(commandToExec ,function (error,stdout,stderr){
		//console.log(error);
		console.log("stdout:" + stdout);
		console.log("stderr:" +  stderr);
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
			if(stdout ){
				//console.log("output:" + stdout);
				if(stdout.indexOf('Compiler error') != -1){
					//console.log("compileError occured.");
					
					var resp = {
							'stdout':stdout,
							'stderr':"COMPILE_ERROR",
							'url':dbHost,
							'module':moduleName,
							'rpc':rpc
						   }		
					res.send(500,resp);
				}else{
					res.send(200,{'stdout':stdout,'stderr':stderr,"url":dbHost,"module" : moduleName,"rpc" : rpc});
				}
                	}
			if(stderr && !stdout){
				//console.log("stderr:" + stderr);
				if(stderr.indexOf("Saving SvcLogicGraph to database") != -1){
					res.send(200,{'error':error,'stdout' :'','stderr':stderr,"url":dbHost,"module" : moduleName,"rpc" : rpc});
				}else{
					res.send(500,{'error':error,'stdout' :'','stderr':stderr});
				}
			}
		}
	});
}

    RED.httpAdmin.get("/displayXml", function(req,res) {
			var _module = req.query._module;
			var rpc = req.query.rpc;
			var version = req.query.version;
			var mode = req.query.mode;
			var d = new Date().getTime();
			displayXml(_module,rpc,version,mode,res);
            });

function displayXml(_module,rpc,version,mode,res){
	var exec = require('child_process').exec;
	var msg = {
		'_module' : _module,
		'rpc' : rpc,
		'version' : version,
		'mode' : mode
	}
	var commandToExec = appDir + "/svclogic/svclogic.sh get-source "   + _module + " " 
				+ rpc + " " + mode + " " + version + " " + userDir + "/conf/svclogic.properties";
	console.log("commandToExec:" + commandToExec);
        var child = exec(commandToExec ,{'maxBuffer':16*1024*1024},function (error,stdout,stderr){
                if(error){
			console.log("Error occured:" + error);
			if(stderr){
				//console.log("stderr:" + stderr);
				res.send(500,{'error':error,'stderr':stderr,'msg':msg});
			}else{
				res.send(500,{'error':error,'msg':msg});
			}
                }else{
			if(stderr){
				console.log("stderr:" + stderr);
			}
			if(stdout){
				res.send({'xmldata' : "<xmp>" + stdout + "</xmp>"});
                	}
		}
	});
}


    RED.httpAdmin.post("/downloadDGXml", function(req,res) {
		//console.dir(req);
		var qs = require('querystring');
		var body = '';
        	req.on('data', function (data) {
            		body += data;
        	});

        	req.on('end', function () {
            		var post = qs.parse(body);
			var _module = post._module;
			var rpc = post.rpc;
			var version = post.version;
			var mode = post.mode;
			var d = new Date().getTime();
			downloadDGXml(_module,rpc,version,mode,res);
            	});
            });

function downloadDGXml(_module,rpc,version,mode,res){
	var exec = require('child_process').exec;
	var msg = {
		'_module' : _module,
		'rpc' : rpc,
		'version' : version,
		'mode' : mode
	}
	var commandToExec = appDir + "/svclogic/svclogic.sh get-source "   + _module + " " 
				+ rpc + " " + mode + " " + version + " " + userDir + "/conf/svclogic.properties";
	console.log("commandToExec:" + commandToExec);
        var child = exec(commandToExec ,function (error,stdout,stderr){
                if(error){
			console.log("Error occured:" + error);
			if(stderr){
				//console.log("stderr:" + stderr);
				res.send(500,{'error':error,'stderr':stderr,'msg':msg});
			}else{
				res.send(500,{'error':error,'msg':msg});
			}
                }else{
			if(stderr){
				console.log("stderr:" + stderr);
			}
			if(stdout){
				//console.log("output:" + stdout);
				//var newOutput = "<pre>" + stdout.replace(/\n/g,'<br>') + "</pre>";
				//res.json({'stdout': stdout ,'stderr':stderr,"msg":msg});
				//res.set('Content-Type', 'text/xml');
				//res.set('Content-Type', 'application/octet-stream');
				//res.end("<code>" + stdout + "</code>" ); 
				//var newOutput ="<html><body>" + stdout  + "</body></html>";
				//res.send(new Buffer( "<code>" +  newOutput + "</code>" ) ); 
				//res.send(newOutput); 

				/*
				var xslStr = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
 					'<xsl:output omit-xml-declaration="yes" indent="yes"/>' + 
					'<xsl:template match="node()|@*">' +
      					'<xsl:copy>' +
        				'<xsl:apply-templates select="node()|@*"/>' +
      					'</xsl:copy>' +
    					'</xsl:template>' +
					'</xsl:stylesheet>';
				*/

				var formatted_date = getCurrentDate();
				var fileName= "db_" + _module + "_" +rpc+ "_" + version + "_" +  formatted_date + ".html";
      				var file = xmlDir + "/" + fileName;
				var xmlStr = '<xmp>' + stdout + "</xmp>";
				//var xmlStr =  "<![CDATA[" + stdout + "]]";
				//var xmlStr =   stdout.replace(/</g,"&lt;");
				//xmlStr =   xmlStr.replace(/>/g,"&gt;");
				//xmlStr =   xmlStr.replace(/\n>/g,"<br>");
				//xmlStr =   xmlStr.replace(/\t>/g,"&nbsp;&nbsp;&nbsp;");
		
				writeToFile(file,"<html><body>" +xmlStr+ "</body></html>");
				//console.log("xmlStr:" + xmlStr);
				res.setHeader('Content-disposition', 'attachment; filename=' + file);
				//res.setHeader('Content-type', 'text/html');
				res.setHeader('Content-type', 'text/xml');
				res.download(file);
                	}
		}
	});
}


    RED.httpAdmin.get("/displayAsGv", function(req,res) {
		var _module = req.query._module;
		var rpc = req.query.rpc;
		var version = req.query.version;
		var mode = req.query.mode;
		var d = new Date().getTime();
		displayAsGv(_module,rpc,version,mode,res);
            });

function displayAsGv(_module,rpc,version,mode,res){
	var exec = require('child_process').exec;
	var msg = {
		'_module' : _module,
		'rpc' : rpc,
		'version' : version,
		'mode' : mode
	}
	var commandToExec = appDir + "/svclogic/svclogic.sh print " +
		 _module + " " + rpc + " " + mode + " " + version + " "
 	    //+ userDir + "/conf/svclogic.properties | dot -Tpng ";
				//the label="""" is giving an error so replacing it with "null" 
 	    + userDir + "/conf/svclogic.properties |sed -e 's%label=\"\"\"\"%label=\"null\"%g'| dot -Tsvg ";
	console.log("commandToExec:" + commandToExec);
 	    //+ userDir + "/conf/svclogic.properties | dot -Tsvg ";
        //var child = exec(commandToExec ,function (error,stdout,stderr){
        //var child = exec(commandToExec ,{maxBuffer:16*1024*1024},function (error,stdout,stderr){
        //var child = exec(commandToExec ,{encoding:'base64',maxBuffer:20*1024*1024},function (error,stdout,stderr){
        var child = exec(commandToExec ,{maxBuffer:20*1024*1024},function (error,stdout,stderr){
                if(error){
			console.log("Error occured:" + error);
			if(stderr){
				console.log("stderr:" + stderr);
				res.send(500,{'error':error,'stderr':stderr,"msg":msg});
			}else{
				res.send(500,{'error':error,"msg":msg});
			}
                }else{
			if(stderr){
				console.log("stderr:" + stderr);
				//To convert base64 to ascii
				//console.log(new Buffer(stderr, 'base64').toString('ascii'));
			}
			if(stdout){
				//console.log(stdout.length);
				//console.log("output:" + stdout);
				//var svg_html =  stdout ;
				//var image = "<img src='data:image/png;base64," + stdout + "'>";
				//var image = "<iframe width='1200' height='750' src='data:image/png;base64," + stdout + "'></frame>";
				//var image = "<iframe width='1200' height='750' src='data:image/svg+xml;base64," + stdout + "'></frame>";
				//var image = "<iframe width='1200' height='750' src='data:image/gif;base64," + stdout + "'></frame>";
				var image = "<iframe width='1200' height='750' src='data:image/svg+xml;UTF-8," + stdout + "'></frame>";
				//console.log(image);
				res.send({'svg_html':image});
                	}
		}
	});
}

    RED.httpAdmin.post("/shareFlow", function(req,res) {
	//console.dir(req);
	//console.log("USER:" + req.user);
	var qs = require('querystring');
	var body = '';
        req.on('data', function (data) {
            body += data;
            // Too much POST data, kill the connection!
            /*if (body.length > 1e6)
                request.connection.destroy();
		*/
        });
        req.on('end', function () {
            	var post = qs.parse(body);
		
		var nodeSet = JSON.parse(post['flowData']);
		var activeWorkspace=post['activeWorkspace'];
		var methodName = "";
		var moduleName = "";
		for(var i=0;nodeSet != null && i<nodeSet.length;i++){
			var node = nodeSet[i];	
			if(node.type == 'module' ){
				moduleName= node.name;
				moduleName=moduleName.replace(/ /g,"-");
			}
			if(node.type == 'method' ){
				methodName= node.name;
				methodName=methodName.replace(/ /g,"-");
			}
		}
		//console.log("BODY:" + body);
		var d = new Date().getTime();
		var user = req.user;
		var fileName= moduleName + "_" +methodName+".json";
      		var localfile = sharedDir + "/" + fileName;
		//console.log("localfile:" + localfile);	
		
		writeToFile(localfile,JSON.stringify(nodeSet));
		res.send({"fileName": fileName}); 
            });

        });


    RED.httpAdmin.post("/sendEmail", function(req,res) {
	//console.dir(req);
	console.log("USER:" + req.user);
        var fromAddr = RED.settings.emailAddress;
        var toAddr =  RED.settings.emailAddress;
	var qs = require('querystring');
	var body = '';
        req.on('data', function (data) {
            body += data;
            // Too much POST data, kill the connection!
            /*if (body.length > 1e6)
                request.connection.destroy();
		*/
        });
        req.on('end', function () {
		//console.log("BODY:" + body);
		var d = new Date().getTime();
		var user = req.user;
		var fileName= user + "_" + d +".html";
            	var post = qs.parse(body);
		//console.log(JSON.stringify(post));
            // use post['blah'], etc.
      		var localfile = appDir + "/" + RED.settings.htmlPath + fileName;
		//console.log("localfile:" + localfile);	
		var nodemailer = require("nodemailer");
        	nodemailer.sendmail = true;
        	var transporter = nodemailer.createTransport();
        	var ua = req.headers['user-agent'];
       		var host = req.headers.host;
		var fullHtml="<!doctype html><html><head>" + post['flowHtml'];
			//fullHtml+="<div style='fill:both'></div>";
			fullHtml+="<div style='margin-left:10px;'><p>XML</p><br><textarea rows='50' cols='150'>" + post['flowXml'] + "</textarea>";
			fullHtml+="<p>JSON</p><br><textarea rows='50' cols='150'>" + post['flowJson'] + "</textarea></div>";
			fullHtml+="</body></html>";
		writeHtmlToFile(fileName,fullHtml);
		
        	transporter.sendMail({
                	from: fromAddr,
                	to: toAddr,
			html: "<p>DG Node Flow. click on the attachment to view</p>",
                	subject: 'Node flow from  Host:<' + host + '>',
			attachments : [{'filename': fileName,
					'contentType': "text/html",
					/*'filePath': localfile*/
					'content': fs.createReadStream(localfile)
				      }]

            }, function(err, response) {
			var fullPathtoFileName = appDir + "/" + RED.settings.htmlPath + fileName;
		fs.unlink(fullPathtoFileName, function (error) {
           		if (error) {
		 		console.log("Error deleting file "+fullPathtoFileName);
	   		}else{
		 		//console.log("deleted file:" + fullPathtoFileName);
	   		}	
		});

                if(err){
			console.log("Error:" + err);
			res.json(err);
                }else{
			res.json(response);
		}
		console.log(response);
            });

        });

		
	});
/*
    RED.httpAdmin.post("/doxml/:id", function(req,res) {
            var node = RED.nodes.getNode(req.params.id);
            if (node != null) {
                try {
                    // node.receive();
                    //console.log("doxml was called for node: ");
                    //console.dir(node);
                    //console.log("calling getJson");
                    var nrjson=dgxml.getJson();
                    console.log("calling nodered2xml");
                    var results=[];
                    results=dgxml.nodered2xml(nrjson,node.id);
                    var nrxml=results[0];
                    fileName=results[1];
                    console.log("Got this filename: " + fileName);
                    // res.send(200);
                    console.log("appDir: " + appDir);
                    fs.writeFileSync(appDir + "/public/xml/"+fileName,nrxml);
                    // res.send("XML generated! See help on right for link.");
                    res.send(fileName);
                } catch(err) {
                    res.send(500);
                    node.error("doxml failed:"+err);
                    console.log(err.stack);
                }
            } else {
                res.send(404);
            }
    });
*/
}
