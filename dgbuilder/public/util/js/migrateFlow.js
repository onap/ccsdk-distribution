fs=require('fs');
_=require('lodash');
//extras=require("/home/users/schinthakayala/nodered/sheshi/dgxml/extras");
//puts=extras.puts;
var path = require('path');
var appDir = path.dirname(require.main.filename);

var dgjson = [];
var level = 0;

function getJSON() {
var filename = process.argv[2]; 
  console.log("reading json from flows file" + filename);
  //flowsJson=fs.readFileSync(appDir + "/flows_ss4nj01dev01.localdomain.json").toString();
  flowsJson=fs.readFileSync(filename).toString();
  // Let's make a backup while we're here...
  ts=Date.now().toString();
  flows=JSON.parse(flowsJson);
  //console.log("returning flows");
  return(flows);
}

function getStartTag(xmlStr){
        var startTag= null ;
	if(xmlStr != null){
		xmlStr = xmlStr.trim();
	}
        try{
                var regex = new RegExp("(<)([^ >]+)");
                var match = regex.exec(xmlStr);
                if(match != null){
                        if(match[1] != undefined && match[2] != undefined){
                                startTag = match[2];
                        }
                }
        }catch(e){
                console.log(e);
        }
	return startTag;

}

function getAttributeValue(xmlStr,attribute){
	var attrVal=null;
	try{
		var myRe = new RegExp(attribute + "=['\"](.*)['\"] ","m");
		var myArray = myRe.exec(xmlStr);
		if(myArray != null && myArray[1] != null){
			attrVal=myArray[1];
		}
	}catch(err){
		console.log(err);
	}
	return attrVal;
}

function processNodes(){
	var nodes = getJSON();
	//console.dir(nodes);

  	nodes.forEach( function(node) {
		if( node.xml != null && node.xml.indexOf("<service-logic") != -1){
			//console.log(node.xml);
			var module="";
			var version="";
			module=getAttributeValue(node.xml,"module");
			/*
			var myRe = new RegExp("module=\"(.*)\" ", "m");
			var myArray = myRe.exec(node.xml);
			if(myArray != null && myArray[1] != null){
				module=myArray[1];
			}
			myRe = new RegExp("version=\"(.*)\">", "m");
			 myArray = myRe.exec(node.xml);
			if(myArray != null && myArray[1] != null){
				version=myArray[1];
				//console.dir(myArray);
			}
			*/
			version=getAttributeValue(node.xml,"version");
			node.type="service-logic";
			//node.category="DGEmain";
			node.module=module;
			node.version=version;
			if(module != null && version != null){
				node.name=module+ "_" + version;
			}
			console.log("module=" + module);
			console.log("version=" + version);
		}else if( node.xml != null && node.xml.indexOf("<method") != -1){
			var rpc=getAttributeValue(node.xml,"rpc");
			node.type="method";
			if(rpc != null){
				node.name=rpc;
			}
		}else if( node.xml != null && node.xml.indexOf("<outcome") != -1){
			 var uxml = node.xml.toUpperCase();
			if(uxml.indexOf("FAILURE") != -1){
				node.type="failure";
			}else if(uxml.indexOf("SUCCESS") != -1){
				node.type="success";
			}else if(uxml.indexOf("TRUE") != -1){
				node.type="outcomeTrue";
			}else if(uxml.indexOf("FALSE") != -1){
				node.type="outcomeFalse";
			}else if(uxml.indexOf("ALREADY-ACTIVE") != -1){
				node.type="already-active";
			}else if(uxml.indexOf("NOT-FOUND") != -1){
				node.type="not-found";
			}else{
				node.type="other";
			}
		}else if( node.xml != null && node.xml.indexOf("<return") != -1){
			 var uxml = node.xml.toUpperCase();
			if(uxml.indexOf("FAILURE") != -1){
				node.type="returnFailure";
			}else if(uxml.indexOf("SUCCESS") != -1){
				node.type="returnSuccess";
			}
		}else if( node.xml != null && node.xml.indexOf("<exists") != -1){
			node.type="exists";
		}else if( node.xml != null && node.xml.indexOf("<block") != -1){
			node.type="block";
			var atomic=getAttributeValue(node.xml,"atomic");
			
			if(atomic=='true'){
				node.atomic="true";
				node.name="block : atomic";
			}else{
				node.atomic="false";
				node.name="block";
			}
		}else if( node.xml != null && node.xml.indexOf("<save") != -1){
			node.type="save";
		}else if( node.xml != null && node.xml.indexOf("<switch") != -1){
			node.type="switchNode";
		}else if( node.xml != null && node.xml.indexOf("<record") != -1){
			node.type="record";
		}else if( node.xml != null && node.xml.indexOf("<call") != -1){
			node.type="call";
		}else if( node.xml != null && node.xml.indexOf("<release") != -1){
			node.type="release";
		}else if( node.xml != null && node.xml.indexOf("<set") != -1){
			node.type="set";
		}else if( node.xml != null && node.xml.indexOf("<for") != -1){
			node.type="for";
		}else if( node.xml != null && node.xml.indexOf("<is-available") != -1){
			node.type="is-available";
		}else if( node.xml != null && node.xml.indexOf("<reserve") != -1){
			node.type="reserve";
		}else if( node.xml != null && node.xml.indexOf("<get-resource") != -1){
			node.type="get-resource";
		}else if( node.xml != null && node.xml.indexOf("<configure") != -1){
			node.type="configure";
		}else if( node.xml != null && node.xml.indexOf("<delete") != -1){
			node.type="delete";
		}else if( node.xml != null && node.xml.indexOf("<execute") != -1){
			node.type="execute";
		}
		//console.dir(node);
  	});	
/*
	var moduleName = "service-logic";
	var methodName = "method";
        for(var i=0;nodes != null && i<nodes.length;i++){
                        if(nodes[i].type == "service-logic"){
                                moduleName = nodes[i].name;
                        }
                        if(nodes[i].type == "method"){
                                methodName = nodes[i].name;
                        }
        }
	var fName = moduleName + "_" + methodName + ".json";
	fName = fName.replace(/\s/g, "_");

	var newFilename = process.argv[3];
	var filename =   newFilename + "/" + fName;
	console.log("filename" + filename);
        fs.writeFileSync(filename, JSON.stringify(nodes,null,4));
	*/
}


processNodes();
