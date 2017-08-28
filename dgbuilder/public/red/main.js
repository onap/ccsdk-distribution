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
var RED = (function() {

    function hideDropTarget() {
        $("#dropTarget").hide();
        RED.keyboard.remove(/* ESCAPE */ 27);
    }

    $('#chart').on("dragenter",function(event) {
        if ($.inArray("text/plain",event.originalEvent.dataTransfer.types) != -1) {
            $("#dropTarget").css({display:'table'});
            RED.keyboard.add(/* ESCAPE */ 27,hideDropTarget);
        }
    });

    $('#dropTarget').on("dragover",function(event) {
        if ($.inArray("text/plain",event.originalEvent.dataTransfer.types) != -1) {
            event.preventDefault();
        }
    })
    .on("dragleave",function(event) {
        hideDropTarget();
    })
    .on("drop",function(event) {
        var data = event.originalEvent.dataTransfer.getData("text/plain");
        hideDropTarget();
        RED.view.importNodes(data);
        event.preventDefault();
    });


    function save(force) {
        if (RED.view.dirty()) {
            //$("#debug-tab-clear").click();  // uncomment this to auto clear debug on deploy

            if (!force) {
                var invalid = false;
                var unknownNodes = [];
                RED.nodes.eachNode(function(node) {
                    invalid = invalid || !node.valid;
                    if (node.type === "unknown") {
                        if (unknownNodes.indexOf(node.name) == -1) {
                            unknownNodes.push(node.name);
                        }
                        invalid = true;
                    }
                });
                if (invalid) {
                    if (unknownNodes.length > 0) {
                        $( "#node-dialog-confirm-deploy-config" ).hide();
                        $( "#node-dialog-confirm-deploy-unknown" ).show();
                        var list = "<li>"+unknownNodes.join("</li><li>")+"</li>";
                        $( "#node-dialog-confirm-deploy-unknown-list" ).html(list);
                    } else {
                        $( "#node-dialog-confirm-deploy-config" ).show();
                        $( "#node-dialog-confirm-deploy-unknown" ).hide();
                    }
                    $( "#node-dialog-confirm-deploy" ).dialog( "open" );
                    return;
                }
            }
            var nns = RED.nodes.createCompleteNodeSet();
	    /****************************************/
	    /*added new code to save the Tabs order */
	    /****************************************/ 
	    //console.log("nns before changes.");
	    //console.dir(nns);
            var allTabsObj={};
            var allTabsList=[];
            var nnsTabIdsArr = [];
            var guiTabIdsArr = [];
            nns.forEach(function(n) {
                	if(n.type == 'tab'){
				allTabsObj[n.id] = n;
				allTabsList.push(n);
				nnsTabIdsArr.push(n.id);
			}
	    });
	    var idx =0;	
	    $("#workspace-tabs li a").each(function(){
		var href = $(this).prop("href");
		var indexOfHash = href.indexOf("#");
		var idVal = href.slice(indexOfHash+1);
		guiTabIdsArr.push(idVal);
		nns.splice(idx,1,allTabsObj[idVal]);;
		idx++;
	    });	
	    //console.log(nnsTabIdsArr.join(","));	
	    //console.log(guiTabIdsArr.join(","));	
	    //console.log("nns after changes.");
	    //console.dir(nns);
	    /****************************/ 
            $("#btn-icn-deploy").removeClass('fa-download');
            $("#btn-icn-deploy").addClass('spinner');
            RED.view.dirty(false);

            $.ajax({
                url:"flows",
                type: "POST",
                data: JSON.stringify(nns),
                contentType: "application/json; charset=utf-8"
            }).done(function(data,textStatus,xhr) {
                RED.notify("Successfully saved","success");
                RED.nodes.eachNode(function(node) {
                    if (node.changed) {
                        node.dirty = true;
                        node.changed = false;
                    }
                    if(node.credentials) {
                        delete node.credentials;
                    }
                });
                RED.nodes.eachConfig(function (confNode) {
                    if (confNode.credentials) {
                        delete confNode.credentials;
                    }
                });
                // Once deployed, cannot undo back to a clean state
                RED.history.markAllDirty();
                RED.view.redraw();
            }).fail(function(xhr,textStatus,err) {
                RED.view.dirty(true);
                if (xhr.responseText) {
                    RED.notify("<strong>Error</strong>: "+xhr.responseText,"error");
                } else {
                    RED.notify("<strong>Error</strong>: no response from server","error");
                }
            }).always(function() {
                $("#btn-icn-deploy").removeClass('spinner');
                $("#btn-icn-deploy").addClass('fa-download');
            });
        }
    }

    $('#btn-deploy').click(function() { save(); });

    $( "#node-dialog-confirm-deploy" ).dialog({
            title: "Confirm deploy",
            modal: true,
            autoOpen: false,
            width: 530,
            height: 230,
            buttons: [
                {
                    text: "Confirm deploy",
                    click: function() {
                        save(true);
                        $( this ).dialog( "close" );
                    }
                },
                {
                    text: "Cancel",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
    });

    function loadSettings() {
        $.get('settings', function(data) {
            RED.settings = data;
            console.log("Node-RED: "+data.version);
            loadNodeList();
        });
    }

    function loadNodeList() {
        $.ajax({
            headers: {
                "Accept":"application/json"
            },
            cache: false,
            url: 'nodes',
            success: function(data) {
                RED.nodes.setNodeList(data);
                loadNodes();
            }
        });
    }

    function loadNodes() {
        $.ajax({
            headers: {
                "Accept":"text/html"
            },
            cache: false,
            url: 'nodes',
            success: function(data) {
                $("body").append(data);
                $(".palette-spinner").hide();
                $(".palette-scroll").show();
                $("#palette-search").show();
                loadFlows();
            }
        });
    }

    function loadFlows() {
        $.ajax({
            headers: {
                "Accept":"application/json"
            },
            cache: false,
            url: 'flows',
            success: function(nodes) {
                RED.nodes.import(nodes);
                RED.view.dirty(false);
                RED.view.redraw();
                RED.comms.subscribe("status/#",function(topic,msg) {
                    var parts = topic.split("/");
                    var node = RED.nodes.node(parts[1]);
                    if (node) {
                        node.status = msg;
                        if (statusEnabled) {
                            node.dirty = true;
                            RED.view.redraw();
                        }
                    }
                });
                RED.comms.subscribe("node/#",function(topic,msg) {
                    var i,m;
                    var typeList;
                    var info;
                    
                    if (topic == "node/added") {
                        var addedTypes = [];
                        for (i=0;i<msg.length;i++) {
                            m = msg[i];
                            var id = m.id;
                            RED.nodes.addNodeSet(m);
                            if (m.loaded) {
                                addedTypes = addedTypes.concat(m.types);
                                $.get('nodes/'+id, function(data) {
                                    $("body").append(data);
                                });
                            }
                        }
                        if (addedTypes.length) {
                            typeList = "<ul><li>"+addedTypes.join("</li><li>")+"</li></ul>";
                            RED.notify("Node"+(addedTypes.length!=1 ? "s":"")+" added to palette:"+typeList,"success");
                        }
                    } else if (topic == "node/removed") {
                        for (i=0;i<msg.length;i++) {
                            m = msg[i];
                            info = RED.nodes.removeNodeSet(m.id);
                            if (info.added) {
                                typeList = "<ul><li>"+m.types.join("</li><li>")+"</li></ul>";
                                RED.notify("Node"+(m.types.length!=1 ? "s":"")+" removed from palette:"+typeList,"success");
                            }
                        }
                    } else if (topic == "node/enabled") {
                        if (msg.types) {
                            info = RED.nodes.getNodeSet(msg.id);
                            if (info.added) {
                                RED.nodes.enableNodeSet(msg.id);
                                typeList = "<ul><li>"+msg.types.join("</li><li>")+"</li></ul>";
                                RED.notify("Node"+(msg.types.length!=1 ? "s":"")+" enabled:"+typeList,"success");
                            } else {
                                $.get('nodes/'+msg.id, function(data) {
                                    $("body").append(data);
                                    typeList = "<ul><li>"+msg.types.join("</li><li>")+"</li></ul>";
                                    RED.notify("Node"+(msg.types.length!=1 ? "s":"")+" added to palette:"+typeList,"success");
                                });
                            } 
                        }
                    } else if (topic == "node/disabled") {
                        if (msg.types) {
                            RED.nodes.disableNodeSet(msg.id);
                            typeList = "<ul><li>"+msg.types.join("</li><li>")+"</li></ul>";
                            RED.notify("Node"+(msg.types.length!=1 ? "s":"")+" disabled:"+typeList,"success");
                        }
                    }
                });
            }
        });
    }

    var statusEnabled = false;
    function toggleStatus(state) {
        statusEnabled = state;
        RED.view.status(statusEnabled);
    }

    function performLoopDetection(state) {
        loopDetectionEnabled = state;
	console.log("loopDetectionEnabled:" + loopDetectionEnabled);
    }

    var dgNumberEnabled = false;
    function toggleDgNumberDisplay(state) {
        dgNumberEnabled = state;
        RED.view.showNumbers(dgNumberEnabled);
    }

    var nodePaletteDisplay = false;
    function toggleNodePaletteDisplay(state) {
        nodePaletteDisplay = state;
        RED.view.showNodePalette(nodePaletteDisplay);
    }
    function displayAllDGs(state) {
		//defined showSLa() in dgstart.html 
		showSLA();
    }


    function showHelp() {

        var dialog = $('#node-help');

        //$("#node-help").draggable({
        //        handle: ".modal-header"
        //});

        dialog.on('show',function() {
            RED.keyboard.disable();
        });
        dialog.on('hidden',function() {
            RED.keyboard.enable();
        });

        dialog.modal();
    }


//Custom Functions Added here
	function  showCodeCloudFlows(){
		codeCloudFlowFiles=[];
		var divStyle="<style>#codecloud-data-container a { color: #067ab4; font-size: 0.75em;} #codecloud-data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";
	 	$.get( "/getCodeCloudFlows")
                               .done(function( data ) {
					
					var header="<div class='header'>List of DG Flows in Code Cloud</div><div><input id='flowFilterBoxId' type='text' onkeyup='filterFlows(this.value)'></div>";
					var html=  divStyle + header +  "<div id='codecloud-data-container'>";
					html+="<ul>";
					if(data != null){
						var files=data.files;
						codeCloudFlowFiles=files;
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
    					$( "#codecloud-browser-dialog" ).dialog({
            				title: "Code Cloud DG Flow Browser",
            				modal: true,
            				autoOpen: true,
            				width: 830,
            				height: 630,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
                        					$( this ).dialog( "close" );
                    					}
                				}
            					],
					close: function(ev,ui){
                                		$(this).dialog("destroy");
                        		}
    					}).html(html);
					$("#codecloud-browser-dialog").show();
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get users.");
                                })
                                 .always(function() {
				});
	}
	/*	
	function  listYangFiles(){
		yangFilesList=[];
		var divStyle="<style>#list-yang-data-container a { color: #067ab4; font-size: 0.75em;} #list-yang-data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";
	 	$.get( "/getYangFiles")
                               .done(function( data ) {
					
					var header="<div class='header'>List of Yang Files </div><div><input id='flowFilterBoxId' type='text' onkeyup='filterYangFiles(this.value)'></div>";
					var html=  divStyle + header +  "<div id='list-yang-data-container'>";
					html+="<ul>";
					if(data != null){
						var files=data.files;
						yangFilesList=files;
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
    					$( "#list-yang-browser-dialog" ).dialog({
            				title: "List Yang Files",
            				modal: true,
            				autoOpen: true,
            				width: 830,
            				height: 630,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
                        					$( this ).dialog( "close" );
                    					}
                				}
            					],
					close: function(ev,ui){
                                		$(this).dialog("destroy");
                        		}
    					}).html(html);
					$("#list-yang-browser-dialog").show();
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get yang files.");
                                })
                                 .always(function() {
				});
	}
	*/

	function  listYangFiles(){
		yangFilesList=[];
	
		var divStyle="<style>#yang-files-data-container a { color: #067ab4; font-size: 0.75em;} #yang-files-data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; } table#yang-file-list-table { width:100%; } table#yang-file-list-table th,table#yang-file-list-table td { border: 1px solid black; border-collapse: collapse; } table#yang-file-list-table th,table#yang-file-list-table td { padding: 5px; text-align: left; } table#yang-file-list-table tr:nth-child(even) { background-color: #eee; } table#yang-file-list-table tr:nth-child(odd) { background-color:#fff; } table#yang-file-list-table th	{ background-color: #65a9d7; color: white; } table#yang-file-list-table a { color: #337ab7; } table#yang-file-list-table a:link { color: #65a9d7; } table#yang-file-list-table a:visited { color: #636; } table#yang-file-list-table a:hover { color: #3366CC; cursor: pointer } table#yang-file-list-table a:active { color: #65a9d7 }</style>";
	 	$.get( "/getYangFiles")
                               .done(function( data ) {
					
					var header="<div class='header'>List of Yang Files </div><div><input id='flowFilterBoxId' type='text' onkeyup='filterYangFiles(this.value)'></div>";
					var html=  divStyle + header +  "<div id='yang-files-data-container'>";
					html+="<table id='yang-file-list-table'  border=1>";
					html+="<tr>";
					html+="<th>File</th>";
					html+="<th>Delete</th>";
					html+="</tr>";
					if(data != null){
						var files=data.files;
						yangFilesList=files;
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
    					$( "#list-yang-browser-dialog" ).dialog({
            				title: "List Yang Files",
            				modal: true,
            				autoOpen: true,
            				width: 830,
            				height: 630,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
                        					$( this ).dialog( "close" );
                    					}
                				}
            					],
					close: function(ev,ui){
                                		$(this).dialog("destroy");
                        		}
    					}).html(html);
					$("#list-yang-browser-dialog").show();
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get yang files.");
                                })
                                 .always(function() {
				});
	}
		

	function showGitPullDialog(){
	 	$.get( "/getCurrentGitBranch")
                               .done(function( data ) {
					if(data != null){ 
						if(data.output == "GIT_LOCAL_REPOSITORY_NOT_SET" ){
							RED.notify("Git Local Repository path is not set. Please set it by choosing Configuration from the menu.");
							return;
						}	

						var html= "<div id='gitcheckout-container'>";
						html+="<table>";
						html+="<tr>";
						html+="<td>Branch</td>";
						html+="<td>" +  data.output + "</td>";
						html+="</tr>";
						html+="<tr>";
						html+="<td><input id='gitPullBtnId' type='button' value='Pull' onclick='performGitPull()'></td>";
						html+="<td>&nbsp;&nbsp;</td>"
						html+="</tr>";
						html+="<tr>";
						//html+="<td colspan=3><textarea readonly='1' rows='5' cols='200'  id='responseId'></textarea></td>";
						html+="</tr>";
						html+="</table>";
						html+="<br><div id='responseId'></div>";
						html+="</div>";
    						$( "#gitcommands-dialog" ).dialog({
            						title: "Git Pull",
            						modal: true,
            						autoOpen: true,
            						width: 630,
            						height: 500,
            						buttons: [
                					{
                    						text: "Close",
                    						click: function() {
                        						$( this ).dialog( "close" );
                    						}
                					}
            						],
							close: function(ev,ui){
                                				$(this).dialog("destroy");
                        				}
    						}).html(html);
					  $("#responseId").css({width:'550',height:'275px', border: '2px solid lightgrey',overflow:'scroll', padding: '20px' });
					  $("#responseId").hide();
					$("#gitcommands-dialog").show();
				}
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get gitBranch.");
                                })
                                 .always(function() {
				});
	}

	function showGitStatusDialog(){
	 	$.get( "/getCurrentGitBranch")
                               .done(function( data ) {
					if(data != null){ 
						if(data.output == "GIT_LOCAL_REPOSITORY_NOT_SET" ){
							RED.notify("Git Local Repository path is not set. Please set it by choosing Configuration from the menu.");
							return;
						}	

						var html= "<div id='gitcheckout-container'>";
						html+="<table>";
						html+="<tr>";
						html+="<td>Branch</td>";
						html+="<td>" + data.output + "</td>";
						html+="</tr>";
						html+="<tr>";
						html+="<td><input id='gitStatusBtnId' type='button' value='Status' onclick='performGitStatus()'></td>";
						html+="<td>&nbsp;&nbsp;</td>"
						html+="</tr>";
						html+="<tr>";
						//html+="<td colspan=3><textarea readonly='1' rows='5' cols='200'  id='responseId'></textarea></td>";
						html+="</tr>";
						html+="</table>";
						html+="<br><div id='responseId'></div>";
						html+="</div>";
    						$( "#gitcommands-dialog" ).dialog({
            						title: "Git Status",
            						modal: true,
            						autoOpen: true,
            						width: 630,
            						height: 500,
            						buttons: [
                					{
                    						text: "Close",
                    						click: function() {
                        						$( this ).dialog( "close" );
                    						}
                					}
            						],
							close: function(ev,ui){
                                				$(this).dialog("destroy");
                        				}
    						}).html(html);
					  //$("#responseId").css({width:'600px',height:'100px','border-radius' : '25px', border: '2px solid lightgrey', padding: '20px' });
					  $("#responseId").css({width:'550px',height:'100px', border: '2px solid lightgrey',overflow:'scroll', padding: '20px' });
					  $("#responseId").hide();
					$("#gitcommands-dialog").show();
				}
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get gitBranch.");
                                })
                                 .always(function() {
				});
	}

	function showGitCheckoutDialog(){
	 	$.get( "/getCurrentGitBranch")
                               .done(function( data ) {
					if(data != null){ 
						if(data.output == "GIT_LOCAL_REPOSITORY_NOT_SET" ){
							RED.notify("Git Local Repository path is not set. Please set it by choosing Configuration from the menu.");
							return;
						}	

						var html= "<div id='gitcheckout-container'>";
						html+="<table>";
						html+="<tr>";
						html+="<td>Branch</td>";
						html+="<td><input id='branchId' type='text' value='" + data.output + "'></td>";
						html+="</tr>";
						html+="<tr>";
						html+="<td><input id='checkoutBtnId' type='button' value='Checkout' onclick='performGitCheckout()'></td>";
						html+="<td>&nbsp;&nbsp;</td>"
						html+="</tr>";
						html+="<tr>";
						//html+="<td colspan=3><textarea readonly='1' rows='5' cols='200'  id='responseId'></textarea></td>";
						html+="</tr>";
						html+="</table>";
						html+="<br><div id='responseId'></div>";
						html+="</div>";
    						$( "#gitcommands-dialog" ).dialog({
            						title: "Git Checkout",
            						modal: true,
            						autoOpen: true,
            						width: 430,
            						height: 350,
            						buttons: [
                					{
                    						text: "Close",
                    						click: function() {
                        						$( this ).dialog( "close" );
                    						}
                					}
            						],
							close: function(ev,ui){
                                				$(this).dialog("destroy");
                        				}
    						}).html(html);
					  $("#responseId").css({width:'300',height:'100px', border: '2px solid lightgrey',overflow:'scroll', padding: '20px' });
					  $("#responseId").hide();
					$("#gitcommands-dialog").show();
				}
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get gitBranch.");
                                })
                                 .always(function() {
				});
	}

	function  showGitLocalFlows(){
		giLocalFlowFiles=[];
		var divStyle="<style>#gitlocal-data-container a { color: #067ab4; font-size: 0.75em;} #gitlocal-data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";
	 	$.get( "/getGitLocalFlows")
                               .done(function( data ) {
					if(data != null && data.files != null && data.files.length == 1){
						if(data.files[0] == "GIT_LOCAL_REPOSITORY_NOT_SET" ){
							RED.notify("Git Local Repository path is not set. Please set it by choosing Configuration from the menu.");
							return;
						}	
					}
					//console.log("got response from server.");
					
					var header="<div class='header'>List of DG Flows  from  Git Local Repository </div><div><input id='flowFilterBoxId' type='text' onkeyup='filterGitLocalFlows(this.value)'></div>";
					var html=  divStyle + header +  "<div id='gitlocal-data-container'>";
					html+="<ul>";
					if(data != null){
						var files=data.files;
						gitLocalFlowFiles=files;
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
    					$( "#gitlocal-browser-dialog" ).dialog({
            				title: "Git Local Repository DG Flow Browser",
            				modal: true,
            				autoOpen: true,
            				width: 830,
            				height: 630,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
								$(this).dialog("close");
                    					}
                				}
            					]
    					}).html(html);
					$("#gitlocal-browser-dialog").show();
					/*
					if ($("#gitlocal-browser-dialog").dialog( "isOpen" )===true) {
						console.log("gitlocal dialog box is open");	
    						//true
					} else {
						console.log("gitlocal dialog box is not open");	
					//	$( "#gitlocal-browser-dialog" ).dialog("destroy").remove();
						console.log($("#gitlocal-browser-dialog").dialog( "widget" ));
						$("#gitlocal-browser-dialog").dialog( "open" );
						if ($("#gitlocal-browser-dialog").dialog( "isOpen" )===true) {
							console.log("gitlocal dialog box is now open");	
						}
						$("#gitlocal-browser-dialog").show();
    						//false
					}
					*/
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get flows.");
                                })
                                 .always(function() {
					console.log("Done displaying");
				});
	}

	function  showFlowShareUsers(){
		var divStyle="<style>#data-container a { color: #067ab4; font-size: 0.75em;} #data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";
		$.get("/flowShareUsers")
			.done(function (data){
					
					var header="<div class='header'>List of Downloaded DG Flows</div>";
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
            				title: "Downloaded DG Flows Browser",
            				modal: true,
            				autoOpen: true,
            				width: 530,
            				height: 530,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
                        					$( this ).dialog( "close" );
								//$(this).dialog('destroy').remove();
                    					}
                				}
            					]
    					}).html(html);
					$("#dgflow-browser-dialog").show();
					/*
					if ($("#dgflow-browser-dialog").dialog( "isOpen" )===true) {
						console.log("dgflow dialog box is open");	
    						//true
					} else {
						console.log("dgflow dialog box is not open");	
						$("#dgflow-browser-dialog").dialog( "open" );
						$("#dgflow-browser-dialog").show();
    						//false
					}
					*/
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get users.");
                                })
                                 .always(function() {
				});
	}

/*	function  showFlowShareUsers(){
		var divStyle="<style>#data-container a { color: #067ab4; font-size: 0.75em;} #data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }</style>";
	 	$.get( "/flowShareUsers")
                               .done(function( data ) {
					
					var header="<div class='header'>List of Downloaded DG Flows</div>";
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
            				title: "Downloaded DG Flows Browser",
            				modal: true,
            				autoOpen: true,
            				width: 530,
            				height: 530,
            				buttons: [
                				{
                    					text: "Close",
                    					click: function() {
                        					//$( this ).dialog( "close" );
								$(this).dialog('destroy').remove();
                    					}
                				}
            					]
    					}).html(html);
					//$("#dgflow-browser-dialog").show();
                    			$( "#dgflow-browser-dialog" ).dialog( "open" );
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get users.");
                                })
                                 .always(function() {
				});
	}
	*/


function detectLoopInFlow(){
		var errList = [];
		var activeWorkspace=RED.view.getWorkspace();
		var nSet=[];
		
		RED.nodes.eachNode(function(n) {
			if (n.z == activeWorkspace) {
                    		nSet.push({n:n});
                	}
        	});

		var nodeSet = RED.nodes.createExportableNodeSet(nSet);

		var isLoopDetected = false;	
		var dgStartNode = getDgStartNode(nodeSet);
		if(dgStartNode == null || dgStartNode == undefined) {
			console.log("dgstart node not linked.");
			return null;
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
			
		var loopDetectedObj = {};
		/* the nodes will not be in order so will need to loop thru again */
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
						var index = keys[j].indexOf("->" + link);
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
								console.dir(loopDetectedObj);
								errList.push("Loop detected between " + n1.name + " and " + n2.name);
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
	/*
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
			//RED.notify(msg);
		}
	}	
	*/
	//images/page-loading.gif
		return errList;
}

function showLoopDetectionBox(){
	$(function() {
	var htmlStr="<div id='loop-box-div' style='width:375;height:225'><p>Loop detection in Progress ...</p><img src='images/page-loading.gif'></div>"
	$("#loop-detection-dialog").dialog({
		modal:true,	
		autoOpen :true,
		title: "DG Flow Loop Detection",
             	width: 400,
             	height: 250,
                minWidth : 400, 
                minHeight :200, 
		}).html(htmlStr);
		if($("#loop-detection-dialog").dialog("isOpen") == true){
			var errList = detectLoopInFlow();
			var errList=[];
			if(errList == null){
				$("#loop-detection-dialog").dialog("close");
			}
			var msgHtml = "";
			for(var i=0;errList != null && i<errList.length;i++){
				msgHtml += "<p>" + errList[i] + "</p>";
			}
			if(msgHtml == ""){
				$("loop-box-div").html("<p>SUCCESS. No Loop detected.</p>");
			}else{
				$("loop-box-div").html(msgHtml);
			}
		}
	});
	
}

function showSelectedTabs(){
        var tabSheets = [];
	var beforeTabsOrder=[];
        $(".red-ui-tabs li a").each(function(i){
	 	var id=$(this).attr("href").replace('#','');
	 	var title=$(this).attr("title");
		var isVisible = $(this).parent().is(":visible"); 
		if(title != 'info'){
			tabSheets.push({"id" : id ,"title":title,"module":"NOT_SET","version" : "NOT_SET","rpc":"NOT_SET","isVisible":isVisible});
			beforeTabsOrder.push(id);
		}
	});

        RED.nodes.eachNode(function(n) {
                if(n.type == 'service-logic'){
			var id = n.z;
			var module = n.module;
			tabSheets.forEach(function(tab){
				if(tab.id == id){
					tab.module=module;
					tab.version=n.version;
				}	
			});
                }else if(n.type == 'method'){
			var id = n.z;
			tabSheets.forEach(function(tab){
				if(tab.id == id){
					var rpc=getAttributeValue(n.xml,"rpc");
					tab.rpc=rpc;
				}	
			});
		}
        });
	//console.dir(tabSheets);
	var htmlStr = getHtmlStr(tabSheets);
	$("#filter-tabs-dialog").dialog({
		modal:true,	
		title: "DG Builder Tabs",
             	width: 1200,
             	height: 750,
                minWidth : 600, 
                minHeight :450, 
		}).html(htmlStr);
/* This code allows for the drag-drop of the rows in the table */
	var fixHelperModified = function(e, tr) {
    		var $originals = tr.children();
    		var $helper = tr.clone();
    		$helper.children().each(function(index) {
        	$(this).width($originals.eq(index).width())
    	});
    	return $helper;
	},
    	updateIndex = function(e, ui) {
		var afterTabsOrder=[];
        	$('td.index', ui.item.parent()).each(function (i) {
            		$(this).html(i + 1);
        	});
		//RE-ARRANGE the tabs
		var ul = $("#workspace-tabs");
		$("#ftab02 tr td:nth-child(1)").each(function(i){
			var idStr = $(this).prop("id").replace("tab-td_","");
			afterTabsOrder.push(idStr);
			link = ul.find("a[href='#"+ idStr+"']");
			li = link.parent();
			//li.remove();
			firstTab = $("#workspace-tabs li:first-child");
			lastTab = $("#workspace-tabs li:last-child");
			li.insertAfter(lastTab);
			//console.log( idStr);
		});
		var beforeTabsStr = beforeTabsOrder.join(",");
		var afterTabsStr = afterTabsOrder.join(",");
		//console.log("beforeTabsStr:" +beforeTabsStr);
		//console.log("afterTabsStr:" +afterTabsStr);
		if(beforeTabsStr !== afterTabsStr){
			//activate only when order has changed
			//activate the deploy button
            		RED.view.dirty(true);
			$("#btn-deploy").removeClass("disabled");
		}
    	};

	$("#ftab02 tbody").sortable({
    	helper: fixHelperModified,
    	stop: updateIndex
	}).disableSelection();

}

function getHtmlStr(rows){
	var styleStr = "<style> " + 
			"table#ftab02 { width:100%; } \n" +
				"table#ftab02 th,table#ftab02 td { border: 1px solid black; border-collapse: collapse; } \n" +
				/*"table, th, td { border: 1px solid #65a9d7; border-collapse: collapse; } \n" +*/
				"table#ftab02 th,table#ftab02 td { padding: 5px; text-align: left; } \n" +
				"table#ftab02 tr:nth-child(even) { background-color: #eee; }\n" +
				"table#ftab02 tr:nth-child(odd) { background-color:#fff; }\n" +
				"table#ftab02 th	{ background-color: #65a9d7; color: white; }\n" +
				"table#ftab02 a { color: #337ab7; }\n" +
				"table#ftab02 a:link { color: #65a9d7; }\n" +
				"table#ftab02 a:visited { color: #636; }\n" + 
				"table#ftab02 a:hover { color: #3366CC; cursor: pointer }\n" + 
				"table#ftab02 a:active { color: #65a9d7 }\n" +
				"</style>";
			if(rows != null && rows != undefined){
				//var alertDialog = '<div id="confdialog"></div>';
				//htmlStr= alertDialog +  "<div style='width:1050;height:650'>" + styleStr;
				var alertDialog = '<div id="tabAlertDialog"></div>';
				htmlStr= alertDialog +  "<div id='tabs-div' style='width:1050;height:650'>" + styleStr;
				htmlStr += "<table id='ftab02' >";
				htmlStr += "<tr>";
				htmlStr += "<th class='index'>No.</th>" ;
				htmlStr += "<th>Tab Title</th>" ;
				htmlStr += "<th>Module</th>" ;
				htmlStr += "<th>RPC</th>" ;
				htmlStr += "<th>Version</th>" ;
				htmlStr += "<th>Rename</th>" ;
				htmlStr += "<th>Delete</th>" ;
				htmlStr += "</tr>";
				htmlStr += "<tbody>";
				if(rows != null && rows.length == 0){
					htmlStr += "<tr>";
					htmlStr += "<td><b>No rows found</b></td>";
					htmlStr += "</tr></table></div>";
					return htmlStr;
				}
				for(var i=0;i<rows.length;i++){
					var row = rows[i];
					var title = row.title;
					var _module = row.module;
					var version = row.version;
					var rpc = row.rpc;
					var idVal = row.id;
					var isVisible = row.isVisible;
					htmlStr += "<tr id='tab-tr_" + idVal + "'>";
					//htmlStr += "<td id=" + "'tab-td_" + idVal  + "' ><a href='javascript:activateClickedTab(\"" + idVal + "\")'>" + (i+1) + "</a></td>";
					htmlStr += "<td class='index' id=" + "'tab-td_" + idVal  + "' >" + (i+1) + "</td>";
					htmlStr += "<td><a href='javascript:activateClickedTab(\"" + idVal + "\")'>" + title + "</a></td>";
					htmlStr += "<td>" + _module + "</td>";
					htmlStr += "<td>" + rpc + "</td>";
					htmlStr += "<td>" + version + "</td>";
					//htmlStr += "<td><a href='javascript:deleteOrRenameTab(\"" + idVal + "\")'>Delete/Rename</a></td>";
					htmlStr += "<td><input type='button' onclick='renameSelectedTab(\"" + idVal + "\",\"" + title + "\",\"" +  _module + "\",\"" + rpc + "\",\"" + version + "\")' value='Rename'></td>";
					if(rows.length == 1){
						htmlStr += "<td><input type='button' disabled='1' onclick='deleteSelectedTab(\"" + idVal + "\",\"" + title + "\",\"" +  _module + "\",\"" + rpc + "\",\"" + version + "\")' value='Delete'></td>";
					}else{
						htmlStr += "<td><input type='button'  onclick='deleteSelectedTab(\"" + idVal + "\",\"" + title + "\",\"" +  _module + "\",\"" + rpc + "\",\"" + version + "\")' value='Delete'></td>";
					}
					/*
					if(isVisible){
						htmlStr += "<td><input type='checkbox' onclick=\"showOrHideTab(this,'" + idVal + "')\" checked='true'></td>";
					}else{
						htmlStr += "<td><input type='checkbox' onclick=\"showOrHideTab(this,'" + idVal + "')\"></td>";
					}
					*/
					htmlStr += "</tr>";
				}
				htmlStr += "</tbody>";
				htmlStr += "</table>";
				htmlStr += "</div>";
			}
	return htmlStr;
}
/*
Added this logic because , when the configuration item is choosen in the menu the other dialog boxes were not poping up
*/
(function(){
	//var msecs1= Date.now();
    		$( "#gitlocal-browser-dialog" ).dialog();
    		$( "#gitlocal-browser-dialog" ).dialog("close");
    		$( "#dgflow-browser-dialog" ).dialog();
    		$( "#dgflow-browser-dialog" ).dialog("close");
    		$( "#update-password-dialog" ).dialog();
    		$( "#update-password-dialog" ).dialog("close");
    		$( "#codecloud-browser-dialog" ).dialog();
    		$( "#codecloud-browser-dialog" ).dialog("close");
    		$( "#update-configuration-dialog" ).dialog();
    		$( "#update-configuration-dialog" ).dialog("close");
    		$( "#gitcommands-dialog" ).dialog();
    		$( "#gitcommands-dialog" ).dialog("close");
		$("#filter-tabs-dialog").dialog();
		$("#filter-tabs-dialog").dialog("close");
		$("#loop-detection-dialog").dialog();
		$("#loop-detection-dialog").dialog("close");
		$("#dgstart-generate-xml-dialog").dialog();
		$("#dgstart-generate-xml-dialog").dialog("close");
		$("#xmldialog").dialog();
		$("#xmldialog").dialog("close");
		$("#upload-xml-status-dialog").dialog();
		$("#upload-xml-status-dialog").dialog("close");
		$("#flow-design-err-dialog").dialog();
		$("#flow-design-err-dialog").dialog("close");
		$("#sli-values-dialog").dialog();
		$("#sli-values-dialog").dialog("close");
		$("#comments-dialog").dialog();
		$("#comments-dialog").dialog("close");
		$("#show-errors-dialog").dialog();
		$("#show-errors-dialog").dialog("close");
		$("#dgnumber-find-dialog").dialog();
		$("#dgnumber-find-dialog").dialog("close");
		$("#search-text-dialog").dialog();
		$("#search-text-dialog").dialog("close");
		$("#yang-upload-dialog").dialog();
		$("#yang-upload-dialog").dialog("close");
		$("#yang-modules-browser-dialog").dialog();
		$("#yang-modules-browser-dialog").dialog("close");
		$("#list-yang-browser-dialog").dialog();
		$("#list-yang-browser-dialog").dialog("close");
		$("#request-input-dialog").dialog();
		$("#request-input-dialog").dialog("close");
                //var msecs2= Date.now();
                //console.log("Time taken for dialog boxes:" + (msecs2 - msecs1));
})();

	function updateConfiguration(){
		//console.log("in updateConfiguration");
		$.get("/getCurrentSettings",function (data){
		var dbHost = data.dbHost;
		var dbPort = data.dbPort;
		var dbName = data.dbName;
		var dbUser = data.dbUser;
		var dbPassword = data.dbPassword;
		var gitLocalRepository = data.gitLocalRepository;
		var performGitPull = data.performGitPull;

		if(dbHost == undefined) dbHost="";
		if(dbPort == undefined) dbPort="";
		if(dbName == undefined) dbName="";
		if(dbUser == undefined) dbUser="";
		if(dbPassword == undefined) dbPassword="";
		if(gitLocalRepository == undefined) gitLocalRepository="";
		if(performGitPull  == undefined || performGitPull == null) performGitPull="N";

		var divStyle="border: 1px solid #a1a1a1; padding: 10px 40px; background: #dddddd; width: 500px; border-radius: 25px;";
		//var divStyle="border: 2px solid #a1a1a1; padding: 10px 40px; background: #99CCFF; width: 400px; border-radius: 25px;";
	

		   var  html = "<div>";
		  	html += "<script>function changeType(obj,targetId){if( obj.checked== true){$('#' + targetId).prop('type','password');}else{$('#'+ targetId).prop('type','text');}} function changeTitle(){ document.getElementById(\"gitLocalRepository\").title=document.getElementById(\"gitLocalRepository\").value;}</script>";
		        html += "<div style='" + divStyle + "' >";
			html += "<table border='0' cellpadding='5' >";
			html += "<tr>";
			html += "<td style='font-size:12px;align:center'><b>DB Host IP</b></td>";
			html += "<td><input  style='align:center;font-size:11px;font-weight:bold' id='dbhost' name='dbhost' type='text' value='" + dbHost + "'></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td style='font-size:12px;align:center'><b>DB Port</b></td>";
			html += "<td><input style='align:center;font-size:11px;font-weight:bold' id='dbport' name='dbport' type='text' value='" + dbPort + "'></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td style='font-size:12px;align:center'><b>DB Name</b></td>";
			html += "<td><input style='align:center;font-size:11px;font-weight:bold' id='dbname' name='dbname' type='text' value='" + dbName + "'></td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td style='font-size:12px;align:center'><b>DB UserName</b></td>";
			html += "<td><input style='align:center;font-size:11px;font-weight:bold' id='dbuser' name='dbuser' type='password' value='" + dbUser + "'></td>";
			html += "<td><input style='background:background:white;width:20px;height:20px' type='checkbox' checked value='1' onclick=\"changeType(this,'dbuser')\">Hide</td>";
			html += "</tr>";
			html += "<tr>";
			html += "<td style='font-size:12px;align:center'><b>DB Password</b></td>";
			html += "<td><input style='align:center;font-size:11px;font-weight:bold' id='dbpassword' name='dbpassword' type='password' value='" + dbPassword + "'></td>";
			html += "<td><input style='background:background:white;width:20px;height:20px' type='checkbox' checked value='1' onclick=\"changeType(this,'dbpassword')\">Hide</td>";
			html += "</tr>";
			html += "</table>";
		        html += "</div>";
		        html += "<div style='fill:both;clear:both'></div><br>";
	
		        html += "<div style='" + divStyle + "' >";
			html += "<table border='0' cellpadding='5' >";
			html += "<tr>";
			html += "<td style='font-size:12px;align:center'><b>Git Local Repository Path</b></td>";
			html += "<td><textarea style='align:center;font-size:14px;' cols='50' rows='4' id='gitLocalRepository' name='gitLocalRepository' onkeyup='changeTitle()' title='" + gitLocalRepository + "'>" + gitLocalRepository + "</textarea></td>";
			html += "</tr>";
			html += "</table>";
			html += "<table border='0' cellpadding='5' >";
			html += "<tr>";
			if(performGitPull == "N"){
				html += "<td style='align:center;'><input style='color:blue;width:20px;height:20px;' id='performGitPull' type='checkbox' value='Y'>Perform Git Pull in Local Git Repository prior to import</td>";
			}else{
				html += "<td style='align:center;'><input style='color:blue;width:20px;height:20px;' id='performGitPull' type='checkbox' value='Y' checked>Perform Git Pull in Local Git Repository prior to import</td>";
			}
			html += "</tr>";
			html += "</table>";
			html += "</div>";
		        html += "</div>";
			//console.log("html:" + html);
    		$( "#update-configuration-dialog" ).dialog({
            		title: "Configuration",
            		modal: true,
            		autoOpen: true,
            		width: 630,
            		height: 630,
            		buttons: [
                		{
                    		text: "Save",
                    		click: function() {
					var newDBHost = $("#dbhost").val().trim();
					var newDBPort = $("#dbport").val().trim();
					var newDBName = $("#dbname").val().trim();
					var newDBUser = $("#dbuser").val().trim();
					var newDBPassword = $("#dbpassword").val().trim();
					var newGitLocalRepository = $("#gitLocalRepository").val().trim();
					var isPerformGitPullChecked = $('#performGitPull').is(':checked');
					var newPerformGitPull = "N";
					if(isPerformGitPullChecked){
						newPerformGitPull = "Y";
					}
					if(newDBHost == ""){
						RED.notify("Error: DB Host is required.");		
						$("#dbhost").focus();
						return;
					}else if(newDBPort == ""){
						RED.notify("Error: DB Port is required.");		
						$("#dbport").focus();
						return;
					}else if(newDBName == ""){
						RED.notify("Error: DB Name is required.");		
						$("#dbname").focus();
						return;
					}else if(newDBUser == ""){
						RED.notify("Error: DB User is required.");		
						$("#dbuser").focus();
						return;
					}else if(newDBPassword == ""){
						RED.notify("Error: DB Password is required.");		
						$("#dbpassword").focus();
						return;
					}else{ 
						console.log("newGitLocalRepository:" + newGitLocalRepository);
						var reqData= {"dbHost":newDBHost,
								"dbPort" : newDBPort,
								"dbName" : newDBName,
								"dbUser" : newDBUser,
								"dbPassword" : newDBPassword,
								"gitLocalRepository" : newGitLocalRepository, 
								"performGitPull" : newPerformGitPull 
							     };
						 $.post( "/updateConfiguration",reqData )
                                        	.done(function( data ) {
                                                        RED.notify("Configuration updated successfully"); 
							//loadSettings();
							//RED.comms.connect();
							//$( "#update-configuration-dialog" ).dialog('close');
							$("#update-configuration-dialog").dialog("close");
							//location.reload();
								
                                        	})
                                        	.fail(function(err) {
                                                 	console.log( "error" + err );
                                                 	RED.notify("Failed to update the Configuration.");
                                        	})
                                        	.always(function() {
						});
                    			}
				   }
                		},
                		{
                    			text: "Cancel",
                    			click: function() {
                        			$( this ).dialog( "close" );
                    			}
                		}
            		]
    		}).html(html);
		//$("#update-configuration-dialog").show();
		$("#gitLocalRepository").css({"width" : 300});

		});
	}

	function updatePassword(){
		var html="<div>";
			html += "<div><span><b>New Password</b></span><br>";
			html += "<input id='passwd1' name='passwd1' type='password' value=''>";
			html += "</div>";
			html += "<div><span><b>Confirm Password</b></span><br>";
			html += "<input id='passwd2' name='passwd2' type='password' value=''>";
			html += "</div>";
    		$( "#update-password-dialog" ).dialog({
            		title: "Update Password",
            		modal: true,
            		autoOpen: true,
            		width: 530,
            		height: 230,
            		buttons: [
                		{
                    		text: "Update Password",
                    		click: function() {
					var passwd1 = $("#passwd1").val().trim();
					var passwd2 = $("#passwd2").val().trim();
					if((passwd1 != passwd2) || (passwd1 == "" || passwd2 == "")){
						RED.notify("Error:Passwords entered must be same and must be populated.");		
						return;
					}else{ 
						var reqData= {"password":passwd1};
						 $.post( "/updatePassword",reqData )
                                        	.done(function( data ) {
                                                        RED.notify("Password updated successfully"); 
							//loadSettings();
							$( "#update-password-dialog" ).dialog('close');
                                        	})
                                        	.fail(function(err) {
                                                 	console.log( "error" + err );
                                                 	RED.notify("Failed to update the password.");
                                        	})
                                        	.always(function() {
						});
                    			}
				   }
                		},
                		{
                    			text: "Cancel",
                    			click: function() {
                        			$( this ).dialog( "close" );
                    			}
                		}
            		]
    		}).html(html);
		$("#update-password-dialog").show();

	}

	function  showAvailableYangModules(){
		availableYangModules=[];
		var divStyle="<style>#yang-modules-data-container a { color: #067ab4; font-size: 0.75em;} #yang-modules-data-container a:hover { text-decoration: underline; padding: -15px -15px -15px 15px; } .header { height: 40px; border-bottom: 1px solid #EEE; background-color: #ffffff; height: 40px; -webkit-border-top-left-radius: 5px; -webkit-border-top-right-radius: 5px; -moz-border-radius-topleft: 5px; -moz-border-radius-topright: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; } .footer { height: 40px; background-color: whiteSmoke; border-top: 1px solid #DDD; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; } table#yang-list-table { width:100%; } table#yang-list-table th,table#yang-list-table td { border: 1px solid black; border-collapse: collapse; } table#yang-list-table th,table#yang-list-table td { padding: 5px; text-align: left; } table#yang-list-table tr:nth-child(even) { background-color: #eee; } table#yang-list-table tr:nth-child(odd) { background-color:#fff; } table#yang-list-table th	{ background-color: #65a9d7; color: white; } table#yang-list-table a { color: #337ab7; } table#yang-list-table a:link { color: #65a9d7; } table#yang-list-table a:visited { color: #636; } table#yang-list-table a:hover { color: #3366CC; cursor: pointer } table#yang-list-table a:active { color: #65a9d7 }</style>";
	 	$.get( "/listAvailableModules")
                               .done(function( data ) {
					var header="<div class='header'>List of Available Yang Modules</div>";
					header += "<div><p><i>Check the modules that you want to load and click on the Load button.</i></p></div>";	
					//header += "<div><input id='yangModuleFilterBoxId' type='text' onkeyup='filterYangModules(this.value)'></div>";
					var html=  divStyle + header +  "<div id='yang-modules-data-container'>";
					html+="<table id='yang-list-table'  border=1>";
					html+="<tr>";
					html+="<th>#</th>";
					html+="<th>Load</th>";
					html+="<th>Module</th>";
					html+="</tr>";
					if(data != null){
						var files=data.files;
						availableYangModules=files;
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
                                				html+="<tr><td>" + count + "</td><td><input type='checkbox' checked value='" + val + "'></td><td>" + val + "</td></tr>";
                        				}else{
                                				html+="<tr><td>" + count + "</td><td><input type='checkbox' value='" + val + "'></td><td>" + val + "</td></tr>";
                        				}
							count++;
						}
					}
					html+="</table>";
					html+="</div>";
    					$( "#yang-modules-browser-dialog" ).dialog({
            				title: "Available Yang Modules",
            				modal: true,
            				autoOpen: true,
            				width: 830,
            				height: 630,
            				buttons: [
                				{
                    					text: "Load",
                    					click: function() {
     								var allVals = [];
								function getValuesForSelected() {         
     									$('#yang-modules-data-container :checked').each(function() {
       										allVals.push($(this).val());
     									});
									return allVals;
  								}
								var selectedModules = getValuesForSelected().toString();
								console.log(selectedModules);
								$.ajax({
        								type: 'GET',
        								/*contentType: "application/x-www-form-urlencoded",*/
        								url: '/loadSelectedModules?selectedModules=' + selectedModules,
        								success: function(data) {
                                                        			RED.notify("Modules Loaded successfully"); 
										//emptying existing g;obal variables
										sliValuesObj = {};
										rpcValues = {};
										reqInputValues = {};

										if(data != undefined && data != null){
                      									for(var i=0;i<data.sliValuesObj.length;i++){
                                								var moduleName = data.sliValuesObj[i].moduleName;
                                								sliValuesObj[moduleName] = data.sliValuesObj[i][moduleName + '_PROPS'];
                                								rpcValues[moduleName] = data.sliValuesObj[i][ moduleName +'_RPCS'];
                                								for(var k=0;rpcValues[moduleName] != undefined && k<rpcValues[moduleName].length;k++){
                                        								var rpcName = rpcValues[moduleName][k];
                                        								reqInputValues[moduleName + "_" + rpcName] = data.sliValuesObj[i][rpcName +"-input"];
													//console.dir(reqInputValues);
                                								}
                        								}
										}
										$( "#yang-modules-browser-dialog" ).dialog('close');
            									console.log('success');
            									//console.log(JSON.stringify(data));                               
        								},
        								error: function(error) {
                                                 				RED.notify("Failed to load modules.");
            									console.log("some error in fetching the notifications");
         								}
    								});	
                    					}
                				},
                				{
                    					text: "Close",
                    					click: function() {
								$(this).dialog("close");
                    					}
                				}
            					]
    					}).html(html);
					$("#yang-modules-browser-dialog").show();
                               })
                                .fail(function(err) {
                                         RED.notify("Failed to get yang modules.");
                                })
                                 .always(function() {
					console.log("Done displaying");
				});
	}


    $(function() {
        RED.menu.init({id:"btn-sidemenu",
            options: [
                {id:"btn-sidebar",icon:"fa fa-columns",label:"Sidebar   (Ctrl+Space)",toggle:true,onselect:RED.sidebar.toggleSidebar},
                null,
                {id:"btn-manage-yang-modules-menu",icon:"fa fa-sign-in",label:"Manage Yang Modules",options:[
                    {id:"btn-yang-upload",icon:"fa fa-clipboard",label:"Upload Yang File",onselect:RED.view.showYangUploadDialog},
                    {id:"btn-available-yang-modules",icon:"fa fa-clipboard",label:"Available Yang Modules",onselect:showAvailableYangModules},
                    {id:"btn-list-yang-files",icon:"fa fa-clipboard",label:"List Yang Files",onselect:listYangFiles},
                ]},
                null,
                {id:"btn-configure-upload",icon:"fa fa-book",label:"Configuration",toggle:false,onselect:updateConfiguration},
                null,
                {id:"btn-manage-tabs",icon:"fa fa-info",label:"Manage Tabs",toggle:false,onselect:showSelectedTabs},
                null,
                {id:"btn-search-text",icon:"fa fa-info",label:"Search Text (Ctrl+[)",toggle:false,onselect:RED.view.showSearchTextDialog},
                null,
                {id:"btn-find-dgnumber",icon:"fa fa-info",label:"Find Node (Ctrl+B)",toggle:false,onselect:RED.view.showDgNumberDialog},
                null,
		{id:"btn-request-input",icon:"fa fa-info",label:"RPC Input (Ctrl+O)",toggle:false,onselect:RED.view.showRequestTemplateDialog},
                null,
                {id:"btn-node-status",icon:"fa fa-info",label:"Node Status",toggle:true,onselect:toggleStatus},
                null,
                {id:"btn-node-dgnumber",icon:"fa fa-info",label:"Show Node Numbers",toggle:true,onselect:toggleDgNumberDisplay},
                null,
                {id:"btn-node-panel",icon:"fa fa-columns",label:"Node Palette (Ctrl+M)",toggle:true,onselect:toggleNodePaletteDisplay},
                null,
                {id:"btn-node-viewdgs",icon:"fa fa-info",label:"View All DG List",toggle:false,onselect:displayAllDGs},
                null,
		/*
                {id:"btn-node-gitmenu",icon:"fa fa-info",label:"Git Commands",options: [
                    {id:"btn-node-gitcheckout",icon:"fa fa-info",label:"Git Checkout",onselect:showGitCheckoutDialog},
                    {id:"btn-node-gitpull",icon:"fa fa-info",label:"Git Pull",onselect:showGitPullDialog},
                    {id:"btn-node-gitstatus",icon:"fa fa-info",label:"Git Status",onselect:showGitStatusDialog}
                ]},
                null,
		*/
                {id:"btn-import-menu",icon:"fa fa-sign-in",label:"Import...",options:[
                    /*{id:"btn-import-codecloud",icon:"fa fa-clipboard",label:"Code Cloud",onselect:showCodeCloudFlows},
			*/
                    {id:"btn-import-codecloud",icon:"fa fa-clipboard",label:"Git Local Repository",onselect:showGitLocalFlows},
                    {id:"btn-import-userflows",icon:"fa fa-clipboard",label:"Downloaded DG Flows...",onselect:showFlowShareUsers},
                    {id:"btn-import-clipboard",icon:"fa fa-clipboard",label:"Clipboard...",onselect:RED.view.showImportNodesDialog},
                    {id:"btn-import-library",icon:"fa fa-book",label:"Library",options:[]}
                ]},
                {id:"btn-export-menu",icon:"fa fa-sign-out",label:"Export...",disabled:true,options:[
                    {id:"btn-export-clipboard",icon:"fa fa-clipboard",label:"Clipboard...",disabled:true,onselect:RED.view.showExportNodesDialog},
                    {id:"btn-export-library",icon:"fa fa-book",label:"Library...",disabled:true,onselect:RED.view.showExportNodesLibraryDialog}
                ]},
                null,
                {id:"btn-change-password",icon:"fa fa-columns",label:"Change Password",toggle:false,onselect:updatePassword},
                null,
                /*{id:"btn-config-nodes",icon:"fa fa-th-list",label:"Configuration nodes...",onselect:RED.sidebar.config.show},
                null,*/
                {id:"btn-workspace-menu",icon:"fa fa-th-large",label:"Workspaces",options:[
                    {id:"btn-workspace-add",icon:"fa fa-plus",label:"Add"},
                    {id:"btn-workspace-edit",icon:"fa fa-pencil",label:"Rename"},
                    {id:"btn-workspace-delete",icon:"fa fa-minus",label:"Delete"},
                    null
                ]},
                null,
                {id:"btn-keyboard-shortcuts",icon:"fa fa-keyboard-o",label:"Keyboard Shortcuts",onselect:showHelp}
                /*{id:"btn-help",icon:"fa fa-question",label:"Help...", href:"http://nodered.org/docs"}*/
            ]
        });

	//Making default loop detection on and display check mark in the menu
	//$("#btn-loop-detection").addClass("active");

        RED.keyboard.add(/* ? */ 191,{shift:true},function(){showHelp();d3.event.preventDefault();});
        loadSettings();
        RED.comms.connect();
    });

    return {
    };
})();
