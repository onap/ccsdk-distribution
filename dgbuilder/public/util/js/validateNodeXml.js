function resetStatus(){
	showMsg("","green");
}

function showMsg(msg,color){
     $("#node-validate-result").html(msg);
     $("#node-validate-result")
	 			.css('color', '')
    				.css('color', color);
}

function getAttributeValue(xmlStr,attribute){

	var attrVal=null;
	try{
		if(xmlStr != null){
			var myRe = new RegExp(attribute + "[\s+]?=[\s+]?['\"]([^'\"]+)['\"]","m");
			var myArray = myRe.exec(xmlStr);
			if(myArray != null && myArray[1] != null){
				attrVal=myArray[1];
			}
		}
	}catch(err){
		console.log(err);
	}
	return attrVal;
}


var resp = true;
var processedNode = "";
var errList=[];
var elementCount=0;
function processNode(xmlNode){
	if(xmlNode == null) return;
	if(xmlNode.nodeName != "parsererror" && xmlNode.nodeName != "#text"){
			processedNode = xmlNode.nodeName;
	}
	//console.log("processedNode:" + processedNode);
	switch(xmlNode.nodeType){
		case 1:
			elementCount++;
	       		//ELEMENT_NODE
			//console.log(xmlNode.nodeName);
			//console.dir(xmlNode.nodeName);
			if(xmlNode.nodeName == "parsererror"){
				//var nearNode = xmlNode.previousSibling != null ?xmlNode.previousSibling.nodeName : xmlNode.parentNode.nodeName;
				console.log("Error parsing xml after node " + processedNode);
				var msg = "error parsing XML after element &lt;" + processedNode + "&gt; Element#" + elementCount;
				errList.push(msg);
				resp = false;
				return;
			}	
			processedNode = xmlNode.nodeName;
			var attrs = xmlNode.attributes;
			for(var i=0;i<attrs.length;i++){
				//console.log("Attribute:" + attrs[i].nodeName);
				//console.log("Value:" + attrs[i].value);
				if(attrs[i].nodeName != "value" && attrs[i].value == ""){
					var msg="";
					/*
					var prevSibling = xmlNode.previousSibling;
					if(prevSibling != null && prevSibling != undefined){
						msg = "element &lt;" + xmlNode.nodeName  + "&gt; attribute '" + attrs[i].nodeName + "' is not set. Element#" + elementCount;
					}else{
						msg = "element &lt;" + xmlNode.nodeName  + "&gt; attribute '" + attrs[i].nodeName + "' is not set. Element#" + elementCount;
					}
					*/
					msg = "element &lt;" + xmlNode.nodeName  + "&gt; attribute '" + attrs[i].nodeName + "' is not set. Element#" + elementCount;
					errList.push(msg);
					//console.log("element <" +  xmlNode.nodeName + "> attribute '" + attrs[i].nodeName + "' is not set.Element#" + elementCount);
					resp = false;
				}
			}
			var childNodes = xmlNode.childNodes;
			for(var k=0;k<childNodes.length;k++){
				processNode(childNodes[k]);
			}
			break;
		case 2:
			//ATTRIBUTE_NODE
			//console.log(xmlNode.nodeName);
			break;
		case 3:
			//TEXT_NODE
			//console.log(xmlNode.nodeValue);
			break;
		case 4:
			//CDATA_SECTION_NODE
			console.log("CDATA_SECTION_NODE");
			break;
		case 5:
			//ENTITY_REFERENCE_NODE
			console.log("ENTITY_REFERENCE_NODE");
			break;
		case 6:
			//ENTITY_NODE
			console.log("ENTITY_NODE");
			break;
		case 7:
			//PROCESSING_INSTRUCTION_NODE
			console.log("PROCESSING_INSTRUCTION_NODE");
			break;
		case 8:
			//COMMENT_NODE
			console.log("COMMENT_NODE");
			break;
		case 9:
			//DOCUMENT_NODE
			console.log("DOCUMENT_NODE");
			break;
		case 10:
			//DOCUMENT_TYPE_NODE
			console.log("DOCUMENT_TYPE_NODE");
			break;
		case 11:
			//DOCUMENT_TYPE_NODE
			console.log("DOCUMENT_FRAGMENT_NODE");
			break;
		case 12:
			//NOTATION_NODE
			console.log("DOCUMENT_FRAGMENT_NODE");
			break;
	}
}

function validateFinalXML(xmlStr){

	//console.dir(RED);
	processedNode="";
	resp=true;
	errList=[];
	elementCount=0;
	//console.log("In validateXML xmlStr:" + xmlStr);
	if(xmlStr == null || xmlStr == "") return true;
	xmlStr = xmlStr.trim();
	try{
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
				console.log("Error parsing" +e);
				return false;
			}
         	}else{ 
			try{
				//console.log("IE");
	    			// code for IE
            			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            			xmlDoc.async=false;
            			xmlDoc.loadXMLString(xmlStr); 
			}catch(e){
				console.log("Error parsing" +e);
				return false;
			}
        	} 

		//console.dir(xmlDoc);
		processNode(xmlDoc.documentElement);
		
		if(resp){
			console.log("Validation Successful");
			RED.notify("<strong>XML validation</strong>: SUCCESS","success");
		}else{
			console.log("Errors found. ");
			RED.notify("<strong>XML validation</strong>: FAILED","error");
		}
	}catch(e){
		console.log("error:" +e);
		RED.notify("<strong>XML validation</strong>: FAILED","error");
		resp=false;
		return resp;
	}
	return resp;
}

function validateXML(xmlStr){

	//console.dir(RED);
	processedNode="";
	resp=true;
	errList=[];
	elementCount=0;
	//console.log("In validateXML xmlStr:" + xmlStr);
        //var xmlStr = $("#node-input-xml-editor").text();
	if(xmlStr == null || xmlStr == undefined){
        	xmlStr = $("#node-input-xml-editor").text();
	}
	if(xmlStr == undefined) return false;
	//console.dir($("#node-input-xml-editor"));
	//console.log("xmlStr:" +  xmlStr);
	xmlStr = xmlStr.trim();
	var startTag ;
	var endTag ;
	try{
		var re = /^[0-9]+/;
		xmlStr = xmlStr.replace(re,'');
		var regex = /(<)([\w-]+)(.*)?/;
		var match = regex.exec(xmlStr);
		if(match != null){
			if(match[1] != undefined && match[2] != undefined){ 
	   			startTag = match[2];
			}
		}else{
			resp=false;
			showMsg("startTag not found.","red");
			return resp;
		}
	}catch(e){
		console.log(e);
		return false;
	}
	//console.log(xmlStr);	
	if(xmlStr == ""){
		resp=false;
		showMsg("XML not found","red");
		return resp;
	}
	endTag = "</" + startTag + ">";

	if(xmlStr.indexOf(endTag) != -1){
		resp=false;
		showMsg("Error: End tag &lt;/" + startTag + "&gt; must not be included.","red");
		console.log("End tag " + endTag + " must not be included.");
		return resp;
	}
	try{
		//var xmlTopStr = "<?xml version='1.0' encoding='UTF-8'?>\n" ;
		//xmlStr = xmlTopStr + xmlStr;
		//xmlStr = xmlStr.replace(/'/g,"\"");
		xmlStr+= "\n" +  endTag;
		xmlStr = xmlStr.trim();
		//console.log("xmlStr:" + xmlStr);
		var xmlDoc;
         	if (window.DOMParser){
			try{
            			var parser=new DOMParser();
            			xmlDoc=parser.parseFromString(xmlStr,'text/xml');
				//console.log("Not IE");
				var n = xmlDoc.documentElement.nodeName;
				if(n == "html"){
					resp=false;
					showMsg("Error parsing","red");
					console.log("Error parsing");
					return resp;
				}
			}catch(e){
				console.log("Error parsing" +e);
				return false;
			}
         	}else{ 
			try{
				//console.log("IE");
	    			// code for IE
            			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            			xmlDoc.async=false;
            			xmlDoc.loadXMLString(xmlStr); 
			}catch(e){
				console.log("Error parsing" +e);
				return false;
			}
        	} 

		//console.dir(xmlDoc);
		processNode(xmlDoc.documentElement);
		if(resp){
			showMsg("Validation Successful","green");
		}else{
			showMsg("Errors found. <a onclick='javascript:showErrors()'>show errors</a>","red");
			console.log("Errors found. ");
		}
	}catch(e){
		console.log("error:" +e);
		showMsg(e,"red");
		resp=false;
		return resp;
	}
	return resp;
}

function showErrors() {
                //var sourceField = event != null ?event.srcElement:event.target;
                //console.dir(sourceField);
                //sourceField.style.backgroundColor="skyblue";
                //var leftVal = event.target.offsetLeft  ; 
                //alert(topVal + ":" + leftVal);
                /*left:leftVal,*/
                //var pos = event.target;
                //var topVal = event.target.offsetTop + topPosition ;
                //var topVal = event.target.offsetTop +75;
		var htmlStr="<div id='error-list-div'><table id='errTable' border='1'><tr><th>Error List</th></tr>";	
		for(var i=0;errList != null && i<errList.length;i++){
			var errSeq = i+1;
			htmlStr += "<tr><td>" + errSeq + ")"  + errList[i] + "</td></tr>"; 
		}
		htmlStr += "</table></div>";
		//var prevHtml = $("#tab-info").html();
		//htmlStr += "<input type='button' value='Hide Errors' onclick=\"closeShowErrors('" + prevHtml + "')\" >";
                //$('#show-errors-div').html(htmlStr);
		//$("#tab-info").html(prevHtml + htmlStr);

		//$('<div></div>').dialog({
		$('#show-errors-dialog').dialog({
                              modal: true,
                              title: "XML Error List ",
                              width: 500,
                              open: function () {
                                $(this).html(htmlStr);
                              },
                              buttons: {
                                Close: function () {
                                  $(this).dialog("close");
                                }
                              }
                            }); // end dialog div
}
