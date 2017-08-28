function getDgStartNode(nodeList){
		for(var i=0;i<nodeList.length;i++){
			if(nodeList[i].type == 'dgstart' && nodeList[i].wires != null &&  nodeList[i].wires != undefined){
				return nodeList[i];
			}	
		}
		RED.notify("DGSTART node not found.");
		return null;
}


var loopDetectionEnabled = true;

function detectLoopPrev(){
		var activeWorkspace=RED.view.getWorkspace();
		/*
		RED.nodes.links.filter(function(d) {
			 if(d.source.z == activeWorkspace && d.target.z == activeWorkspace){
				 console.log(d.source.id+":"+d.sourcePort+":"+d.target.id);
			 }
		});
		*/	
		//console.dir(RED.nodes.links);
		var nSet=[];
		
		RED.nodes.eachNode(function(n) {
			if (n.z == activeWorkspace) {
                    		nSet.push({'n':n});
                	}
        	});

		var nodeSet = RED.nodes.createExportableNodeSet(nSet);
		//console.dir(nodeSet);
		
		//console.log("nodeSet length:" + nodeSet.length);

		var isLoopDetected = false;	
		var dgStartNode = getDgStartNode(nodeSet);
		if(dgStartNode == null || dgStartNode == undefined) {
			console.log("dgstart node not linked.");
			return true;
		}

		var wires = dgStartNode.wires;
	        var nodesInPath = {};
		var dgStartNodeId = dgStartNode.id;
		if(wires != null && wires != undefined && wires[0] != undefined){
			for(var k=0;k<wires[0].length;k++){
				var val = wires[0][k];
				nodesInPath[dgStartNodeId + "->" + val] = "";
			}
		}else{
				nodesInPath[dgStartNodeId + "->" + ""] = "";
		}
			
		//console.dir(nodesInPath);
		var loopDetectedObj = {};
		/* the nodes will not be order so will need to loop thru again */
	for(var m=0;nodeSet != null && m<nodeSet.length;m++){
		for(var i=0;nodeSet != null && i<nodeSet.length;i++){
			var link=nodeSet[i].id;
			//console.log("NAME:" + nodeSet[i].name + ":" + link);
			if(link == dgStartNodeId) continue;
			var wires = nodeSet[i].wires;
			//console.log("link:" + link);
			var delKeys = [];
			if(wires != null && wires != undefined && wires[0] != undefined){
				for(var k=0;k<wires[0].length;k++){
					var val = (wires[0])[k];
					var keys = Object.keys(nodesInPath);
					//console.log("keys:" + keys);
					for (var j=0;j<keys.length;j++){
						//console.log("key:" + keys[j]);
						//console.log("val:" + val);
						var index = -1;
						if(keys[j] != null){
						 	index = keys[j].indexOf("->" + link);
						}
						var lastIndex = keys[j].lastIndexOf("->");
						if(index != -1 && index == lastIndex){
							//delete nodesInPath[key];
							var previousNodeId = keys[j].substr(lastIndex +2);
							var indexOfArrow = -1;
							if(previousNodeId != ""){
								indexOfArrow = previousNodeId.indexOf("->");
							}
							if(previousNodeId != null && indexOfArrow != -1){
								previousNodeId = previousNodeId.substr(0,indexOfArrow);
							}	
							nodesInPath[keys[j] + "->" + val] = "";
							//console.log("keys[j]:" + keys[j]);
							delKeys.push(keys[j]);
							var prevNodeIdIndex = keys[j].indexOf("->" + previousNodeId);
							var priorOccurence = keys[j].indexOf(val + "->");
							if(priorOccurence != -1 && priorOccurence<prevNodeIdIndex){
								//console.log("previousNodeId:" + previousNodeId);
								//console.log("val:" + val);
								var n1 = getNode(nodeSet,previousNodeId);
								var n2 = getNode(nodeSet,val);
								//console.log("loop detected for node " + n1.name + " and " + n2.name);	
								loopDetectedObj[n1.name + "->" + n2.name] ="looped";
								//console.dir(loopDetectedObj);
								isLoopDetected = true;
							}		
						} 
					}
				}
			}
			for(var l=0;delKeys != null && l<delKeys.length;l++){
				delete nodesInPath[delKeys[l]];
			}
		}


	}	
	if(loopDetectedObj != null ){ 
		var msg = "";
		for(var key in loopDetectedObj){
  			if(loopDetectedObj.hasOwnProperty(key)) {
				console.log("Loop detected  " + key);
				msg += "<strong>Loop detected for:" + key + "</strong><br>";
  			}
		}
		if(msg != ""){
			isLoopDetected = true;
			RED.notify(msg);
		}
	}	
/*
		for(var i=0;nodeSet != null && i<nodeSet.length;i++){
			var foundCount=0;
			var nodeId = nodeSet[i].id;
			var nodeName = nodeSet[i].name;
			for(var j=0;nodeSet != null && j<nodeSet.length;j++){
				var node = nodeSet[j];
				if(node.id == nodeId){
					 continue;
				}
				var wires = node.wires;
				console.log(node.type + ":wires:" + wires);
				for(var k=0;wires != null && wires != undefined && wires[0] != undefined && k<wires[0].length;k++){
					var id = (wires[0])[k];
					console.log(nodeName + ":" + nodeId + ":" + id);
					if(id == nodeId ){
						foundCount++;
						if(foundCount>1){
							console.log("Loop detected for node " + nodeName + "with node:" + node.name);
							RED.notify("<strong>Flow error detected for node '" + nodeName + "' with node '" + node.name + "'</strong>");
							//RED.nodes.eachLink(function(d){
							//	if(d.source.id == nodeSet[i] || d.target.id == nodeSet[j]){
							//		d.selected = true;
							//	}else if(d.source.id == nodeSet[j] || d.target.id == nodeSet[i]){
							//		d.selected = true;
							//	}
							//});
							//RED.view.redraw();
							isLoopDetected = true;
							return true;
						}
					}
				}
				
			}
		}
*/
		//console.log("isLoopDetected:" + isLoopDetected);
		return isLoopDetected;
}

function generateNodePath(nodeIdToNodeObj,nodeId,pathStr,nodesInPath,errList){
		var node = nodeIdToNodeObj[nodeId];
		var wires = node.wires;
		if(wires != null && wires != undefined && wires[0] != undefined){
			for(var k=0;k<wires[0].length;k++){
				var val = wires[0][k];
				if(pathStr.indexOf(val + "->") != -1){
					//console.log("pathStr:" + pathStr);
					var n1= nodeIdToNodeObj[nodeId].name;
					var n2= nodeIdToNodeObj[val].name;
					errList.push("Loop detected between nodes '" +  n1 + "' and " + "'" +  n2 + "'");
				}else{
				 	pathStr += "->" + val ;
					generateNodePath(nodeIdToNodeObj,val,pathStr,nodesInPath,errList);
				}
			}
		}else{
				//pathStr += nodeId + "->" + "";
				nodesInPath.push(pathStr);
		}
}

function detectLoop(){
		var activeWorkspace=RED.view.getWorkspace();
		var nSet=[];
		var nodeIdToNodeObj = {};	
		RED.nodes.eachNode(function(n) {
			if (n.z == activeWorkspace) {
                    		nSet.push({'n':n});
                	}
        	});

		var nodeSet = RED.nodes.createExportableNodeSet(nSet);
		nodeIdToNodeObj = getNodeIdToNodeMap(nodeSet);
		var isLoopDetected = false;	
		//var dgStartNode = getDgStartNode(nodeSet);
		var dgStartNode = nodeIdToNodeObj["dgstart"];
		var errList = [];
		var dgStartNodeId = dgStartNode.id;
		var nodesInPathArr = [];
		generateNodePath(nodeIdToNodeObj,dgStartNodeId,dgStartNodeId,nodesInPathArr,errList);
		if(errList != null && errList != undefined && errList.length  > 0){
			isLoopDetected = true;
			var htmlStr="<div id='loop-detect-err-list-div'><table id='loopErrListTable' border='1'><tr><th>Error List</th></tr>";	
			for(var j=0;errList != null && j<errList.length;j++){
				var errSeq = j+1;
				htmlStr += "<tr><td>" + errSeq + ")"  + errList[j] + "</td></tr>"; 
			}
			htmlStr += "</table></div>";

			$("#loop-detection-dialog").dialog({
			      autoOpen : false,
                              modal: true,
                              title: "DG Flow validation Error List ",
                              width: 500,
                              buttons: {
                                Close: function () {
                                  $("#loop-detection-dialog").dialog("close");
                                }
                              }
                         }).dialog("open").html(htmlStr); // end dialog div
		}
		nodesInPathArr=null;
		nodeSet ={};
		nodeIdToNodeObj={};
		return isLoopDetected;
}


var xmlNumberCnt = 0;
function processForXmlNumbers(nodeSet,node){
	if( node != null && node.type != 'dgstart'){
		if(node.xmlnumber != null && node.xmlnumber){
			node.xmlnumber.push(++xmlNumberCnt);
		}else{
			node.xmlnumber =  [++xmlNumberCnt];
		}
	}

	if(node != null && node.wires != null && node.wires.length>0){
		var wiredNodes=node.wires[0];
		var wiredNodesArr=[];
		for(var k=0;wiredNodes != undefined && wiredNodes != null && k<wiredNodes.length;k++){
			wiredNodesArr.push(getNode(nodeSet,wiredNodes[k]));
		}

		//use this sort to sort by y position
		wiredNodesArr.sort(function(a, b){
			return a.y-b.y;
		});

		for(var k=0;k<wiredNodesArr.length;k++){
			var n = wiredNodesArr[k];
			processForXmlNumbers(nodeSet,n);
		}
	}
}

function updateXmlNumbers(){
	xmlNumberCnt = 0;
	var nodeSet = getCurrentFlowNodeSet();
	if(nodeSet == null && nodeSet.length >0){
		nodeSet.forEach(function(n){
			if(n.xmlnumber){
				delete n.xmlnumber;
			}
		});
	}
	var dgStartNode = getDgStartNode(nodeSet);
	processForXmlNumbers(nodeSet,dgStartNode);
	var activeWorkspace=RED.view.getWorkspace();
	RED.nodes.eachNode(function(n) {
		//console.log("Node processed in eachNode");
	     if (n.z == activeWorkspace) {
		if(n != null){
			var updatedNode = getNode(nodeSet,n.id);
			//console.log("updated Node processed in eachNode");
			//console.dir(updatedNode);
			
                        if (n.id == updatedNode.id) {
				n.xmlnumber = updatedNode.xmlnumber;
				n.dirty = true;
                        }
		}
	    }	
        });
}

function getOutcomeValue(node){
	var xmlStr = "";
	if(node != null && node.xml != undefined && node.xml !=""){
		xmlStr = node.xml + "</outcome>";
	}
	var xmlDoc;
       	if (window.DOMParser){
		try{
       			var parser=new DOMParser();
            		xmlDoc=parser.parseFromString(xmlStr,'text/xml');
			//console.log("Not IE");
			var n = xmlDoc.documentElement.nodeName;
			if(n == "html"){
				resp=false;
				console.log("Error parsing");
				return resp;
			}
		}catch(e){
			console.log("xmlStr:" + xmlStr);
			console.log("Error parsing" +e);
			return null;
		}
        }else{ 
		try{
			//console.log("IE");
	    		// code for IE
            		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            		xmlDoc.async=false;
            		xmlDoc.loadXMLString(xmlStr); 
		}catch(e){
			console.log("xmlStr:" + xmlStr);
			console.log("Error parsing" +e);
			return null;
		}
        } 
	if(xmlDoc != null){
		var xmlNode = xmlDoc.documentElement;
		//console.dir(xmlNode);
		var processedNode = xmlNode.nodeName;
		//console.log("processedNode:" + processedNode);
		var attrs = xmlNode.attributes;
		for(var i=0;i<attrs.length;i++){
			if(attrs[i].nodeName == "value"){
				return  attrs[i].value;
			}
		}
	}
	return null;
}

var dgNumberCnt = 0;
function processForDgNumbers(nodeSet,node){
		var outcomeTypes = [ "already-active", "failure", "not-found", "other", "outcomeFalse", "outcome", "outcomeTrue", "success" ];
	if( node != null && node.type != 'dgstart' && node.type != 'service-logic' && node.type != 'method' ){
		//console.log("child of " + parentNodeType + " :" + nodeType);
		//check if NOT outcome node
		if(outcomeTypes.indexOf(node.type) == -1){
			if(node.type == "GenericXML"){
				if(node.xml != undefined && node.xml !=  null && node.xml.indexOf("<outcome ") != -1){
					//this GenericXML node is used for outcome , so need to skip
				}else{
					if(node.dgnumber != undefined && node.dgnumber != null && node.dgnumber){
						node.dgnumber.push(++dgNumberCnt);
					}else{
						node.dgnumber =  [++dgNumberCnt];
					}
				}
			
			}else{
				if(node.dgnumber != undefined && node.dgnumber != null && node.dgnumber){
					node.dgnumber.push(++dgNumberCnt);
				}else{
					node.dgnumber =  [++dgNumberCnt];
				}
			}
		}
	}
	
	var hasOutcomeNodes = false;
	if(node != null && node.wires != null && node.wires.length>0){
		var wiredNodes=node.wires[0];
		var wiredNodesArr=[];
		for(var k=0;wiredNodes != undefined && wiredNodes != null && k<wiredNodes.length;k++){
			var wiredNode = getNode(nodeSet,wiredNodes[k]);
			//check if outcome node
			if(outcomeTypes.indexOf(wiredNode.type) != -1){
				hasOutcomeNodes = true;
			}
			if(wiredNode.type == "GenericXML"){
				if( node.xml != undefined && node.xml != null && node.xml.indexOf("<outcome ") != -1){
					//this GenericXML node is used for outcome 
					hasOutcomeNodes = true;
				}
			}
			wiredNodesArr.push(wiredNode);

		}

		//use this sort to sort by y position
		wiredNodesArr.sort(function(a, b){
			return a.y-b.y;
		});

		/*
		//USE THIS LOGIC TO SORT BY OUTCOME VALUE FOR SPECIFIC NODES		
		var parentNodeType = node.type;
		if(hasOutcomeNodes && parentNodeType != 'switchNode' && parentNodeType != 'block'  && parentNodeType != 'configure' ){	
			//use the value of outcome to sort the wired nodes
			wiredNodesArr.sort(function(a, b){
				var val1 = getOutcomeValue(a);
				var val2 = getOutcomeValue(b);
				//console.log("val1:" + val1);
				//console.log("val2:" + val2);
				if ( val1 < val2 ){
  					return -1;
				}else if ( val1 > val2 ){
  					return 1;
				}else{
					return 0;
				}
			});
		}else{
			//use this sort to sort by y position
			wiredNodesArr.sort(function(a, b){
				return a.y-b.y;
			});
		}

		*/

		for(var k=0;k<wiredNodesArr.length;k++){
			var n = wiredNodesArr[k];
			processForDgNumbers(nodeSet,n);
		}
	}
}

function updateDgNumbers(){
	dgNumberCnt = 0;
	var nodeSet = getCurrentFlowNodeSet();
	if(nodeSet == null && nodeSet.length >0){
		nodeSet.forEach(function(n){
			if(n.dgnumber){
				delete n.dgnumber;
			}
		});
	}
	var dgStartNode = getDgStartNode(nodeSet);
	processForDgNumbers(nodeSet,dgStartNode);
	var activeWorkspace=RED.view.getWorkspace();
	RED.nodes.eachNode(function(n) {
		//console.log("Node processed in eachNode");
	     if (n.z == activeWorkspace) {
		if(n != null){
			var updatedNode = getNode(nodeSet,n.id);
			//console.log("updated Node processed in eachNode");
			//console.dir(updatedNode);
			
                        if (n.id == updatedNode.id) {
				//console.log(n.type + ":" + updatedNode.dgnumber);
				n.dgnumber = updatedNode.dgnumber;
				n.dirty = true;
                        }
		}
	    }	
        });
	return nodeSet;	
}

function customValidation(currNodeSet){
	//validation to make sure there a block node infront of mutiple dgelogic nodes
	flowDesignErrors=[];
	var dgStartCnt=0;
	var serviceLogicCnt=0;
	var methodCnt=0;
	for(var i=0;currNodeSet != null && i<currNodeSet.length;i++){
		var node = currNodeSet[i];
		var parentNodeName = node.name;
		var parentNodeType = node.type;
		var dgNumber = node.dgnumber;
		if(parentNodeType == 'dgstart'){
			dgStartCnt++;	
		}
		if(parentNodeType == 'service-logic'){
			serviceLogicCnt++;	
		}
		if(parentNodeType == 'method'){
			methodCnt++;	
		}
		if(parentNodeType == "GenericXML"){
			if( node.xml != undefined && node.xml != null && node.xml.indexOf("<service-logic ") != -1 ){
				//this GenericXML node is used for service-logic 
				serviceLogicCnt++;
			}else if( node.xml != undefined && node.xml != null &&  node.xml.indexOf("<method ") != -1 ){
				//this GenericXML node is used for method
				methodCnt++;
			}else if( node.xml != undefined && node.xml != null &&  node.xml.indexOf("<block") != -1 ){
				//this GenericXML node is used for block
				parentNodeType = "block";
			}
		}
		if(node != null && node.wires != null && node.wires.length>0){
			var wiredNodes=node.wires[0];
			var wiredNodesArr=[];
			for(var k=0;wiredNodes != undefined && wiredNodes != null && k<wiredNodes.length;k++){
				wiredNodesArr.push(getNode(currNodeSet,wiredNodes[k]));
			}
			var countChildLogicNodes =0;
			for(var k=0;k<wiredNodesArr.length;k++){
				var n = wiredNodesArr[k];
				var nodeType = n.type;
				var outcomeTypes = [ "already-active", "failure", "not-found", "other", "outcomeFalse", "outcome", "outcomeTrue", "success" ];
				var isOutcomeOrSetNode = false;
				if(nodeType == "GenericXML"){
					if( n.xml != undefined &&  n.xml != null &&  (n.xml.indexOf("<outcome ") != -1 || n.xml.indexOf("<set ") != -1)){
						//this GenericXML node is used for outcome 
						isOutcomeOrSetNode = true;
					}
				}
				//console.log("child of " + parentNodeType + " :" + nodeType);
				if(outcomeTypes.indexOf(nodeType) > -1 ||nodeType == 'set' || isOutcomeOrSetNode){
					//its a outcome or set node
				}else{
					countChildLogicNodes++;
				}

				//console.log("parentNodeType:" + parentNodeType);
				if(countChildLogicNodes >1 && parentNodeType != 'block' && parentNodeType != 'for' ){
					if(node.dgnumber != undefined &&  node.dgnumber){
						flowDesignErrors.push("Warning:May need a block Node after Node. <br><span style='color:red'>Node Name:</span>" + node.name + "<br><span style='color:red'>DG Number:</span>" + node.dgnumber[0] );
					}else{
						flowDesignErrors.push("Warning:May need a block Node after Node <br><span style='color:red'>Node name:</span>" + parentNodeName);
					}
					break;
				}
			}
		}
	}
	if(dgStartCnt > 1){
		flowDesignErrors.push("Error:There should  only be 1 dgstart Node in the current workspace.");
	}

	if(serviceLogicCnt > 1){
		flowDesignErrors.push("Error:There should  only be 1 service-logic Node in the current workspace.");
	}

	if(methodCnt > 1){
		flowDesignErrors.push("Error:There should  only be 1 method Node in the current workspace.");
	}

	if(flowDesignErrors != null && flowDesignErrors.length >0){
		return false;
	}
	return true;
}

var flowDesignErrors = [];
function showFlowDesignErrorBox(){
	if(flowDesignErrors != null && flowDesignErrors.length >0){
		var htmlStr="<div id='flowpath-err-list-div'><table id='fpeTable' border='1'><tr><th>Error List</th></tr>";	
		for(var j=0;flowDesignErrors != null && j<flowDesignErrors.length;j++){
			var errSeq = j+1;
			htmlStr += "<tr><td>" + errSeq + ")"  + flowDesignErrors[j] + "</td></tr>"; 
		}
		htmlStr += "</table></div>";

		//$('<div></div>').dialog({

		$('#flow-design-err-dialog').dialog({
                              modal: true,
                              title: "Flow design Error List ",
                              width: 500,
                              /*open: function () {
                                $(this).html(htmlStr);
                              },*/
                              buttons: {
                                Close: function () {
                                  $(this).dialog("close");
                                }
                              }
                            }).html(htmlStr); // end dialog div
	}
}


function getCurrentFlowNodeSet(){
		var nodeSet=[];
		//console.dir(RED);
		//RED.view.dirty();
		//RED.view.redraw();
		var activeWorkspace=RED.view.getWorkspace();
		RED.nodes.eachNode(function(n) {
			if (n.z == activeWorkspace) {
                    		nodeSet.push({'n':n});
                	}
        	});

		var exportableNodeSet = RED.nodes.createExportableNodeSet(nodeSet);
		//console.dir(exportableNodeSet);
		//console.log(JSON.stringify(exportableNodeSet));
		return exportableNodeSet;
}

function getNode(nodeSet,id){
		for(var i=0;i<nodeSet.length;i++){
			if(nodeSet[i].id == id){
				return nodeSet[i];
			}	
		}
		return null;
}
function getNodeIdToNodeMap(nodeSet){
		var nodeIdToNodeMap ={};	
		for(var i=0;i<nodeSet.length;i++){
				nodeIdToNodeMap[nodeSet[i].id] = nodeSet[i];
				if(nodeSet[i].type == "dgstart"){
					nodeIdToNodeMap["dgstart"] =  nodeSet[i];
				}
		}
		return nodeIdToNodeMap;
}

function validateEachNodeXml(){
		var activeWorkspace=RED.view.getWorkspace();
		RED.nodes.eachNode(function(n) {
			if (n.z == activeWorkspace) {
				var xml = n.xml;	
				if( xml != null && xml != ''){
				  var validationSuccess = validateXML(n.xml);
					if(validationSuccess){
                        			n.status = {fill:"green",shape:"dot",text:"OK"};
					}else{
                        			n.status = {fill:"red",shape:"dot",text:"ERROR"};
					}
				}
                	}
        	});
}


function getNodeToXml(inputNodeSet){
		var exportableNodeSet; 
	//uses inputNodeSet if passed otherwise build the latest nodeSet
	
	//$("#btn-deploy").removeClass("disabled");


		function getNode(id){
			for(var i=0;i<exportableNodeSet.length;i++){
				if(exportableNodeSet[i].id == id){
					return exportableNodeSet[i];
				}	
			}
			return null;
		}

		function getStartTag(node){
			var startTag="";
			var xmlStr="";
			if(node != null && node.type != 'dgstart'){
				xmlStr=node.xml;
				var regex = /(<)([\w-]+)(.*)?/;
                		var match = regex.exec(xmlStr);
                		if(match != null){
                        		if(match[1] != undefined && match[2] != undefined){
                                		startTag = match[2];
                        		}
                		}else{
					console.log("startTag not found.");
				}	
			}
			return startTag;
		}

		if(inputNodeSet == null || inputNodeSet == undefined){	
			exportableNodeSet = getCurrentFlowNodeSet();
		}else{
			exportableNodeSet = JSON.parse(inputNodeSet);
		}
		var dgstartNode = getDgStartNode(exportableNodeSet);

		var level=0;
		var fullXmlStr="";

		printXml(dgstartNode);
		

		function printXml(node){
			var xmlStr="";
			var startTag = "";
			if(node != null && node.type != 'dgstart'){
				var comments=node.comments;
				if(comments != null && comments != ""){
					//if xml comments field already has the <!-- and --> remove them 
					comments=comments.replace("<!--","");
					comments=comments.replace("-->","");
					xmlStr="<!--" + comments + "-->";
				}	
				xmlStr+=node.xml;
				startTag = getStartTag(node);
				fullXmlStr +=xmlStr;
				/*
				if(level > 0){
					var spacing = Array(level).join("  ");	
					xmlStr=xmlStr.replace(/\n/g,spacing);
					fullXmlStr +=xmlStr;
					
					console.log(xmlStr);
				}else{
					fullXmlStr +=xmlStr;
					console.log(xmlStr);
				}
				*/
			}

			//console.log("startTag:" + startTag);
	
			var wiredNodes = [];
			var wiredNodesArr = [];
			if(node != null && node.wires != null && node.wires[0] != null &&  node.wires[0] != undefined && node.wires[0].length >0 ){
				wiredNodes=node.wires[0];
				//console.log("Before sort");
				for(var k=0;wiredNodes != undefined && wiredNodes != null && k<wiredNodes.length;k++){
					wiredNodesArr.push(getNode(wiredNodes[k]));
				}
				//console.dir(wiredNodesArr);
				//sort based on y position
				wiredNodesArr.sort(function(a, b){
					return a.y-b.y;
				});
				//console.log("After sort");
				//console.dir(wiredNodesArr);
			}

			for(var k=0;wiredNodesArr != null && k<wiredNodesArr.length;k++){
				level++;
				var nd = wiredNodesArr[k];
				printXml(nd);
			}

			//append end tag
			if(startTag != ""){
				fullXmlStr += "</" + startTag + ">";
				/*
				if(level >0){
					var spacing = Array(level).join("  ");	
					fullXmlStr += spacing + "</" + startTag + ">";
					console.log(spacing + "</" + startTag + ">");
				}else{
					fullXmlStr += "</" + startTag + ">";
					console.log("</" + startTag + ">");
				}
				*/
			}	

			/*if(level>0){
				level=level-1;
			}
			*/
			//console.log("endTag:" + startTag);
			//console.log("xml:" + fullXmlStr);
		}
		//console.log("fullXmlStr:" + fullXmlStr);
	return fullXmlStr;
}

function showFlow(filePath){
var jqxhr = $.post( "/getSharedFlow",{"filePath":filePath})
  .done(function(data) {
	$( "#dgflow-browser-dialog").dialog("close");
	var migratedNodes = migrateNodes(data);
	//RED.view.importNodes(data)
	RED.view.importNodes(JSON.stringify(migratedNodes));
    //console.log( "import done");
  })
  .fail(function() {
	RED.notify("Could not import user flow .");	
	$( "#dgflow-browser-dialog").dialog("close");
     console.log( "error occured importing flow.");
  })
  .always(function() {
    //console.log( "complete" );
  });
}

function showFlowXml(filePath){
var jqxhr = $.post( "/getSharedFlow",{"filePath":filePath})
  .done(function(data) {
	//console.dir(data);
	var xmlStr=getNodeToXml(data);
	showImportedXml(xmlStr,this);
  })
  .fail(function() {
	RED.notify("Could not convert to XML.");	
	$( "#dgflow-browser-dialog").dialog("close");
     console.log( "error occured importing flow.");
  })
  .always(function() {
    //console.log( "complete" );
  });
}

function showFlowFiles(userName){
		//var divStyle="color:#07c; margin-bottom: 1.2em; font-size: 16px;";
		//var divStyle="<style>#data-container a { color: #067ab4; font-size: 0.75em;} #data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } </style>";
		var divStyle="<style>#data-container a { color: #067ab4; font-size: 0.75em;} #data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";

		var htmlStr=divStyle + "<div class='header'>List of Flow files of User " + userName + "</div><div id='data-container'><ul>" ;
                $.post( "/getFiles/" + userName)
                         .done(function( data ) {
                                //console.dir(data);
				//console.log("found " + data.length + " files");
				if(data != null && data.length != undefined && data.length != 0){
					if(data != null && data.length>0){
						for(var k=0;k<data.length;k++){
							htmlStr += "<li><a href=\"#\" onclick=\"showFlow('" +data[k].filePath + "')\">" + data[k].name + "</a></li>";
						/*
							//Use this code to display the View Xml Link 
							htmlStr += "<li><a href=\"#\" onclick=\"showFlow('" +data[k].filePath + "')\">" + data[k].name + "</a><span style=\"margin-left:15px;color:blue\"><a href=\#\" onclick=\"showFlowXml('" +data[k].filePath + "')\">[View Xml]</a></span></li>";
			*/
						}
						htmlStr+="</ul></div>";
					}
                			$( "#dgflow-browser-dialog").html(htmlStr);
				}else{
					//console.log("no flow files found for user " + userName);
					var noFlowFilesHtml = divStyle + "<div id='data-container'><p>No downloaded Flow files found in " + userName + " directory</p><a href='#' onclick='javascript:closeAndShowFlowShareUsers()'>Back to List.</a></div>";
                			$( "#dgflow-browser-dialog").html(noFlowFilesHtml);
				}
                         })
                         .fail(function(err) {
                                 console.log( "error" + err );
                         })
                         .always(function() {
				//console.log("done");
                         });
	
}

	function  closeAndShowFlowShareUsers(){
                $("#dgflow-browser-dialog").dialog( "close" );
		var divStyle="<style>#data-container a { color: #067ab4; font-size: 0.75em;} #data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";
	 	$.get( "/flowShareUsers")
                               .done(function( data ) {
					
					var header="<div class='header'>List of downloaded DG Flows </div>";
					var html=  divStyle + header +  "<div id='data-container'>";
					html+="<ul>";
					if(data != null){
						var users=data.flowShareUsers;
						users.sort(function (a,b){
							 if(a.name > b.name){
								 return 1;
							 }else if(a.name <  b.name){
								 return -1;
							 }else{
								 return 0;
							 }
                                                });
						for(var i=0;users != null && i<users.length;i++){
							html+="<li><a href=\"#\" onclick=\"showFlowFiles('" + users[i].rootDir + "')\">" + users[i].name + "</a></li>";
						}
					}
					html+="</ul>";
					html+="</div>";
    					$( "#dgflow-browser-dialog" ).dialog({
            				title: "Dowloaded DG Flow Browser",
            				modal: true,
            				autoOpen: true,
            				width: 530,
            				height: 530,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
                        					$( this ).dialog( "close" );
                    					}
                				}
            					]
    					}).html(html);
					$("#dgflow-browser-dialog").show();
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get users.");
                                })
                                 .always(function() {
				});
	}

function showImportedXml(xmlStr,dialogBox){
	var formattedXml=vkbeautify.xml(xmlStr);
	var that = dialogBox;
                require(["orion/editor/edit"], function(edit) {
                that.editor = edit({
                    parent:document.getElementById('dgflow-browser-dialog'),
                    lang:"html",
                    readonly:true,
                    contents: formattedXml
                });
                RED.library.create({
                    url:"functions", // where to get the data from
                    type:"function", // the type of object the library is for
                    editor:that.editor, // the field name the main text body goes to
                    fields:['name','outputs']
                });
                });
}

function getTag(xmlStr){
        var tag= null ;
	if(xmlStr != null){
		xmlStr = xmlStr.trim();
	}
        try{
                var regex = new RegExp("(<)([^ >]+)");
                var match = regex.exec(xmlStr);
                if(match != null){
                        if(match[1] != undefined && match[2] != undefined){
                                tag = match[2];
                        }
                }
        }catch(e){
                console.log(e);
        }
	return tag;

}

function getAttributeValue(xmlStr,attribute){

	var attrVal=null;
	try{
		var myRe = new RegExp(attribute + "[\s+]?=[\s+]?['\"]([^'\"]+)['\"]","m");
		var myArray = myRe.exec(xmlStr);
		if(myArray != null && myArray[1] != null){
			attrVal=myArray[1];
		}
	}catch(err){
		console.log(err);
	}
	return attrVal;
}

function showOrHideTab(checkbox,idVal){

	var activeWorkspace=RED.view.getWorkspace();
	var table = $("#ftab02");
	$('td input:checkbox',table).each(function(i){
		console.log(this.checked);
	});
	//console.dir($('td input:checkbox',table).prop('checked',this.checked));

        $(".red-ui-tabs li a").each(function(i){
	 	var id=$(this).attr("href").replace('#','');
		if(id == idVal){
			$(this).parent().toggle();
			var isVisible = $(this).parent().is(":visible"); 
			if(isVisible){
				checkbox.checked = true;
			}else{
				checkbox.checked = false;
			}
			if(activeWorkspace == id){
				//$("#chart").hide();
				//var li = ul.find("a[href='#"+id+"']").parent();
				var li = $(this).parent();
            			if (li.hasClass("active")) {
					li.removeClass("active");
					if(li.parent().children().size() != 0){
					}
					console.log("has Class active");
                			var tab = li.prev();
                			if (tab.size() === 0) {
						console.log("li prev size 0");
                    				tab = li.next();
                			}
					if(tab.is(":visible")){
						console.log("added active");
						tab.addClass("active");
						tab.click();
						//tab.trigger("click");
					}
					//console.dir(tab);
                			//tab.parent().addClass("active");
	 				//tab.click();
            			}
			}else{
						console.log("added active id" +id);
						if(isVisible){
							var li = $(this).parent();
							li.addClass("active");
							li.click();
							//console.dir(li);
						}else{
							var li = $(this).parent();
							li.removeClass("active");
						}
			}
		}
	});
/*
        $(".red-ui-tabs li a").each(function(i){
	 	var id=$(this).attr("href").replace('#','');
		if(id != idVal){
	 		$(this).trigger("click");
			if(activeWorkspace == idVal){
				$("#chart").show();
			}
			return false;
		}
	});
*/
}

function performGitCheckout(){
	$("#responseId").text("");
	 if(!event) event = window.event;
         var target = $(event.target);
         target.val("Processing");
         target.css({ "background-image": "url('images/page-loading.gif')" });
         target.css({ "background-repeat": "no-repeat" });
         target.css({ "background-size": "25px 25px" });

	var branch = document.getElementById("branchId").value.trim();
	var statusObj = document.getElementById("responseId");
	if(branch == null || branch == ''){
		statusObj.innerText = "Branch is required.";
		return;
	}
	var urlVal = "/gitcheckout?branch=" + branch;
	$.get(urlVal)
		.done(function( data ) {
			var output = data.output;
			if(output != null){
				output=output.replace(/\n/g,"<br>");
				statusObj.innerHTML = output;
			}
		 })
		.fail(function(err) {
			statusObj.innerText = "Failed to do git checkout.";
		})
		.always(function() {
			$("#responseId").show();
			 target.val("Checkout");
                         target.css({ "background-image": "none" });
		 });
}

function performGitPull(){
	$("#responseId").text("");
	 if(!event) event = window.event;
         var target = $(event.target);
         target.val("Processing");
         target.css({ "background-image": "url('images/page-loading.gif')" });
         target.css({ "background-repeat": "no-repeat" });
         target.css({ "background-size": "25px 25px" });

	var statusObj = document.getElementById("responseId");
	var urlVal = "/gitpull";
	$.get(urlVal)
		.done(function( data ) {
			var output = data.output;
			if(output != null){
				output=output.replace(/\n/g,"<br>");
				statusObj.innerHTML = output;
			}
		 })
		.fail(function(err) {
			statusObj.innerText = "Failed to do git pull.";
		})
		.always(function() {
			$("#responseId").show();
			 target.val("Pull");
                         target.css({ "background-image": "none" });
		 });
}


function activateClickedTab(idVal) {

	$("#filter-tabs-dialog").dialog( "close" );
	var ul = $("#workspace-tabs");
	ul.children().each(function(){
		var li = $(this);
		var link =li.find("a");
		var href = link.prop("href");
		var hrefId = href.split("#");
		if(hrefId[1] == idVal){
		 link.trigger("click");
		}
	});
}

function deleteOrRenameTab(idVal) {
	$("#filter-tabs-dialog").dialog( "close" );
	var ul = $("#workspace-tabs");
	ul.children().each(function(){
		var li = $(this);
		var link =li.find("a");
		var href = link.prop("href");
		var hrefId = href.split("#");
		if(hrefId[1] == idVal){
		 	link.trigger("click");
		 	link.trigger("dblclick");
		}
	});
}

function deleteSelectedTab(idVal,title,_module,rpc,version){
	var dgInfo = "<div><table width='100%' border='1'><tr style='background-color:#65a9d7;color:white;' ><th>Tab Title</th><th>Module</th><th>RPC</th><th>Version</th></tr><tr style='background-color:white'><td>" + title + "</td><td>" + _module +"</td><td>" + rpc + "</td><td>" +version +  "</td></tr></table></div><br>";
	var alertMsg = dgInfo + "<p>Are you sure you want to Delete this Tab ?</p>"; 

$( "#tabAlertDialog" ).dialog({
  dialogClass: "no-close",
  modal:true,
  draggable : true,
  /*dialogClass: "alert",*/
  title: "Confirm Tab sheet Delete",
  width: 600,
  buttons: [
    {
      text: "Delete",
      class:"alertDialogButton",
      click: function() {
		var ws = RED.nodes.workspace(idVal);
		RED.view.removeWorkspace(ws);
        	var historyEvent = RED.nodes.removeWorkspace(idVal);
        	historyEvent.t = 'delete';
        	historyEvent.dirty = true;
        	historyEvent.workspaces = [ws];
        	RED.history.push(historyEvent);
        	RED.view.dirty(true);
        	$( this ).dialog( "close" );
		$("#filter-tabs-dialog").dialog( "close" );
		$("#btn-manage-tabs").trigger("click");
	}
    },
    {
      text: "Cancel",
      class:"alertDialogButton",
      click: function() {
        $( this ).dialog( "close" );
      }
    }
  ]
}).html(alertMsg);
}

function renameSelectedTab(idVal,title,_module,rpc,version){
	var dgInfo = "<div><table width='100%' border='1'><tr style='background-color:#65a9d7;color:white;' ><th>Tab Title</th><th>Module</th><th>RPC</th><th>Version</th></tr><tr style='background-color:white'><td><input id='tab-name-" + idVal + "' type='text' value='" + title + "'></td><td>" + _module +"</td><td>" + rpc + "</td><td>" +version +  "</td></tr></table></div><br>";
	var alertMsg = dgInfo + "<p>Change the title and click Rename.</p>"; 

$( "#tabAlertDialog" ).dialog({
  dialogClass: "no-close",
  modal:true,
  draggable : true,
  /*dialogClass: "alert",*/
  title: "Rename Tab sheet",
  width: 600,
  buttons: [
    {
      text: "Rename",
      class:"alertDialogButton",
      click: function() {
		var ws = RED.nodes.workspace(idVal);
	 	var label = document.getElementById("tab-name-" + idVal).value;	
		//console.log("label:" +label);
		//console.log("ws.label:" + ws.label);
		if (ws.label != label) {
                        ws.label = label;
                        var link = $("#workspace-tabs a[href='#"+idVal+"']");
                        link.attr("title",label);
                        link.text(label);
                        RED.view.dirty(true);
                }
		$("#tabAlertDialog").dialog('destroy').remove();
        	//$(this).dialog( "close" );
		$("#filter-tabs-dialog").dialog( "close" );
		$("#btn-manage-tabs").trigger("click");
	}
    },
    {
      text: "Cancel",
      class:"alertDialogButton",
      click: function() {
        $( this ).dialog( "close" );
      }
    }
  ]
}).html(alertMsg);
}

function performGitStatus(){
	$("#responseId").text("");
	 if(!event) event = window.event;
         var target = $(event.target);
         target.val("Processing");
         target.css({ "background-image": "url('images/page-loading.gif')" });
         target.css({ "background-repeat": "no-repeat" });
         target.css({ "background-size": "25px 25px" });

	var statusObj = document.getElementById("responseId");
	var urlVal = "/gitstatus";
	$.get(urlVal)
		.done(function( data ) {
			var output = data.output;
			if(output != null){
				output=output.replace(/\n/g,"<br>");
				statusObj.innerHTML = output;
			}
			//statusObj.innerText = data.output;
		 })
		.fail(function(err) {
			statusObj.innerText = "Failed to do git status.";
		})
		.always(function() {
			$("#responseId").show();
			 target.val("Status");
                         target.css({ "background-image": "none" });
		 });
}

function migrateNodes(jsonStr){
	var nodes = JSON.parse(jsonStr);
  	nodes.forEach( function(node) {
		if( node.xml != undefined && node.xml != null && node.xml.indexOf("<service-logic") != -1){
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
				node.name=module+ " " + version;
			}
			console.log("module=" + module);
			console.log("version=" + version);
		}else if( node.xml != undefined && node.xml != null && node.xml.indexOf("<method") != -1){
			var rpc=getAttributeValue(node.xml,"rpc");
			node.type="method";
			if(rpc != null){
				node.name=rpc;
			}
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<outcome") != -1){
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
		}else if( node.xml != undefined &&node.xml != null && node.xml.indexOf("<return") != -1){
			 var uxml = node.xml.toUpperCase();
			if(uxml.indexOf("FAILURE") != -1){
				node.type="returnFailure";
			}else if(uxml.indexOf("SUCCESS") != -1){
				node.type="returnSuccess";
			}
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<exists") != -1){
			node.type="exists";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<block") != -1){
			node.type="block";
			var atomic=getAttributeValue(node.xml,"atomic");
			
			if(atomic=='true'){
				node.atomic="true";
				node.name="block : atomic";
			}else{
				node.atomic="false";
				node.name="block";
			}
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<save") != -1){
			node.type="save";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<switch") != -1){
			node.type="switchNode";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<record") != -1){
			node.type="record";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<call") != -1){
			node.type="call";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<release") != -1){
			node.type="release";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<set") != -1){
			node.type="set";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<for") != -1){
			node.type="for";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<is-available") != -1){
			node.type="is-available";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<reserve") != -1){
			node.type="reserve";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<get-resource") != -1){
			node.type="get-resource";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<configure") != -1){
			node.type="configure";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<delete") != -1){
			node.type="delete";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<execute") != -1){
			node.type="execute";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<notify") != -1){
			node.type="notify";
		}else if(node.xml != undefined && node.xml != null && node.xml.indexOf("<update") != -1){
			node.type="update";
		}
		//console.dir(node);
  	});	
	return nodes;
}
