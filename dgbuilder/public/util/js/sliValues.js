var global_editor ; 
function addParam(idVal){
	//console.log(val);
	//console.log(global_editor.getText());
	if(global_added_obj["a" + idVal] != undefined &&  global_added_obj["a" + idVal] != null){
		global_added_obj["a" + idVal]= global_added_obj["a" + idVal]+1;
		$("#addCnt" +  + idVal).text("added " + global_added_obj["a" + idVal] + " times");
	}else{
		global_added_obj["a" + idVal]= 1;
		$("#addCnt" +  + idVal).text("added " + global_added_obj["a" + idVal] + " time");
	}
	var nameVal = document.getElementById("a" + idVal).value;
	var valueBoxVal = document.getElementById("valbox" + idVal).value;
	//$("#btn" + idVal).val('Added');
	//$("#btn" + idVal).attr('disabled','disabled'); 
	//console.dir(nameVal);
	//console.dir(valueBoxVal);


	var paramElement = "<parameter name='" + nameVal + "' value='" + valueBoxVal + "'/>\n";
	global_editor.setText(global_editor.getText() + paramElement);
}

var g_currValuesObj={};

function filterValues(filterVal){
	global_added_obj={};
	var matchedCnt =0;
	var valuesObj = g_currValuesObj;
	var newValuesObj ={};
	var searchValues =[];
	if(filterVal != null && filterVal != undefined){
		filterVal=filterVal.trim();
	}	
	searchValues = filterVal.split(/ /);
	//console.log("filterVal:" + filterVal);
	if(searchValues != null && searchValues != undefined){	
        	for (var key in valuesObj) {
             		if (valuesObj.hasOwnProperty(key)) {
				var newArrObj = [];
                   		if(Array.isArray(valuesObj[key])){
                      			var arrObj=valuesObj[key];
					var cnt=1;
                      			for(var i=0;i<arrObj.length;i++){
						var foundCount = 0;
						for(var k=0;k<searchValues.length;k++){
							if(arrObj[i].indexOf(searchValues[k]) != -1){
								foundCount++;
							}
						}
						if(foundCount == searchValues.length){
							matchedCnt++;
							newArrObj.push(arrObj[i]);
						}
		      			}	
					newValuesObj[key] =  newArrObj;
		   		}		
			}
		}
		$("#matchedCntId").html(matchedCnt);
	}else{
		newValuesObj = valuesObj;
	}
	var valuesHtml=buildValuesHtml(newValuesObj);	
        valuesHtml+="</div>";
	$("#sli-values-div").html(valuesHtml);
}

function buildValuesHtml(valuesObj){
	var idCounter=0;
	var htmlVal = "";
	
        for (var key in valuesObj) {
             if (valuesObj.hasOwnProperty(key)) {
                   var v = "<div style='font-weight:bold;font-size:1.0em;'><label>" + key + "<b/label>";
                   if(Array.isArray(valuesObj[key])){
                      var arrObj=valuesObj[key];
			var cnt=1;
                      for(var i=0;i<arrObj.length;i++){
				var idVal = idCounter++;
			 var addBtn = "<input id='btn" + idVal + "' type='button' style='background-color:#D6EBFF;' value='Add as Parameter'" + "onclick='addParam(\"" + idVal + "\")'><div style='float:right' id='addCnt" + idVal + "'></div>";
			var variableBox = "";
			var valBox = "<input id='valbox" + idVal + "' type='text' style='width:500px;height:30px;' value=''>";
			if(arrObj[i] != undefined && arrObj[i].length <150){
                         	//v += "<div style='width:1150px;background:aliceblue;border-color:aliceblue' class='valueBoxDiv' id='valueBoxDiv" + idVal +  "'>"  + "<input style='width:1125px;background:rgb(223, 191, 191);color:rgb(32, 45, 87);' type='text' readonly='1'  id='a" + idVal + "' onclick='selectText(\"" + idVal+"\",\"" + key + "\")' value='" +arrObj[i] + "' title='" + arrObj[i] + "' >" ;
                         	v += "<div style='width:1150px;background:aliceblue;border-color:aliceblue' class='valueBoxDiv' id='valueBoxDiv" + idVal +  "'>"  + "<input style='width:1125px;background:aliceblue;color:rgb(32, 45, 87);' type='text' readonly='1'  id='a" + idVal + "' onclick='selectText(\"" + idVal+"\",\"" + key + "\")' value='" +arrObj[i] + "' title='" + arrObj[i] + "' >" ;
				variableBox = "<input style='width:1125px' id='variableBox" + idVal + "' type='text' value='`$" + arrObj[i] + "`'>";
			}else{
                         	v+= "<div style='width:1150px;background:aliceblue;border-color:aliceblue' class='valueBoxDiv' id='valueBoxDiv" + idVal +  "'>"  + "<textarea style='width:1125px;background:aliceblue;color:rgb(32, 45, 87);' readonly='1'  id='a" + idVal + "' onclick='selectText(\"" + idVal+"\",\"" + key + "\")' title='" + arrObj[i] + "' >"  + arrObj[i] + "</textarea>";
				variableBox = "<textarea style='width:1125px' id='variableBox" + idVal + "' >`$" + arrObj[i] + "`'</textarea>";
			}
			  v += "<div id='valAddDiv" +  idVal + "' style='display:none;'>" +  valBox + "&nbsp;&nbsp;" + addBtn + "</div>" +
		           "<div id='variableBoxDiv" + idVal + "' style='display:none;color:rgb(32, 45, 87);'>Display as a variable<br>" + variableBox + "</div>" + "</div>";
			cnt++;
                      }
                      htmlVal+= v + "</div>";
                                }
                   }
             }
	return htmlVal;
}

function getModuleName(){
	var activeWorkspace=RED.view.getWorkspace();
	var moduleName="";
	RED.nodes.eachNode(function(n) {
		if (n.z == activeWorkspace) {
			if(n.type == 'service-logic'){
				//console.log("getModuleName():<" + n.module + ">");
				moduleName=n.module;
			}
               	}
       	});
	return moduleName;
}
var global_added_obj={};
var displayingRpcs = false;
function showRpcsValuesBox(editor,valuesObj){
	displayingRpcs = true;
	showValuesBox(editor,valuesObj);
}

function showValuesBox(editor,valuesObj){
	var moduleName = getModuleName();	
	var obj = valuesObj[moduleName];
	//console.dir(valuesObj);
	//console.dir(obj);
	var moduleObj ={};
	if(obj == undefined){
		moduleObj[moduleName] = ["No SLI values setup for this module " + moduleName + ".Upload the yang file for this module or if already uploaded ,load it from the Available Modules from the Menu."];	
	}else{
		moduleObj[moduleName] = obj;
	}
	showValuesBoxForModule(editor,moduleObj,moduleName);	
}

function showValuesBoxForModule(editor,valuesObj,moduleName){
	global_editor=editor;
	g_currValuesObj = valuesObj;
	//console.log(editor.getText());
	//populate the valid SLI values
	var valuesHtml="<style>.color-dialog {background:aliceblue;border-color:lightgrey;border-width:3px;border-style:solid; }</style><div style='float:left;width:1200px;background:aliceblue'><input style='width:1125px' id='filter-id' type='text' value='' placeholder='To filter the values type words seperated by space in this box' onkeyup='filterValues(this.value)'></div><div style='float:left;color:green;font-size:0.8em' id='matchedCntId'></div><div style='clear:both'></div><div id='sli-values-div' style='width:1200px;'>" ;
	valuesHtml+=buildValuesHtml(valuesObj);	
       valuesHtml+="</div>";
	global_added_obj={};

	
 var title = "SLI Values for Module " + moduleName;	
	if(displayingRpcs){
		title = "RPCs for Module " + moduleName;
	}
	$('#sli-values-dialog').dialog({
                       modal: false,
                       title: title,
                       width: 1200,
		       height: 500,
		       dialogClass: 'color-dialog',
                       open: function () {
				$("#sli-values-dialog").dialog("widget").find(".ui-dialog-buttonpane").css({'background': 'aliceblue'});
                                $(this).html(valuesHtml);
                       },
                       buttons: {
                           Close: function () {
				displayingRpcs = false;
                              //$(this).dialog("close");
                              $(this).dialog("destroy");
                           }
                       },
			close: function(ev,ui){
				displayingRpcs = false;
				$(this).dialog("destroy");
			}
        }); // end dialog div
}

function showCommentsBox(){
	var comments = $("#node-input-comments").val();
	var commentsBoxHtml="<div><textarea style='font-size:18px;height:150px;width:390px;' id='taCommentId'>" + comments + "</textarea></div>" ;

	var nodeName=$("#node-input-name").val();
	$('#comments-dialog').dialog({
                       modal: true,
                       title: "Add comments for Node " + nodeName,
                       width: 450,
		       height: 300,	
			/*	
                       open: function () {
                                $(this).html(commentsBoxHtml);
                       },
			*/
                       buttons: {
                           "Save Comments": function () {
				var v=$("#taCommentId").val();
				if(v != null){
					v = v.trim();
					if(v != ''){
						$("#node-input-btnComments").html("<span style='color:blue;'><b>View Comments</b></span>");
					}else{
						$("#node-input-btnComments").html("<b>Add Comments</b>");
					}
				}
				//console.log("value from text area" + v);
				$("#node-input-comments").val(v);
				$(this).dialog("close");
                              //$(this).dialog("destroy");
                           },
                           Cancel: function () {
				var v=$("#taCommentId").val();
				if(v != null){
					v = v.trim();
					if(v != ''){
						$("#node-input-btnComments").html("<span style='color:blue;'><b>View Comments</b></span>");
					}else{
						$("#node-input-btnComments").html("<b>Add Comments</b>");
					}
				}
				$(this).dialog("close");
                              //$(this).dialog("destroy");
                           }
                       },
			close: function(ev,ui){
				//console.log("closing..");
				$(this).dialog("destroy");
			}
        }).html(commentsBoxHtml);

	//console.log("done");
/*	
	function functionDialogResize(ev,ui) {
		console.log("ui.size.height:" + ui.size.height);
                $(this).css("height",(ui.size.height-275)+"px");
        };

        $( this ).on("dialogresize", functionDialogResize);


	$( this ).one("dialogopen", function(ev) {
                var size = $( "#sliValDiv" ).dialog('option','sizeCache-function');
                if (size) {
                    functionDialogResize(null,{size:size});
                }
         });
*/

}

function selectText(objId,groupVal){
	//console.log(objId + groupVal);	
	//console.log(objId + groupVal);	
	$(document).ready(function(){
		//console.log("doc ready");
		//console.dir($('#valAddDiv' +  objId));
		if ($('#valAddDiv' +  objId).is(":visible")) {
			$("#variableBoxDiv" +  objId ).hide("slow");
			//$("#a" +  objId ).css({"background": "rgb(223, 191, 191)",
			//			"color": "rgb(32, 45, 87)"});
			$("#a" +  objId ).css({"background": "aliceblue",
						"color": "rgb(32, 45, 87)"});
						/*"color": "rgb(32, 45, 87)"});*/
			$("#valAddDiv" +  objId ).hide("slow");
			$("#valueBoxDiv" +objId).css({"border-color": "aliceblue",
             						"border-width":"1px", 
             						"background-color":"aliceblue",
             						"border-style":"solid"});
			//$("#valAddDiv" +  objId ).fadeOut("slow");
    		} else{
			$("#variableBoxDiv" +  objId ).show("slow");
			$("#valAddDiv" +  objId).show("slow");
			/*$("#valueBoxDiv" +objId).css({"border-color": "rgb(75, 111, 147)",
             						"border-width":"5px", 
             						"background-color": "rgb(223, 191, 191)",
             						"border-style":"solid",
							"border-bottom": "5px solid rgb(75, 111, 147)"});
			*/
			$("#valueBoxDiv" +objId).css({"border-color": "rgb(75, 111, 147)",
             						"border-width":"3px", 
             						"background-color": "aliceblue",
             						"border-style":"solid",
							"border-bottom": "3px solid rgb(75, 111, 147)"});
			/*$("#a" +  objId ).css({"background": "rgb(223, 191, 191)",
						"color": "rgb(75, 111, 147)"});
			*/
			$("#a" +  objId ).css({"background": "aliceblue",
						"color": "rgb(75, 111, 147)"});
    		}
		$("#a" +  objId).select();
	});
	//console.log("group-heading" + objId);
//	var obj= document.getElementById("group-heading" +  objId);
//	obj.innerText = groupVal;
//	obj.style.color = "blue";
//	console.dir(obj);
}

function hidePrevGroup(objId){
//	console.log("mouseout" );
//	var obj= document.getElementById("group-heading" +  objId);
//	obj.innerText = "";
}
/*
function fixDiv() {
    var $cache = $('#getFixed');
    if ($(window).scrollTop() > 100)
      $cache.css({
        'position': 'fixed',
        'top': '10px'
      });
    else
      $cache.css({
        'position': 'relative',
        'top': 'auto'
      });
 }

$(window).scroll(fixDiv);

function isScrolledIntoView(elem)
{
    var $elem = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
*/

function getCommits(filePath){
var urlPath="/getCommitsInfo";
$.get(urlPath,{"filePath" : filePath })
	.done(function( data ) {
		if(data != undefined && data != null){
			//console.log(data.stdout);
			var jsonObj = JSON.parse(data.stdout);
			var codeCloudFilesHtmlStr = $( "#codecloud-browser-dialog" ).html();
			var htmlStr = getCCFileHtmlStr(filePath,jsonObj,codeCloudFilesHtmlStr);
			$( "#codecloud-browser-dialog" ).html(htmlStr);
			/*
			for(var i=0;i<jsonObj.length;i++){
				console.log("commit:" + jsonObj[i].commit);	
				console.log("date:" + jsonObj[i].date);	
				console.log("author:" + jsonObj[i].author);	
				console.log("comment:" + jsonObj[i].comment);	
			}
			*/
		}
	})
	.fail(function(err) {
	})
	.always(function() {
	});
}


function getCCFileHtmlStr(filePath,rows,codeCloudFilesHtmlStr){
	var styleStr = "<style> " + 
			"table#cct01 { width:100%; } \n" +
				"table#cct01 th,table#cct01 td { border: 1px solid black; border-collapse: collapse; } \n" +
				"table#cct01 th,table#cct01 td { padding: 5px; text-align: left; } \n" +
				"table#cct01 tr:nth-child(even) { background-color: #eee; }\n" +
				"table#cct01 tr:nth-child(odd) { background-color:#fff; }\n" +
				"table#cct01 th	{ background-color: #65a9d7; color: white; }\n" +
				"table#cct01 a { color: #337ab7; }\n" +
				"table#cct01 a:link { color: #65a9d7; }\n" +
				"table#cct01 a:visited { color: #636; }\n" + 
				"table#cct01 a:hover { color: #3366CC; cursor: pointer }\n" + 
				"table#cct01 a:active { color: #65a9d7 }\n" +
				"table#cct01 caption { display: table-caption; text-align: center;  background: #eee; font-weight: bold; font-size: 1.1em; border: 1px solid black; }\n" + 
				"</style>";
			var htmlStr="";
			//console.dir(rows);	
			if(rows != null && rows.length >0){
				var alertDialog = '<div id="ccAlertdialog"></div>';
				htmlStr= alertDialog +  "<div style='width:1050;height:650'>" + styleStr;
				htmlStr += "<table id='cct01' >";
				htmlStr += "<caption id='ccCaptionId'>" + filePath + "</caption>";
				htmlStr += "<tr>";
				htmlStr += "<th>Commit ID</th>" ;
				htmlStr += "<th>Date</th>" ;
				htmlStr += "<th>Author</th>" ;
				htmlStr += "<th>Comment</th>" ;
				htmlStr += "</tr>";
				if(rows != null && rows.length == 0){
					htmlStr += "<tr>";
					htmlStr += "<td><b>No rows found</b></td>";
					htmlStr += "</tr></table></div>";
					return htmlStr;
				}
				for(var i=0;i<rows.length;i++){
					var row = rows[i];
					var _commitId = row.commit;
					var dt = row.date;
					var author = row.author;
					var comment = row.comment;
					htmlStr += "<tr>";
					htmlStr += "<td><a onclick=\"javascript:importCCFlow('" + _commitId + "','" + filePath + "')\">" + _commitId + "</a></td>";
					htmlStr += "<td>" + dt + "</td>";
					htmlStr += "<td>" + author + "</td>";
					htmlStr += "<td>" + comment + "</td>"; 
					htmlStr += "</tr>";
				}
				htmlStr += "</table>";
				htmlStr += "</div>";
			}
	//console.log(htmlStr);
	return htmlStr;
}


var gitLocalFlowFiles=[];
function filterGitLocalFlows(filterVal){
	
	var matchedCnt =0;
	var valuesObj = gitLocalFlowFiles;
	//console.dir(codeCloudFlowFiles);
	var updatedValuesObj =[];
	var searchValues =[];
	if(filterVal != null && filterVal != undefined){
		filterVal=filterVal.trim();
	}	
	searchValues = filterVal.split(/ /);
	//console.log("filterVal:" + filterVal);
	//console.dir(searchValues);
	if(searchValues != null && searchValues != undefined){	
		var foundCount = 0;
		for(var k=0;k<searchValues.length;k++){
			if(foundCount >0){
				valuesObj=updatedValuesObj;
			}
			updatedValuesObj=[];
			for(var i=0;i<valuesObj.length;i++){
				var patt = new RegExp(searchValues[k],"gi");
				if(patt.test(valuesObj[i])){
					foundCount++;
					updatedValuesObj.push(valuesObj[i]);
				}
			}
		}
	}else{
		updatedValuesObj = valuesObj;
	}
	//console.dir(updatedValuesObj);
	var html="<ul>";
	if(updatedValuesObj != null){
		var files=updatedValuesObj;
		//console.dir(files);
		files.sort(function (a,b){
			if(a > b){
				return 1;
			}else if(a <  b){
				return -1;
			}else{	
				return 0;
			}
		});
		for(var i=0;files != null && i<files.length;i++){
			html+="<li><a href=\"#\" onclick=\"importGitLocalFlow('" + files[i] + "')\">" + files[i] + "</a></li>";
		}
	}
					html+="</ul>";
					html+="</div>";
    	$( "#gitlocal-data-container" ).html(html);
}

var codeCloudFlowFiles=[];
function filterFlows(filterVal){
	
	var matchedCnt =0;
	var valuesObj = codeCloudFlowFiles;
	//console.dir(codeCloudFlowFiles);
	var updatedValuesObj =[];
	var searchValues =[];
	if(filterVal != null && filterVal != undefined){
		filterVal=filterVal.trim();
	}	
	searchValues = filterVal.split(/ /);
	//console.log("filterVal:" + filterVal);
	//console.dir(searchValues);
	if(searchValues != null && searchValues != undefined){	
		var foundCount = 0;
		for(var k=0;k<searchValues.length;k++){
			for(var i=0;i<valuesObj.length;i++){
				var patt = new RegExp(searchValues[k],"gi");
				if(patt.test(valuesObj[i])){
					foundCount++;
					updatedValuesObj.push(valuesObj[i]);
				}
			}
		}
	}else{
		updatedValuesObj = valuesObj;
	}
	//console.dir(updatedValuesObj);
	var html="<ul>";
	if(updatedValuesObj != null){
		var files=updatedValuesObj;
		//console.dir(files);
		files.sort(function (a,b){
			if(a > b){
				return 1;
			}else if(a <  b){
				return -1;
			}else{	
				return 0;
			}
		});
		for(var i=0;files != null && i<files.length;i++){
			html+="<li><a href=\"#\" onclick=\"getCommits('" + files[i] + "')\">" + files[i] + "</a></li>";
		}
	}
					html+="</ul>";
					html+="</div>";
    	$( "#codecloud-data-container" ).html(html);
}

var yangFilesList=[];
/*
function filterYangFiles(filterVal){
	
	var matchedCnt =0;
	var valuesObj = yangFilesList;
	var updatedValuesObj =[];
	var searchValues =[];
	if(filterVal != null && filterVal != undefined){
		filterVal=filterVal.trim();
	}	
	searchValues = filterVal.split(/ /);
	if(searchValues != null && searchValues != undefined){	
		var foundCount = 0;
		for(var k=0;k<searchValues.length;k++){
			for(var i=0;i<valuesObj.length;i++){
				var patt = new RegExp(searchValues[k],"gi");
				if(patt.test(valuesObj[i])){
					foundCount++;
					updatedValuesObj.push(valuesObj[i]);
				}
			}
		}
	}else{
		updatedValuesObj = valuesObj;
	}
	//console.dir(updatedValuesObj);
	var html="<ul>";
	if(updatedValuesObj != null){
		var files=updatedValuesObj;
		//console.dir(files);
		files.sort(function (a,b){
			if(a > b){
				return 1;
			}else if(a <  b){
				return -1;
			}else{	
				return 0;
			}
		});
		for(var i=0;files != null && i<files.length;i++){
			html+="<li><a href=\"#\" onclick=\"getYangFile('" + files[i] + "')\">" + files[i] + "</a></li>";
		}
	}
					html+="</ul>";
					html+="</div>";
    	$( "#list-yang-data-container" ).html(html);
}
*/

function filterYangFiles(filterVal){
	var matchedCnt =0;
	var valuesObj = yangFilesList;
	var updatedValuesObj =[];
	var searchValues =[];
	if(filterVal != null && filterVal != undefined){
		filterVal=filterVal.trim();
	}	
	searchValues = filterVal.split(/ /);
	if(searchValues != null && searchValues != undefined){	
		var foundCount = 0;
		for(var k=0;k<searchValues.length;k++){
			for(var i=0;i<valuesObj.length;i++){
				var patt = new RegExp(searchValues[k],"gi");
				if(patt.test(valuesObj[i])){
					foundCount++;
					updatedValuesObj.push(valuesObj[i]);
				}
			}
		}
	}else{
		updatedValuesObj = valuesObj;
	}
	//console.dir(updatedValuesObj);
	var html="<table id='yang-file-list-table'  border=1>";
            html+="<tr>";
            html+="<th>File</th>";
            html+="<th>Delete</th>";
            html+="</tr>";
	
	if(updatedValuesObj != null){
		var files=updatedValuesObj;
		//console.dir(files);
		files.sort(function (a,b){
			if(a > b){
				return 1;
			}else if(a <  b){
				return -1;
			}else{	
				return 0;
			}
		});
		for(var i=0;files != null && i<files.length;i++){
			 html+="<tr><td><a href=\"#\" onclick=\"getYangFile('" + files[i] + "')\">" + files[i] + "</a></td><td>" + "<input type='button'  onclick='deleteYangFile(\"" + files[i]  + "\")' value='Delete'></td></td></td></tr>";
		}
	}
	html+="</table>";
        html+="</div>";

    	$( "#yang-files-data-container" ).html(html);
}

function getYangFile(fileName){
	$("#dwnldYangFormId").remove();
        //using form to submit
        var form = $('<form id="dwnldYangFormId" method="POST" action="/downloadYang"></form>');
        form.append('<input type="hidden" name="fileName" value="' + fileName + '"/>');
        form.appendTo('body');
        $("#dwnldYangFormId").submit();

}
function deleteYangFile(fileName){
	var reqData= {"fileName":fileName};
	 $.post( "/deleteYangFile",reqData )
                      .done(function( data ) {
                      })
                      .fail(function(err) {
                          console.log( "error" + err );
                       })
                       .always(function() {
                              $("#list-yang-browser-dialog").dialog("close");
				$("#btn-list-yang-files").trigger("click");
                       });
}

function importCCFlow(commitId,filePath){
var urlPath="/importCodeCloudFlow";
$.get(urlPath,{"commitId" : commitId,"filePath" : filePath })
	.done(function( data ) {
		if(data != undefined && data != null){
			//console.log(data.stdout);
			var jsonObj = JSON.parse(data.stdout);
			$( "#codecloud-browser-dialog" ).dialog("close");
			RED.view.importNodes(JSON.stringify(jsonObj));
		}
	})
	.fail(function(err) {
		RED.notify("Could not import flow from code cloud.");	
		$( "#codecloud-browser-dialog").dialog("close");
     		console.log( "error occured importing flow.");
	})
	.always(function() {
	});
}

function importGitLocalFlow(filePath){
var urlPath="/importGitLocalFlow";
$.get(urlPath,{"filePath" : filePath })
	.done(function( data ) {
		if(data != undefined && data != null){
			//console.log(data.stdout);
			var jsonObj;
			try{
				jsonObj = JSON.parse(data.stdout);
				$( "#gitlocal-browser-dialog" ).dialog("close");
				RED.view.importNodes(JSON.stringify(jsonObj));
			}catch(err){
				RED.notify("Could not import flow from Local Git Repository.");	
				$( "#gitlocal-browser-dialog").dialog("close");
     				console.log( "error occured importing flow." + err);
			}
		}else{
			RED.notify("Could not import flow from Local Git Repository.");	
			$( "#gitlocal-browser-dialog").dialog("close");
     			console.log( "error occured importing flow." + err);
		}
	})
	.fail(function(err) {
		RED.notify("Could not import flow from Local Git Repository.");	
		$( "#gitlocal-browser-dialog").dialog("close");
     		console.log( "error occured importing flow.");
	})
	.always(function() {
	});
}

var availableYangModules=[];
function filterYangModules(filterVal){
	
	var matchedCnt =0;
	var valuesObj = availableYangModules ;
	//console.dir(codeCloudFlowFiles);
	var updatedValuesObj =[];
	var searchValues =[];
	if(filterVal != null && filterVal != undefined){
		filterVal=filterVal.trim();
	}	
	searchValues = filterVal.split(/ /);
	//console.log("filterVal:" + filterVal);
	//console.dir(searchValues);
	if(searchValues != null && searchValues != undefined){	
		var foundCount = 0;
		for(var k=0;k<searchValues.length;k++){
			if(foundCount >0){
				valuesObj=updatedValuesObj;
			}
			updatedValuesObj=[];
			for(var i=0;i<valuesObj.length;i++){
				var patt = new RegExp(searchValues[k],"gi");
				if(patt.test(valuesObj[i])){
					foundCount++;
					updatedValuesObj.push(valuesObj[i]);
				}
			}
		}
	}else{
		updatedValuesObj = valuesObj;
	}
	//console.dir(updatedValuesObj);
	var html="";
	html+="<table border=1>";
        html+="<tr>";
        html+="<th>#</th>";
        html+="<th>Load</th>";
        html+="<th>Module</th>";
        html+="</tr>";

	if(updatedValuesObj != null){
		var files=updatedValuesObj;
		//console.dir(files);
		files.sort(function (a,b){
			if(a > b){
				return 1;
			}else if(a <  b){
				return -1;
			}else{	
				return 0;
			}
		});
		var count=1;
		for(var i=0;files != null && i<files.length;i++){
			var val = files[i].replace(/:.*/,"");
			if(files[i].indexOf(":checked") != -1){
                          	html+="<tr><td>" + count +  "</td><td><input type='checkbox' checked value='" + val + "'></td><td>" + val + "</td></tr>";
                        }else{
                                html+="<tr><td>" + count +   "</td><td><input type='checkbox' value='" + val + "'></td><td>" + val + "</td></tr>";
                        }
			count++;
		}
	}
	html+="</table>";
	html+="</div>";
    	$( "#yang-modules-data-container" ).html(html);
}
