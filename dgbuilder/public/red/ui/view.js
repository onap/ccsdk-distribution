/**
 * Copyright 2013, 2014 IBM Corp.
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


RED.view = (function() {
	/* increasing the width and height from 5000 to 7500*/
    var space_width = 7500,
        space_height = 7500,
        lineCurveScale = 0.75,
        scaleFactor = 1,
        node_width = 100,
        node_height = 30;
    
    var touchLongPressTimeout = 1000,
        startTouchDistance = 0,
        startTouchCenter = [],
        moveTouchCenter = [],
        touchStartTime = 0;


    var activeWorkspace = 0;
    var workspaceScrollPositions = {};

    var selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mousedown_port_type = null,
        mousedown_port_index = 0,
        mouseup_node = null,
        mouse_offset = [0,0],
        mouse_position = null,
        mouse_mode = 0,
        moving_set = [],
        dirty = false,
        lasso = null,
        showStatus = false,
        showNumbers = false,
        showNodePalette = true,
        lastClickNode = null,
        dblClickPrimed = null,
        clickTime = 0,
        clickElapsed = 0;

    var clipboard = "";

    var status_colours = {
        "red":    "#c00",
        "green":  "#5a8",
        "yellow": "#F9DF31",
        "blue":   "#53A3F3",
        "grey":   "#d3d3d3"
    }

    var outer = d3.select("#chart")
        .append("svg:svg")
        .attr("width", space_width)
        .attr("height", space_height)
        .attr("pointer-events", "all")
        .style("cursor","crosshair");

     var vis = outer
        .append('svg:g')
        .on("dblclick.zoom", null)
        .append('svg:g')
        .on("mousemove", canvasMouseMove)
        .on("mousedown", canvasMouseDown)
        .on("mouseup", canvasMouseUp)
        .on("touchend", function() {
            clearTimeout(touchStartTime);
            touchStartTime = null;
            if  (RED.touch.radialMenu.active()) {
                return;
            }
            if (lasso) {
                outer_background.attr("fill","#fff");
            }
            canvasMouseUp.call(this);
        })
        .on("touchcancel", canvasMouseUp)
        .on("touchstart", function() {
            var touch0;
            if (d3.event.touches.length>1) {
                clearTimeout(touchStartTime);
                touchStartTime = null;
                d3.event.preventDefault();
                touch0 = d3.event.touches.item(0);
                var touch1 = d3.event.touches.item(1);
                var a = touch0['pageY']-touch1['pageY'];
                var b = touch0['pageX']-touch1['pageX'];

                var offset = $("#chart").offset();
                var scrollPos = [$("#chart").scrollLeft(),$("#chart").scrollTop()];
                startTouchCenter = [
                    (touch1['pageX']+(b/2)-offset.left+scrollPos[0])/scaleFactor,
                    (touch1['pageY']+(a/2)-offset.top+scrollPos[1])/scaleFactor
                ];
                moveTouchCenter = [
                    touch1['pageX']+(b/2),
                    touch1['pageY']+(a/2)
                ]
                startTouchDistance = Math.sqrt((a*a)+(b*b));
            } else {
                var obj = d3.select(document.body);
                touch0 = d3.event.touches.item(0);
                var pos = [touch0.pageX,touch0.pageY];
                startTouchCenter = [touch0.pageX,touch0.pageY];
                startTouchDistance = 0;
                var point = d3.touches(this)[0];
                touchStartTime = setTimeout(function() {
                    touchStartTime = null;
                    showTouchMenu(obj,pos);
                    //lasso = vis.append('rect')
                    //    .attr("ox",point[0])
                    //    .attr("oy",point[1])
                    //    .attr("rx",2)
                    //    .attr("ry",2)
                    //    .attr("x",point[0])
                    //    .attr("y",point[1])
                    //    .attr("width",0)
                    //    .attr("height",0)
                    //    .attr("class","lasso");
                    //outer_background.attr("fill","#e3e3f3");
                },touchLongPressTimeout);
            }
        })
        .on("touchmove", function(){
                if  (RED.touch.radialMenu.active()) {
                    d3.event.preventDefault();
                    return;
                }
                var touch0;
                if (d3.event.touches.length<2) {
                    if (touchStartTime) {
                        touch0 = d3.event.touches.item(0);
                        var dx = (touch0.pageX-startTouchCenter[0]);
                        var dy = (touch0.pageY-startTouchCenter[1]);
                        var d = Math.abs(dx*dx+dy*dy);
                        if (d > 64) {
                            clearTimeout(touchStartTime);
                            touchStartTime = null;
                        }
                    } else if (lasso) {
                        d3.event.preventDefault();
                    }
                    canvasMouseMove.call(this);
                } else {
                    touch0 = d3.event.touches.item(0);
                    var touch1 = d3.event.touches.item(1);
                    var a = touch0['pageY']-touch1['pageY'];
                    var b = touch0['pageX']-touch1['pageX'];
                    var offset = $("#chart").offset();
                    var scrollPos = [$("#chart").scrollLeft(),$("#chart").scrollTop()];
                    var moveTouchDistance = Math.sqrt((a*a)+(b*b));
                    var touchCenter = [
                        touch1['pageX']+(b/2),
                        touch1['pageY']+(a/2)
                    ];

                    if (!isNaN(moveTouchDistance)) {
                        oldScaleFactor = scaleFactor;
                        scaleFactor = Math.min(2,Math.max(0.3, scaleFactor + (Math.floor(((moveTouchDistance*100)-(startTouchDistance*100)))/10000)));

                        var deltaTouchCenter = [                             // Try to pan whilst zooming - not 100%
                            startTouchCenter[0]*(scaleFactor-oldScaleFactor),//-(touchCenter[0]-moveTouchCenter[0]),
                            startTouchCenter[1]*(scaleFactor-oldScaleFactor) //-(touchCenter[1]-moveTouchCenter[1])
                        ];

                        startTouchDistance = moveTouchDistance;
                        moveTouchCenter = touchCenter;

                        $("#chart").scrollLeft(scrollPos[0]+deltaTouchCenter[0]);
                        $("#chart").scrollTop(scrollPos[1]+deltaTouchCenter[1]);
                        redraw();
                    }
                }
        });

    var outer_background = vis.append('svg:rect')
        .attr('width', space_width)
        .attr('height', space_height)
        .attr('fill','#fff');

    //var gridScale = d3.scale.linear().range([0,2000]).domain([0,2000]);
    //var grid = vis.append('g');
    //
    //grid.selectAll("line.horizontal").data(gridScale.ticks(100)).enter()
    //    .append("line")
    //        .attr(
    //        {
    //            "class":"horizontal",
    //            "x1" : 0,
    //            "x2" : 2000,
    //            "y1" : function(d){ return gridScale(d);},
    //            "y2" : function(d){ return gridScale(d);},
    //            "fill" : "none",
    //            "shape-rendering" : "crispEdges",
    //            "stroke" : "#eee",
    //            "stroke-width" : "1px"
    //        });
    //grid.selectAll("line.vertical").data(gridScale.ticks(100)).enter()
    //    .append("line")
    //        .attr(
    //        {
    //            "class":"vertical",
    //            "y1" : 0,
    //            "y2" : 2000,
    //            "x1" : function(d){ return gridScale(d);},
    //            "x2" : function(d){ return gridScale(d);},
    //            "fill" : "none",
    //            "shape-rendering" : "crispEdges",
    //            "stroke" : "#eee",
    //            "stroke-width" : "1px"
    //        });


    var drag_line = vis.append("svg:path").attr("class", "drag_line");

    var workspace_tabs = RED.tabs.create({
        id: "workspace-tabs",
        onchange: function(tab) {
            if (tab.type == "subflow") {
                $("#workspace-toolbar").show();
            } else {
                $("#workspace-toolbar").hide();
            }
            var chart = $("#chart");
            if (activeWorkspace !== 0) {
                workspaceScrollPositions[activeWorkspace] = {
                    left:chart.scrollLeft(),
                    top:chart.scrollTop()
                };
            }
            var scrollStartLeft = chart.scrollLeft();
            var scrollStartTop = chart.scrollTop();

            activeWorkspace = tab.id;
            if (workspaceScrollPositions[activeWorkspace]) {
                chart.scrollLeft(workspaceScrollPositions[activeWorkspace].left);
                chart.scrollTop(workspaceScrollPositions[activeWorkspace].top);
            } else {
                chart.scrollLeft(0);
                chart.scrollTop(0);
            }
            var scrollDeltaLeft = chart.scrollLeft() - scrollStartLeft;
            var scrollDeltaTop = chart.scrollTop() - scrollStartTop;
            if (mouse_position != null) {
                mouse_position[0] += scrollDeltaLeft;
                mouse_position[1] += scrollDeltaTop;
            }

            clearSelection();
            RED.nodes.eachNode(function(n) {
                    n.dirty = true;
            });
            redraw();
        },
        ondblclick: function(tab) {
            showRenameWorkspaceDialog(tab.id);
        },
        onadd: function(tab) {
            RED.menu.addItem("btn-workspace-menu",{
                id:"btn-workspace-menu-"+tab.id.replace(".","-"),
                label:tab.label,
                onselect:function() {
                    workspace_tabs.activateTab(tab.id);
                }
            });
            RED.menu.setDisabled("btn-workspace-delete",workspace_tabs.count() == 1);
        },
        onremove: function(tab) {
            RED.menu.setDisabled("btn-workspace-delete",workspace_tabs.count() == 1);
            RED.menu.removeItem("btn-workspace-menu-"+tab.id.replace(".","-"));
        }
    });

    var workspaceIndex = 0;

    function addWorkspace() {
        var tabId = RED.nodes.id();
        do {
            workspaceIndex += 1;
        } while($("#workspace-tabs a[title='Sheet "+workspaceIndex+"']").size() !== 0);

        var ws = {type:"tab",id:tabId,label:"Sheet "+workspaceIndex};
        RED.nodes.addWorkspace(ws);
        workspace_tabs.addTab(ws);
        workspace_tabs.activateTab(tabId);
        RED.history.push({t:'add',workspaces:[ws],dirty:dirty});
        RED.view.dirty(true);
    }
    $(function() {
        $('#btn-workspace-add-tab').on("click",addWorkspace);
        $('#btn-workspace-add').on("click",addWorkspace);
        $('#btn-workspace-edit').on("click",function() {
            showRenameWorkspaceDialog(activeWorkspace);
        });
        $('#btn-workspace-delete').on("click",function() {
            deleteWorkspace(activeWorkspace);
        });
    });

    function deleteWorkspace(id) {
        if (workspace_tabs.count() == 1) {
            return;
        }
        var ws = RED.nodes.workspace(id);
        $( "#node-dialog-delete-workspace" ).dialog('option','workspace',ws);
        $( "#node-dialog-delete-workspace-name" ).text(ws.label);
        $( "#node-dialog-delete-workspace" ).dialog('open');
    }

    function canvasMouseDown() {
        if (!mousedown_node && !mousedown_link) {
            selected_link = null;
            updateSelection();
        }
        if (mouse_mode === 0) {
            if (lasso) {
                lasso.remove();
                lasso = null;
            }
            
            if (!touchStartTime) {
                var point = d3.mouse(this);
                lasso = vis.append('rect')
                    .attr("ox",point[0])
                    .attr("oy",point[1])
                    .attr("rx",2)
                    .attr("ry",2)
                    .attr("x",point[0])
                    .attr("y",point[1])
                    .attr("width",0)
                    .attr("height",0)
                    .attr("class","lasso");
                d3.event.preventDefault();
            }
        }
    }

    function canvasMouseMove() {
        mouse_position = d3.touches(this)[0]||d3.mouse(this);

        // Prevent touch scrolling...
        //if (d3.touches(this)[0]) {
        //    d3.event.preventDefault();
        //}

        // TODO: auto scroll the container
        //var point = d3.mouse(this);
        //if (point[0]-container.scrollLeft < 30 && container.scrollLeft > 0) { container.scrollLeft -= 15; }
        //console.log(d3.mouse(this),container.offsetWidth,container.offsetHeight,container.scrollLeft,container.scrollTop);

        if (lasso) {
            var ox = parseInt(lasso.attr("ox"));
            var oy = parseInt(lasso.attr("oy"));
            var x = parseInt(lasso.attr("x"));
            var y = parseInt(lasso.attr("y"));
            var w;
            var h;
            if (mouse_position[0] < ox) {
                x = mouse_position[0];
                w = ox-x;
            } else {
                w = mouse_position[0]-x;
            }
            if (mouse_position[1] < oy) {
                y = mouse_position[1];
                h = oy-y;
            } else {
                h = mouse_position[1]-y;
            }
            lasso
                .attr("x",x)
                .attr("y",y)
                .attr("width",w)
                .attr("height",h)
            ;
            return;
        }

        if (mouse_mode != RED.state.IMPORT_DRAGGING && !mousedown_node && selected_link == null) {
            return;
        }

        var mousePos;
        if (mouse_mode == RED.state.JOINING) {
            // update drag line
            drag_line.attr("class", "drag_line");
            mousePos = mouse_position;
            var numOutputs = (mousedown_port_type === 0)?(mousedown_node.outputs || 1):1;
            var sourcePort = mousedown_port_index;
            var portY = -((numOutputs-1)/2)*13 +13*sourcePort;

            var sc = (mousedown_port_type === 0)?1:-1;

            var dy = mousePos[1]-(mousedown_node.y+portY);
            var dx = mousePos[0]-(mousedown_node.x+sc*mousedown_node.w/2);
            var delta = Math.sqrt(dy*dy+dx*dx);
            var scale = lineCurveScale;
            var scaleY = 0;

            if (delta < node_width) {
                scale = 0.75-0.75*((node_width-delta)/node_width);
            }
            if (dx*sc < 0) {
                scale += 2*(Math.min(5*node_width,Math.abs(dx))/(5*node_width));
                if (Math.abs(dy) < 3*node_height) {
                    scaleY = ((dy>0)?0.5:-0.5)*(((3*node_height)-Math.abs(dy))/(3*node_height))*(Math.min(node_width,Math.abs(dx))/(node_width)) ;
                }
            }

            drag_line.attr("d",
                "M "+(mousedown_node.x+sc*mousedown_node.w/2)+" "+(mousedown_node.y+portY)+
                " C "+(mousedown_node.x+sc*(mousedown_node.w/2+node_width*scale))+" "+(mousedown_node.y+portY+scaleY*node_height)+" "+
                (mousePos[0]-sc*(scale)*node_width)+" "+(mousePos[1]-scaleY*node_height)+" "+
                mousePos[0]+" "+mousePos[1]
                );
            d3.event.preventDefault();
        } else if (mouse_mode == RED.state.MOVING) {
		//console.log("node mouse moving");
            mousePos = mouse_position;
            var d = (mouse_offset[0]-mousePos[0])*(mouse_offset[0]-mousePos[0]) + (mouse_offset[1]-mousePos[1])*(mouse_offset[1]-mousePos[1]);
            if (d > 2) {
                mouse_mode = RED.state.MOVING_ACTIVE;
                clickElapsed = 0;
            }
        } else if (mouse_mode == RED.state.MOVING_ACTIVE || mouse_mode == RED.state.IMPORT_DRAGGING) {
		//console.log("node mouse moving active or IMPORT_DRAGGING");
            mousePos = mouse_position;
            var node;
            var i;
            var minX = 0;
            var minY = 0;
            for (var n = 0; n<moving_set.length; n++) {
                node = moving_set[n];
                if (d3.event.shiftKey) {
                    node.n.ox = node.n.x;
                    node.n.oy = node.n.y;
                }
                node.n.x = mousePos[0]+node.dx;
                node.n.y = mousePos[1]+node.dy;
                node.n.dirty = true;
                minX = Math.min(node.n.x-node.n.w/2-5,minX);
                minY = Math.min(node.n.y-node.n.h/2-5,minY);
            }
            if (minX !== 0 || minY !== 0) {
                for (i = 0; i<moving_set.length; i++) {
                    node = moving_set[i];
                    node.n.x -= minX;
                    node.n.y -= minY;
                }
            }
            if (d3.event.shiftKey && moving_set.length > 0) {
                var gridOffset =  [0,0];
                node = moving_set[0];
                gridOffset[0] = node.n.x-(20*Math.floor((node.n.x-node.n.w/2)/20)+node.n.w/2);
                gridOffset[1] = node.n.y-(20*Math.floor(node.n.y/20));
                if (gridOffset[0] !== 0 || gridOffset[1] !== 0) {
                    for (i = 0; i<moving_set.length; i++) {
                        node = moving_set[i];
                        node.n.x -= gridOffset[0];
                        node.n.y -= gridOffset[1];
                        if (node.n.x == node.n.ox && node.n.y == node.n.oy) {
                            node.dirty = false;
                        }
                    }
                }
            }
        }
        redraw();
    }

    function canvasMouseUp() {
        if (mousedown_node && mouse_mode == RED.state.JOINING) {
            drag_line.attr("class", "drag_line_hidden");
        }
        if (lasso) {
            var x = parseInt(lasso.attr("x"));
            var y = parseInt(lasso.attr("y"));
            var x2 = x+parseInt(lasso.attr("width"));
            var y2 = y+parseInt(lasso.attr("height"));
            if (!d3.event.ctrlKey) {
                clearSelection();
            }
            RED.nodes.eachNode(function(n) {
                if (n.z == activeWorkspace && !n.selected) {
                    n.selected = (n.x > x && n.x < x2 && n.y > y && n.y < y2);
                    if (n.selected) {
                        n.dirty = true;
                        moving_set.push({n:n});
                    }
                }
            });
            updateSelection();
            lasso.remove();
            lasso = null;
        } else if (mouse_mode == RED.state.DEFAULT && mousedown_link == null && !d3.event.ctrlKey ) {
            clearSelection();
            updateSelection();
        }
        if (mouse_mode == RED.state.MOVING_ACTIVE) {
		//console.log("node moved active.");
		//CSS setting view dirty if the node was moved 
		//RED.view.dirty(true);
            if (moving_set.length > 0) {
                var ns = [];
                for (var j=0;j<moving_set.length;j++) {
                    ns.push({n:moving_set[j].n,ox:moving_set[j].ox,oy:moving_set[j].oy});
                }
                RED.history.push({t:'move',nodes:ns,dirty:dirty});
            }
        }
        if (mouse_mode == RED.state.MOVING || mouse_mode == RED.state.MOVING_ACTIVE) {
		//console.log("node moving or MOVING_ACTIVE.");
            for (var i=0;i<moving_set.length;i++) {
                delete moving_set[i].ox;
                delete moving_set[i].oy;
            }
        }
        if (mouse_mode == RED.state.IMPORT_DRAGGING) {
            RED.keyboard.remove(/* ESCAPE */ 27);
            setDirty(true);
        }
        redraw();
        // clear mouse event vars
        resetMouseVars();
    }

    $('#btn-zoom-out').click(function() {zoomOut();});
    $('#btn-zoom-zero').click(function() {zoomZero();});
    $('#btn-zoom-in').click(function() {zoomIn();});
    $("#chart").on('DOMMouseScroll mousewheel', function (evt) {
        if ( evt.altKey ) {
            evt.preventDefault();
            evt.stopPropagation();
            var move = -(evt.originalEvent.detail) || evt.originalEvent.wheelDelta;
            if (move <= 0) { zoomOut(); }
            else { zoomIn(); }
        }
    });
    $("#chart").droppable({
            accept:".palette_node",
            drop: function( event, ui ) {
                d3.event = event;
                var selected_tool = ui.draggable[0].type;
                var mousePos = d3.touches(this)[0]||d3.mouse(this);
                mousePos[1] += this.scrollTop;
                mousePos[0] += this.scrollLeft;
                mousePos[1] /= scaleFactor;
                mousePos[0] /= scaleFactor;

                var nn = { id:(1+Math.random()*4294967295).toString(16),x: mousePos[0],y:mousePos[1],w:node_width,z:activeWorkspace};

                nn.type = selected_tool;
                nn._def = RED.nodes.getType(nn.type);
                nn.outputs = nn._def.outputs;
                nn.changed = true;

                for (var d in nn._def.defaults) {
                    if (nn._def.defaults.hasOwnProperty(d)) {
                        nn[d] = nn._def.defaults[d].value;
                    }
                }

                if (nn._def.onadd) {
                    nn._def.onadd.call(nn);
                }

                nn.h = Math.max(node_height,(nn.outputs||0) * 15);
                RED.history.push({t:'add',nodes:[nn.id],dirty:dirty});
                RED.nodes.add(nn);
                RED.editor.validateNode(nn);
                setDirty(true);
                // auto select dropped node - so info shows (if visible)
                clearSelection();
                nn.selected = true;
                moving_set.push({n:nn});
                updateSelection();
                redraw();

                if (nn._def.autoedit) {
                    RED.editor.edit(nn);
                }
            }
    });

    function zoomIn() {
        if (scaleFactor < 2) {
            scaleFactor += 0.1;
            redraw();
        }
    }
    function zoomOut() {
        if (scaleFactor > 0.3) {
            scaleFactor -= 0.1;
            redraw();
        }
    }
    function zoomZero() {
        scaleFactor = 1;
        redraw();
    }

    function selectAll() {
        RED.nodes.eachNode(function(n) {
            if (n.z == activeWorkspace) {
                if (!n.selected) {
                    n.selected = true;
                    n.dirty = true;
                    moving_set.push({n:n});
                }
            }
        });
        selected_link = null;
        updateSelection();
        redraw();
    }

    function clearSelection() {
        for (var i=0;i<moving_set.length;i++) {
            var n = moving_set[i];
            n.n.dirty = true;
            n.n.selected = false;
        }
        moving_set = [];
        selected_link = null;
    }

    function updateSelection() {
        if (moving_set.length === 0) {
            RED.menu.setDisabled("btn-export-menu",true);
            RED.menu.setDisabled("btn-export-clipboard",true);
            RED.menu.setDisabled("btn-export-library",true);
        } else {
            RED.menu.setDisabled("btn-export-menu",false);
            RED.menu.setDisabled("btn-export-clipboard",false);
            RED.menu.setDisabled("btn-export-library",false);
        }
        if (moving_set.length === 0 && selected_link == null) {
            //RED.keyboard.remove(/* backspace */ 8);
            RED.keyboard.remove(/* delete */ 46);
            RED.keyboard.remove(/* c */ 67);
            RED.keyboard.remove(/* x */ 88);
        } else {
            //RED.keyboard.add(/* backspace */ 8,function(){deleteSelection();d3.event.preventDefault();});
            RED.keyboard.add(/* delete */ 46,function(){deleteSelection();d3.event.preventDefault();});
            RED.keyboard.add(/* c */ 67,{ctrl:true},function(){copySelection();d3.event.preventDefault();});
            RED.keyboard.add(/* x */ 88,{ctrl:true},function(){copySelection();deleteSelection();d3.event.preventDefault();});
        }
        if (moving_set.length === 0) {
            RED.keyboard.remove(/* up   */ 38);
            RED.keyboard.remove(/* down */ 40);
            RED.keyboard.remove(/* left */ 37);
            RED.keyboard.remove(/* right*/ 39);
        } else {
            RED.keyboard.add(/* up   */ 38, function() { if(d3.event.shiftKey){moveSelection(  0,-20)}else{moveSelection( 0,-1);}d3.event.preventDefault();},endKeyboardMove);
            RED.keyboard.add(/* down */ 40, function() { if(d3.event.shiftKey){moveSelection(  0, 20)}else{moveSelection( 0, 1);}d3.event.preventDefault();},endKeyboardMove);
            RED.keyboard.add(/* left */ 37, function() { if(d3.event.shiftKey){moveSelection(-20,  0)}else{moveSelection(-1, 0);}d3.event.preventDefault();},endKeyboardMove);
            RED.keyboard.add(/* right*/ 39, function() { if(d3.event.shiftKey){moveSelection( 20,  0)}else{moveSelection( 1, 0);}d3.event.preventDefault();},endKeyboardMove);
        }
        if (moving_set.length == 1) {
            RED.sidebar.info.refresh(moving_set[0].n);
        } else {
            RED.sidebar.info.clear();
        }
    }
    function endKeyboardMove() {
	//console.log("end keyboard move.");
	//CSS setting view dirty if the node was moved 
	//RED.view.dirty(true);
        var ns = [];
        for (var i=0;i<moving_set.length;i++) {
            ns.push({n:moving_set[i].n,ox:moving_set[i].ox,oy:moving_set[i].oy});
            delete moving_set[i].ox;
            delete moving_set[i].oy;
        }
        RED.history.push({t:'move',nodes:ns,dirty:dirty});
    }
    function moveSelection(dx,dy) {
        var minX = 0;
        var minY = 0;
        var node;
        
        for (var i=0;i<moving_set.length;i++) {
            node = moving_set[i];
            if (node.ox == null && node.oy == null) {
                node.ox = node.n.x;
                node.oy = node.n.y;
            }
            node.n.x += dx;
            node.n.y += dy;
            node.n.dirty = true;
            minX = Math.min(node.n.x-node.n.w/2-5,minX);
            minY = Math.min(node.n.y-node.n.h/2-5,minY);
        }

        if (minX !== 0 || minY !== 0) {
            for (var n = 0; n<moving_set.length; n++) {
                node = moving_set[n];
                node.n.x -= minX;
                node.n.y -= minY;
            }
        }

        redraw();
    }
    function deleteSelection() {
        var removedNodes = [];
        var removedLinks = [];
        var startDirty = dirty;
        if (moving_set.length > 0) {
            for (var i=0;i<moving_set.length;i++) {
                var node = moving_set[i].n;
                node.selected = false;
                if (node.x < 0) {
                    node.x = 25
                }
                var rmlinks = RED.nodes.remove(node.id);
                removedNodes.push(node);
                removedLinks = removedLinks.concat(rmlinks);
            }
            moving_set = [];
            setDirty(true);
        }
        if (selected_link) {
            RED.nodes.removeLink(selected_link);
            removedLinks.push(selected_link);
            setDirty(true);
        }
        RED.history.push({t:'delete',nodes:removedNodes,links:removedLinks,dirty:startDirty});

        selected_link = null;
        updateSelection();
        redraw();
    }

    function copySelection() {
        if (moving_set.length > 0) {
            var nns = [];
            for (var n=0;n<moving_set.length;n++) {
                var node = moving_set[n].n;
                nns.push(RED.nodes.convertNode(node));
            }
            clipboard = JSON.stringify(nns);
            RED.notify(moving_set.length+" node"+(moving_set.length>1?"s":"")+" copied");
        }
    }


    function calculateTextWidth(str) {
        var sp = document.createElement("span");
        sp.className = "node_label";
        sp.style.position = "absolute";
        sp.style.top = "-1000px";
        sp.innerHTML = (str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        document.body.appendChild(sp);
        var w = sp.offsetWidth;
        document.body.removeChild(sp);
        return 50+w;
    }

    function resetMouseVars() {
        mousedown_node = null;
        mouseup_node = null;
        mousedown_link = null;
        mouse_mode = 0;
        mousedown_port_type = 0;
    }

    function portMouseDown(d,portType,portIndex) {
        // disable zoom
        //vis.call(d3.behavior.zoom().on("zoom"), null);
        mousedown_node = d;
        selected_link = null;
        mouse_mode = RED.state.JOINING;
        mousedown_port_type = portType;
        mousedown_port_index = portIndex || 0;
        document.body.style.cursor = "crosshair";
        d3.event.preventDefault();
    }

    function portMouseUp(d,portType,portIndex) {
        document.body.style.cursor = "";
        if (mouse_mode == RED.state.JOINING && mousedown_node) {
            if (typeof TouchEvent != "undefined" && d3.event instanceof TouchEvent) {
                RED.nodes.eachNode(function(n) {
                        if (n.z == activeWorkspace) {
                            var hw = n.w/2;
                            var hh = n.h/2;
                            if (n.x-hw<mouse_position[0] && n.x+hw> mouse_position[0] &&
                                n.y-hh<mouse_position[1] && n.y+hh>mouse_position[1]) {
                                    mouseup_node = n;
                                    portType = mouseup_node._def.inputs>0?1:0;
                                    portIndex = 0;
                            }
                        }
                });
            } else {
                mouseup_node = d;
            }
            if (portType == mousedown_port_type || mouseup_node === mousedown_node) {
                drag_line.attr("class", "drag_line_hidden");
                resetMouseVars();
                return;
            }
            var src,dst,src_port;
            if (mousedown_port_type === 0) {
                src = mousedown_node;
                src_port = mousedown_port_index;
                dst = mouseup_node;
            } else if (mousedown_port_type == 1) {
                src = mouseup_node;
                dst = mousedown_node;
                src_port = portIndex;
            }

            var existingLink = false;
            RED.nodes.eachLink(function(d) {
                    existingLink = existingLink || (d.source === src && d.target === dst && d.sourcePort == src_port);
            });
            if (!existingLink) {
                var link = {source: src, sourcePort:src_port, target: dst};
                RED.nodes.addLink(link);
                RED.history.push({t:'add',links:[link],dirty:dirty});
                setDirty(true);
            }
            selected_link = null;
            redraw();
        }
    }

    function nodeMouseUp(d) {
        if (dblClickPrimed && mousedown_node == d && clickElapsed > 0 && clickElapsed < 750) {
            RED.editor.edit(d);
            clickElapsed = 0;
            d3.event.stopPropagation();
            return;
        }
        portMouseUp(d, d._def.inputs > 0 ? 1 : 0, 0);
    }

    function nodeMouseDown(d) {
        //var touch0 = d3.event;
        //var pos = [touch0.pageX,touch0.pageY];
        //RED.touch.radialMenu.show(d3.select(this),pos);
        if (mouse_mode == RED.state.IMPORT_DRAGGING) {
            RED.keyboard.remove(/* ESCAPE */ 27);
            updateSelection();
            setDirty(true);
            redraw();
            resetMouseVars();
            d3.event.stopPropagation();
            return;
        }
        mousedown_node = d;
        var now = Date.now();
        clickElapsed = now-clickTime;
        clickTime = now;

        dblClickPrimed = (lastClickNode == mousedown_node);
        lastClickNode = mousedown_node;
        
        var i;
        
        if (d.selected && d3.event.ctrlKey) {
            d.selected = false;
            for (i=0;i<moving_set.length;i+=1) {
                if (moving_set[i].n === d) {
                    moving_set.splice(i,1);
                    break;
                }
            }
        } else {
            if (d3.event.shiftKey) {
                clearSelection();
                var cnodes = RED.nodes.getAllFlowNodes(mousedown_node);
                for (var n=0;n<cnodes.length;n++) {
                    cnodes[n].selected = true;
                    cnodes[n].dirty = true;
                    moving_set.push({n:cnodes[n]});
                }
            } else if (!d.selected) {
                if (!d3.event.ctrlKey) {
                    clearSelection();
                }
                mousedown_node.selected = true;
                moving_set.push({n:mousedown_node});
            }
            selected_link = null;
            if (d3.event.button != 2) {
                mouse_mode = RED.state.MOVING;
                var mouse = d3.touches(this)[0]||d3.mouse(this);
                mouse[0] += d.x-d.w/2;
                mouse[1] += d.y-d.h/2;
                for (i=0;i<moving_set.length;i++) {
                    moving_set[i].ox = moving_set[i].n.x;
                    moving_set[i].oy = moving_set[i].n.y;
                    moving_set[i].dx = moving_set[i].n.x-mouse[0];
                    moving_set[i].dy = moving_set[i].n.y-mouse[1];
                }
                mouse_offset = d3.mouse(document.body);
                if (isNaN(mouse_offset[0])) {
                    mouse_offset = d3.touches(document.body)[0];
                }
            }
        }
        d.dirty = true;
        updateSelection();
        redraw();
        d3.event.stopPropagation();
    }

    function nodeButtonClicked(d) {
        if (d._def.button.toggle) {
            d[d._def.button.toggle] = !d[d._def.button.toggle];
            d.dirty = true;
        }
        if (d._def.button.onclick) {
            d._def.button.onclick.call(d);
        }
        if (d.dirty) {
            redraw();
        }
        d3.event.preventDefault();
    }

    function showTouchMenu(obj,pos) {
        var mdn = mousedown_node;
        var options = [];
        options.push({name:"delete",disabled:(moving_set.length===0),onselect:function() {deleteSelection();}});
        options.push({name:"cut",disabled:(moving_set.length===0),onselect:function() {copySelection();deleteSelection();}});
        options.push({name:"copy",disabled:(moving_set.length===0),onselect:function() {copySelection();}});
        options.push({name:"paste",disabled:(clipboard.length===0),onselect:function() {importNodes(clipboard,true);}});
        options.push({name:"edit",disabled:(moving_set.length != 1),onselect:function() { RED.editor.edit(mdn);}});
        options.push({name:"select",onselect:function() {selectAll();}});
        options.push({name:"undo",disabled:(RED.history.depth() === 0),onselect:function() {RED.history.pop();}});
        
        RED.touch.radialMenu.show(obj,pos,options);
        resetMouseVars();
    }
    function redraw() {
        vis.attr("transform","scale("+scaleFactor+")");
        outer.attr("width", space_width*scaleFactor).attr("height", space_height*scaleFactor);

        if (mouse_mode != RED.state.JOINING) {
            // Don't bother redrawing nodes if we're drawing links

            var node = vis.selectAll(".nodegroup").data(RED.nodes.nodes.filter(function(d) { return d.z == activeWorkspace }),function(d){return d.id});
            node.exit().remove();

            var nodeEnter = node.enter().insert("svg:g").attr("class", "node nodegroup");
            nodeEnter.each(function(d,i) {
                    var node = d3.select(this);
                    node.attr("id",d.id);
                    var l = d._def.label;
                    l = (typeof l === "function" ? l.call(d) : l)||"";
                    d.w = Math.max(node_width,calculateTextWidth(l)+(d._def.inputs>0?7:0) );
                    d.h = Math.max(node_height,(d.outputs||0) * 15);

                    if (d._def.badge) {
                        var badge = node.append("svg:g").attr("class","node_badge_group");
                        var badgeRect = badge.append("rect").attr("class","node_badge").attr("rx",5).attr("ry",5).attr("width",40).attr("height",15);
                        badge.append("svg:text").attr("class","node_badge_label").attr("x",35).attr("y",11).attr('text-anchor','end').text(d._def.badge());
                        if (d._def.onbadgeclick) {
                            badgeRect.attr("cursor","pointer")
                                .on("click",function(d) { d._def.onbadgeclick.call(d);d3.event.preventDefault();});
                        }
                    }

                    if (d._def.button) {
                        var nodeButtonGroup = node.append('svg:g')
                            .attr("transform",function(d) { return "translate("+((d._def.align == "right") ? 94 : -25)+",2)"; })
                            .attr("class",function(d) { return "node_button "+((d._def.align == "right") ? "node_right_button" : "node_left_button"); });
                        nodeButtonGroup.append('rect')
                            .attr("rx",8)
                            .attr("ry",8)
                            .attr("width",32)
                            .attr("height",node_height-4)
                            .attr("fill","#eee");//function(d) { return d._def.color;})
                        nodeButtonGroup.append('rect')
                            .attr("x",function(d) { return d._def.align == "right"? 10:5})
                            .attr("y",4)
                            .attr("rx",5)
                            .attr("ry",5)
                            .attr("width",16)
                            .attr("height",node_height-12)
                            .attr("fill",function(d) { return d._def.color;})
                            .attr("cursor","pointer")
                            .on("mousedown",function(d) {if (!lasso) { d3.select(this).attr("fill-opacity",0.2);d3.event.preventDefault(); d3.event.stopPropagation();}})
                            .on("mouseup",function(d) {if (!lasso) { d3.select(this).attr("fill-opacity",0.4);d3.event.preventDefault();d3.event.stopPropagation();}})
                            .on("mouseover",function(d) {if (!lasso) { d3.select(this).attr("fill-opacity",0.4);}})
                            .on("mouseout",function(d) {if (!lasso) {
                                var op = 1;
                                if (d._def.button.toggle) {
                                    op = d[d._def.button.toggle]?1:0.2;
                                }
                                d3.select(this).attr("fill-opacity",op);
                            }})
                            .on("click",nodeButtonClicked)
                            .on("touchstart",nodeButtonClicked)
                    }

                    var mainRect = node.append("rect")
                        .attr("class", "node")
                        .classed("node_unknown",function(d) { return d.type == "unknown"; })
                        .attr("rx", 6)
                        .attr("ry", 6)
                        .attr("fill",function(d) { return d._def.color;})
                        .on("mouseup",nodeMouseUp)
                        .on("mousedown",nodeMouseDown)
                        .on("touchstart",function(d) {
                            var obj = d3.select(this);
                            var touch0 = d3.event.touches.item(0);
                            var pos = [touch0.pageX,touch0.pageY];
                            startTouchCenter = [touch0.pageX,touch0.pageY];
                            startTouchDistance = 0;
                            touchStartTime = setTimeout(function() {
                                showTouchMenu(obj,pos);
                            },touchLongPressTimeout);
                            nodeMouseDown.call(this,d)       
                        })
                        .on("touchend", function(d) {
                            clearTimeout(touchStartTime);
                            touchStartTime = null;
                            if  (RED.touch.radialMenu.active()) {
                                d3.event.stopPropagation();
                                return;
                            }
                            nodeMouseUp.call(this,d);
                        })
                        .on("mouseover",function(d) {
                                if (mouse_mode === 0) {
                                    var node = d3.select(this);
                                    node.classed("node_hovered",true);
                                }
                        })
                        .on("mouseout",function(d) {
                                var node = d3.select(this);
                                node.classed("node_hovered",false);
                        });

                   //node.append("rect").attr("class", "node-gradient-top").attr("rx", 6).attr("ry", 6).attr("height",30).attr("stroke","none").attr("fill","url(#gradient-top)").style("pointer-events","none");
                   //node.append("rect").attr("class", "node-gradient-bottom").attr("rx", 6).attr("ry", 6).attr("height",30).attr("stroke","none").attr("fill","url(#gradient-bottom)").style("pointer-events","none");

                    if (d._def.icon) {
                        
                        var icon_group = node.append("g")
                            .attr("class","node_icon_group")
                            .attr("x",0).attr("y",0);
                        
                        var icon_shade = icon_group.append("rect")
                            .attr("x",0).attr("y",0)
                            .attr("class","node_icon_shade")
                            .attr("width","30")
                            .attr("stroke","none")
                            .attr("fill","#000")
                            .attr("fill-opacity","0.05")
                            .attr("height",function(d){return Math.min(50,d.h-4);});
                            
                        var icon = icon_group.append("image")
                            .attr("xlink:href","icons/"+d._def.icon)
                            .attr("class","node_icon")
                            .attr("x",0)
                            .attr("width","30")
                            .attr("height","30");
                            
                        var icon_shade_border = icon_group.append("path")
                            .attr("d",function(d) { return "M 30 1 l 0 "+(d.h-2)})
                            .attr("class","node_icon_shade_border")
                            .attr("stroke-opacity","0.1")
                            .attr("stroke","#000")
                            .attr("stroke-width","2");

                        if ("right" == d._def.align) {
                            icon_group.attr('class','node_icon_group node_icon_group_'+d._def.align);
                            icon_shade_border.attr("d",function(d) { return "M 0 1 l 0 "+(d.h-2)})
                            //icon.attr('class','node_icon node_icon_'+d._def.align);
                            //icon.attr('class','node_icon_shade node_icon_shade_'+d._def.align);
                            //icon.attr('class','node_icon_shade_border node_icon_shade_border_'+d._def.align);
                        }
                        
                        //if (d._def.inputs > 0 && d._def.align == null) {
                        //    icon_shade.attr("width",35);
                        //    icon.attr("transform","translate(5,0)");
                        //    icon_shade_border.attr("transform","translate(5,0)");
                        //}
                        //if (d._def.outputs > 0 && "right" == d._def.align) {
                        //    icon_shade.attr("width",35); //icon.attr("x",5);
                        //}
                        
                        var img = new Image();
                        img.src = "icons/"+d._def.icon;
                        img.onload = function() {
                            icon.attr("width",Math.min(img.width,30));
                            icon.attr("height",Math.min(img.height,30));
                            icon.attr("x",15-Math.min(img.width,30)/2);
                            //if ("right" == d._def.align) {
                            //    icon.attr("x",function(d){return d.w-img.width-1-(d.outputs>0?5:0);});
                            //    icon_shade.attr("x",function(d){return d.w-30});
                            //    icon_shade_border.attr("d",function(d){return "M "+(d.w-30)+" 1 l 0 "+(d.h-2);});
                            //}
                        }
                        
                        //icon.style("pointer-events","none");
                        icon_group.style("pointer-events","none");
                    }
                    var text = node.append('svg:text').attr('class','node_label').attr('x', 38).attr('dy', '.35em').attr('text-anchor','start');
                    if (d._def.align) {
                        text.attr('class','node_label node_label_'+d._def.align);
                        text.attr('text-anchor','end');
                    }

                    var status = node.append("svg:g").attr("class","node_status_group").style("display","none");

                    var statusRect = status.append("rect").attr("class","node_status")
                                        .attr("x",6).attr("y",1).attr("width",9).attr("height",9)
                                        .attr("rx",2).attr("ry",2).attr("stroke-width","3");

                    var statusLabel = status.append("svg:text")
                        .attr("class","node_status_label")
                        .attr('x',20).attr('y',9)
                        .style({
                                'stroke-width': 0,
                                'fill': '#888',
                                'font-size':'9pt',
                                'stroke':'#000',
                                'text-anchor':'start'
                        });

                    var dgNumber = node.append("svg:g").attr("class","node_dgnumber_group").style("display","none");

                    /*var dgNumberRect = dgNumber.append("rect").attr("class","node_dgnumber")
                                        .attr("x",6).attr("y",-49).attr("width",9).attr("height",9)
                                        .attr("rx",2).attr("ry",2).attr("stroke-width","3");
			*/

                    var dgNumberLabel = dgNumber.append("svg:text")
                        .attr("class","node_dgnumber_label")
                        .attr('x',1).attr('y',-43)
                        .style({
                                'stroke-width': 0,
                                /*'fill': '#2E4F83',*/
                                'fill': 'blue',
                                'font-size':'12pt',
                                'stroke':'#000',
                                'text-anchor':'start'
                        });

		    var dgNumberTitle = dgNumber.append("title")
                        		.attr("class","node_dgnumber_title");

                    //node.append("circle").attr({"class":"centerDot","cx":0,"cy":0,"r":5});

                    if (d._def.inputs > 0) {
                        text.attr("x",38);
                        node.append("rect").attr("class","port port_input").attr("rx",3).attr("ry",3).attr("x",-5).attr("width",10).attr("height",10)
                            .on("mousedown",function(d){portMouseDown(d,1,0);})
                            .on("touchstart",function(d){portMouseDown(d,1,0);})
                            .on("mouseup",function(d){portMouseUp(d,1,0);} )
                            .on("touchend",function(d){portMouseUp(d,1,0);} )
                            .on("mouseover",function(d) { var port = d3.select(this); port.classed("port_hovered",(mouse_mode!=RED.state.JOINING || mousedown_port_type != 1 ));})
                            .on("mouseout",function(d) { var port = d3.select(this); port.classed("port_hovered",false);})
                    }

                    //node.append("path").attr("class","node_error").attr("d","M 3,-3 l 10,0 l -5,-8 z");
                    node.append("image").attr("class","node_error hidden").attr("xlink:href","icons/node-error.png").attr("x",0).attr("y",-6).attr("width",10).attr("height",9);
                    node.append("image").attr("class","node_changed hidden").attr("xlink:href","icons/node-changed.png").attr("x",12).attr("y",-6).attr("width",10).attr("height",10);
            });

            node.each(function(d,i) {
                    if (d.dirty) {
                        //if (d.x < -50) deleteSelection();  // Delete nodes if dragged back to palette
                        if (d.resize) {
                            var l = d._def.label;
                            l = (typeof l === "function" ? l.call(d) : l)||"";
                            d.w = Math.max(node_width,calculateTextWidth(l)+(d._def.inputs>0?7:0) );
                            d.h = Math.max(node_height,(d.outputs||0) * 15);
                        }
                        var thisNode = d3.select(this);
                        //thisNode.selectAll(".centerDot").attr({"cx":function(d) { return d.w/2;},"cy":function(d){return d.h/2}});
                        thisNode.attr("transform", function(d) { return "translate(" + (d.x-d.w/2) + "," + (d.y-d.h/2) + ")"; });
                        thisNode.selectAll(".node")
                            .attr("width",function(d){return d.w})
                            .attr("height",function(d){return d.h})
                            .classed("node_selected",function(d) { return d.selected; })
                            .classed("node_highlighted",function(d) { return d.highlighted; })
                        ;
                        //thisNode.selectAll(".node-gradient-top").attr("width",function(d){return d.w});
                        //thisNode.selectAll(".node-gradient-bottom").attr("width",function(d){return d.w}).attr("y",function(d){return d.h-30});

                        thisNode.selectAll(".node_icon_group_right").attr('transform', function(d){return "translate("+(d.w-30)+",0)"});
                        thisNode.selectAll(".node_label_right").attr('x', function(d){return d.w-38});
                        //thisNode.selectAll(".node_icon_right").attr("x",function(d){return d.w-d3.select(this).attr("width")-1-(d.outputs>0?5:0);});
                        //thisNode.selectAll(".node_icon_shade_right").attr("x",function(d){return d.w-30;});
                        //thisNode.selectAll(".node_icon_shade_border_right").attr("d",function(d){return "M "+(d.w-30)+" 1 l 0 "+(d.h-2)});

                        
                        var numOutputs = d.outputs;
                        var y = (d.h/2)-((numOutputs-1)/2)*13;
                        d.ports = d.ports || d3.range(numOutputs);
                        d._ports = thisNode.selectAll(".port_output").data(d.ports);
                        d._ports.enter().append("rect").attr("class","port port_output").attr("rx",3).attr("ry",3).attr("width",10).attr("height",10)
                            .on("mousedown",(function(){var node = d; return function(d,i){portMouseDown(node,0,i);}})() )
                            .on("touchstart",(function(){var node = d; return function(d,i){portMouseDown(node,0,i);}})() )
                            .on("mouseup",(function(){var node = d; return function(d,i){portMouseUp(node,0,i);}})() )
                            .on("touchend",(function(){var node = d; return function(d,i){portMouseUp(node,0,i);}})() )
                            .on("mouseover",function(d,i) { var port = d3.select(this); port.classed("port_hovered",(mouse_mode!=RED.state.JOINING || mousedown_port_type !== 0 ));})
                            .on("mouseout",function(d,i) { var port = d3.select(this); port.classed("port_hovered",false);});
                        d._ports.exit().remove();
                        if (d._ports) {
                            numOutputs = d.outputs || 1;
                            y = (d.h/2)-((numOutputs-1)/2)*13;
                            var x = d.w - 5;
                            d._ports.each(function(d,i) {
                                    var port = d3.select(this);
                                    port.attr("y",(y+13*i)-5).attr("x",x);
                            });
                        }
                        thisNode.selectAll('text.node_label').text(function(d,i){
                                if (d._def.label) {
                                    if (typeof d._def.label == "function") {
                                        return d._def.label.call(d);
                                    } else {
                                        return d._def.label;
                                    }
                                }
                                return "";
                        })
                            .attr('y', function(d){return (d.h/2)-1;})
                            .attr('class',function(d){
                                return 'node_label'+
                                (d._def.align?' node_label_'+d._def.align:'')+
                                (d._def.labelStyle?' '+(typeof d._def.labelStyle == "function" ? d._def.labelStyle.call(d):d._def.labelStyle):'') ;
                        });
                        thisNode.selectAll(".node_tools").attr("x",function(d){return d.w-35;}).attr("y",function(d){return d.h-20;});

                        thisNode.selectAll(".node_changed")
                            .attr("x",function(d){return d.w-10})
                            .classed("hidden",function(d) { return !d.changed; });

                        thisNode.selectAll(".node_error")
                            .attr("x",function(d){return d.w-10-(d.changed?13:0)})
                            .classed("hidden",function(d) { return d.valid; });

                        thisNode.selectAll(".port_input").each(function(d,i) {
                                var port = d3.select(this);
                                port.attr("y",function(d){return (d.h/2)-5;})
                        });

                        thisNode.selectAll(".node_icon").attr("y",function(d){return (d.h-d3.select(this).attr("height"))/2;});
                        thisNode.selectAll(".node_icon_shade").attr("height",function(d){return d.h;});
                        thisNode.selectAll(".node_icon_shade_border").attr("d",function(d){ return "M "+(("right" == d._def.align) ?0:30)+" 1 l 0 "+(d.h-2)});

                        
                        thisNode.selectAll('.node_right_button').attr("transform",function(d){
                                var x = d.w-6;
                                if (d._def.button.toggle && !d[d._def.button.toggle]) {
                                    x = x - 8;
                                }
                                return "translate("+x+",2)";
                        });
                        thisNode.selectAll('.node_right_button rect').attr("fill-opacity",function(d){
                                if (d._def.button.toggle) {
                                    return d[d._def.button.toggle]?1:0.2;
                                }
                                return 1;
                        });

                        //thisNode.selectAll('.node_right_button').attr("transform",function(d){return "translate("+(d.w - d._def.button.width.call(d))+","+0+")";}).attr("fill",function(d) {
                        //         return typeof d._def.button.color  === "function" ? d._def.button.color.call(d):(d._def.button.color != null ? d._def.button.color : d._def.color)
                        //});

                        thisNode.selectAll('.node_badge_group').attr("transform",function(d){return "translate("+(d.w-40)+","+(d.h+3)+")";});
                        thisNode.selectAll('text.node_badge_label').text(function(d,i) {
                            if (d._def.badge) {
                                if (typeof d._def.badge == "function") {
                                    return d._def.badge.call(d);
                                } else {
                                    return d._def.badge;
                                }
                            }
                            return "";
                        });
                        if (!showStatus || !d.status) {
                            thisNode.selectAll('.node_status_group').style("display","none");
                        } else {
                            thisNode.selectAll('.node_status_group').style("display","inline").attr("transform","translate(3,"+(d.h+3)+")");
                            var fill = status_colours[d.status.fill]; // Only allow our colours for now
                            if (d.status.shape == null && fill == null) {
                                thisNode.selectAll('.node_status').style("display","none");
                            } else {
                                var style;
                                if (d.status.shape == null || d.status.shape == "dot") {
                                    style = {
                                        display: "inline",
                                        fill: fill,
                                        stroke: fill
                                    };
                                } else if (d.status.shape == "ring" ){
                                    style = {
                                        display: "inline",
                                        fill: '#fff',
                                        stroke: fill
                                    }
                                }
                                thisNode.selectAll('.node_status').style(style);
                            }
                            if (d.status.text) {
                                thisNode.selectAll('.node_status_label').text(d.status.text);
                            } else {
                                thisNode.selectAll('.node_status_label').text("");
                            }
                        }
				//console.dir("d value");
				//console.dir(d);
                            if (showNumbers && d.dgnumber != null && d.dgnumber != undefined  && d.dgnumber.length >0) {
                            		thisNode.selectAll('.node_dgnumber_group').style("display","inline").attr("transform","translate(9,"+(d.h+9)+")");
                                	thisNode.selectAll('.node_dgnumber_label').text(d.dgnumber.toString());
					var dgnumberList = d.dgnumber;
				        var dgnum = "";
					if(dgnumberList != null && dgnumberList.length >=1){
						dgnum = dgnumberList[0];
                                		thisNode.select('.node_dgnumber_label').text(dgnum);
						//console.log(dgnumberList);
                                		thisNode.select('.node_dgnumber_title').text(dgnumberList);
					}
				/*
				if(d.dgnumber.length > 1){
                            		thisNode.selectAll('.node_dgnumber_group').style("display","inline").attr("transform","translate(9,"+(d.h-15)+")");
                                	thisNode.selectAll('.node_dgnumber_label').text(d.dgnumber.toString());
				}else{
                            		thisNode.selectAll('.node_dgnumber_group').style("display","inline").attr("transform","translate(9,"+(d.h+9)+")");
                                	thisNode.selectAll('.node_dgnumber_label').text(d.dgnumber.toString());
				}
				*/
                            } else {
				//console.log("fhfjhfjh ");
                                thisNode.select('.node_dgnumber').style("display","none");
                                thisNode.select('.node_dgnumber_label').text("");
                                thisNode.select('.node_dgnumber_title').text("");
                            }

                        d.dirty = false;
                    }
            });
        }

        var link = vis.selectAll(".link").data(RED.nodes.links.filter(function(d) { return d.source.z == activeWorkspace && d.target.z == activeWorkspace }),function(d) { return d.source.id+":"+d.sourcePort+":"+d.target.id;});

        var linkEnter = link.enter().insert("g",".node").attr("class","link");
        
        linkEnter.each(function(d,i) {
            var l = d3.select(this);
            l.append("svg:path").attr("class","link_background link_path")
               .on("mousedown",function(d) {
                    mousedown_link = d;
                    clearSelection();
                    selected_link = mousedown_link;
                    updateSelection();
                    redraw();
                    d3.event.stopPropagation();
                })
                .on("touchstart",function(d) {
                    mousedown_link = d;
                    clearSelection();
                    selected_link = mousedown_link;
                    updateSelection();
                    redraw();
                    d3.event.stopPropagation();
                });
            l.append("svg:path").attr("class","link_outline link_path");
            l.append("svg:path").attr("class","link_line link_path");
        });

        link.exit().remove();

        var links = vis.selectAll(".link_path")
        links.attr("d",function(d){
                var numOutputs = d.source.outputs || 1;
                var sourcePort = d.sourcePort || 0;
                var y = -((numOutputs-1)/2)*13 +13*sourcePort;

                var dy = d.target.y-(d.source.y+y);
                var dx = (d.target.x-d.target.w/2)-(d.source.x+d.source.w/2);
                var delta = Math.sqrt(dy*dy+dx*dx);
                var scale = lineCurveScale;
                var scaleY = 0;
                if (delta < node_width) {
                    scale = 0.75-0.75*((node_width-delta)/node_width);
                }

                if (dx < 0) {
                    scale += 2*(Math.min(5*node_width,Math.abs(dx))/(5*node_width));
                    if (Math.abs(dy) < 3*node_height) {
                        scaleY = ((dy>0)?0.5:-0.5)*(((3*node_height)-Math.abs(dy))/(3*node_height))*(Math.min(node_width,Math.abs(dx))/(node_width)) ;
                    }
                }

                d.x1 = d.source.x+d.source.w/2;
                d.y1 = d.source.y+y;
                d.x2 = d.target.x-d.target.w/2;
                d.y2 = d.target.y;

                return "M "+(d.source.x+d.source.w/2)+" "+(d.source.y+y)+
                    " C "+(d.source.x+d.source.w/2+scale*node_width)+" "+(d.source.y+y+scaleY*node_height)+" "+
                    (d.target.x-d.target.w/2-scale*node_width)+" "+(d.target.y-scaleY*node_height)+" "+
                    (d.target.x-d.target.w/2)+" "+d.target.y;
        })

        link.classed("link_selected", function(d) { return d === selected_link || d.selected; });
        link.classed("link_unknown",function(d) { return d.target.type == "unknown" || d.source.type == "unknown"});

        if (d3.event) {
            d3.event.preventDefault();
        }
    }

    RED.keyboard.add(/* z */ 90,{ctrl:true},function(){RED.history.pop();});
    RED.keyboard.add(/* a */ 65,{ctrl:true},function(){selectAll();d3.event.preventDefault();});
    RED.keyboard.add(/* = */ 187,{ctrl:true},function(){zoomIn();d3.event.preventDefault();});
    RED.keyboard.add(/* - */ 189,{ctrl:true},function(){zoomOut();d3.event.preventDefault();});
    RED.keyboard.add(/* 0 */ 48,{ctrl:true},function(){zoomZero();d3.event.preventDefault();});
    RED.keyboard.add(/* v */ 86,{ctrl:true},function(){importNodes(clipboard);d3.event.preventDefault();});
    RED.keyboard.add(/* e */ 69,{ctrl:true},function(){showExportNodesDialog();d3.event.preventDefault();});
    RED.keyboard.add(/* i */ 73,{ctrl:true},function(){showImportNodesDialog();d3.event.preventDefault();});
    RED.keyboard.add(/* B */ 66,{ctrl:true},function(){RED.view.showDgNumberDialog();d3.event.preventDefault();});
    RED.keyboard.add(/* [ */ 219,{ctrl:true},function(){RED.view.showSearchTextDialog();d3.event.preventDefault();});
    RED.keyboard.add(/* O */ 79,{ctrl:true},function(){RED.view.showRequestTemplateDialog();d3.event.preventDefault();});


    // TODO: 'dirty' should be a property of RED.nodes - with an event callback for ui hooks
    function setDirty(d) {
        dirty = d;
        if (dirty) {
            $("#btn-deploy").removeClass("disabled");
        } else {
            $("#btn-deploy").addClass("disabled");
        }
    }

    /**
     * Imports a new collection of nodes from a JSON String.
     *  - all get new IDs assigned
     *  - all 'selected'
     *  - attached to mouse for placing - 'IMPORT_DRAGGING'
     */
    function importNodes(newNodesStr,touchImport) {
        try {
            var result = RED.nodes.import(newNodesStr,true);
            if (result) {
                var new_nodes = result[0];
                var new_links = result[1];
                var new_workspaces = result[2];
                
                var new_ms = new_nodes.filter(function(n) { return n.z == activeWorkspace }).map(function(n) { return {n:n};});
                var new_node_ids = new_nodes.map(function(n){ return n.id; });
                
                // TODO: pick a more sensible root node
                if (new_ms.length > 0) {
                    var root_node = new_ms[0].n;
                    var dx = root_node.x;
                    var dy = root_node.y;
    
                    if (mouse_position == null) {
                        mouse_position = [0,0];
                    }
    
                    var minX = 0;
                    var minY = 0;
                    var i;
                    var node;
                    
                    for (i=0;i<new_ms.length;i++) {
                        node = new_ms[i];
                        node.n.selected = true;
                        node.n.changed = true;
                        node.n.x -= dx - mouse_position[0];
                        node.n.y -= dy - mouse_position[1];
                        node.dx = node.n.x - mouse_position[0];
                        node.dy = node.n.y - mouse_position[1];
                        minX = Math.min(node.n.x-node_width/2-5,minX);
                        minY = Math.min(node.n.y-node_height/2-5,minY);
                    }
                    for (i=0;i<new_ms.length;i++) {
                        node = new_ms[i];
                        node.n.x -= minX;
                        node.n.y -= minY;
                        node.dx -= minX;
                        node.dy -= minY;
                    }
                    if (!touchImport) {
                        mouse_mode = RED.state.IMPORT_DRAGGING;
                    }
    
                    RED.keyboard.add(/* ESCAPE */ 27,function(){
                            RED.keyboard.remove(/* ESCAPE */ 27);
                            clearSelection();
                            RED.history.pop();
                            mouse_mode = 0;
                    });
                    clearSelection();
                    moving_set = new_ms;
                }

                RED.history.push({t:'add',nodes:new_node_ids,links:new_links,workspaces:new_workspaces,dirty:RED.view.dirty()});


                redraw();
            }
        } catch(error) {
            console.log(error.stack);
            RED.notify("<strong>Error</strong>: "+error,"error");
        }
    }

    function showExportNodesDialog() {
        mouse_mode = RED.state.EXPORT;
        var nns = RED.nodes.createExportableNodeSet(moving_set);
        $("#dialog-form").html($("script[data-template-name='export-clipboard-dialog']").html());
        $("#node-input-export").val(JSON.stringify(nns));
        $("#node-input-export").focus(function() {
                var textarea = $(this);
                textarea.select();
                textarea.mouseup(function() {
                        textarea.unbind("mouseup");
                        return false;
                });
        });
        $( "#dialog" ).dialog("option","title","Export nodes to clipboard").dialog( "open" );
        $("#node-input-export").focus();
    }

    function showExportNodesLibraryDialog() {
        mouse_mode = RED.state.EXPORT;
        var nns = RED.nodes.createExportableNodeSet(moving_set);
        $("#dialog-form").html($("script[data-template-name='export-library-dialog']").html());
        $("#node-input-filename").attr('nodes',JSON.stringify(nns));
        $( "#dialog" ).dialog("option","title","Export nodes to library").dialog( "open" );
    }

    function showImportNodesDialog() {
        mouse_mode = RED.state.IMPORT;
        $("#dialog-form").html($("script[data-template-name='import-dialog']").html());
        $("#node-input-import").val("");
        $( "#dialog" ).dialog("option","title","Import nodes").dialog( "open" );
    }

    function showRenameWorkspaceDialog(id) {
        var ws = RED.nodes.workspace(id);
        $( "#node-dialog-rename-workspace" ).dialog("option","workspace",ws);

        if (workspace_tabs.count() == 1) {
            $( "#node-dialog-rename-workspace").next().find(".leftButton")
                .prop('disabled',true)
                .addClass("ui-state-disabled");
        } else {
            $( "#node-dialog-rename-workspace").next().find(".leftButton")
                .prop('disabled',false)
                .removeClass("ui-state-disabled");
        }

        $( "#node-input-workspace-name" ).val(ws.label);
        $( "#node-dialog-rename-workspace" ).dialog("open");
    }

    $("#node-dialog-rename-workspace form" ).submit(function(e) { e.preventDefault();});
    $( "#node-dialog-rename-workspace" ).dialog({
        modal: true,
        autoOpen: false,
        width: 500,
        title: "Rename sheet",
        buttons: [
            {
                class: 'leftButton',
                text: "Delete",
                click: function() {
                    var workspace = $(this).dialog('option','workspace');
                    $( this ).dialog( "close" );
                    deleteWorkspace(workspace.id);
                }
            },
            {
                text: "Ok",
                click: function() {
                    var workspace = $(this).dialog('option','workspace');
                    var label = $( "#node-input-workspace-name" ).val();
                    if (workspace.label != label) {
                        workspace.label = label;
                        var link = $("#workspace-tabs a[href='#"+workspace.id+"']");
                        link.attr("title",label);
                        link.text(label);
                        RED.view.dirty(true);
                    }
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ],
        open: function(e) {
            RED.keyboard.disable();
        },
        close: function(e) {
            RED.keyboard.enable();
        }
    });
    $( "#node-dialog-delete-workspace" ).dialog({
        modal: true,
        autoOpen: false,
        width: 500,
        title: "Confirm delete",
        buttons: [
            {
                text: "Ok",
                click: function() {
                    var workspace = $(this).dialog('option','workspace');
                    RED.view.removeWorkspace(workspace);
                    var historyEvent = RED.nodes.removeWorkspace(workspace.id);
                    historyEvent.t = 'delete';
                    historyEvent.dirty = dirty;
                    historyEvent.workspaces = [workspace];
                    RED.history.push(historyEvent);
                    RED.view.dirty(true);
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ],
        open: function(e) {
            RED.keyboard.disable();
        },
        close: function(e) {
            RED.keyboard.enable();
        }

    });
    return {
        state:function(state) {
            if (state == null) {
                return mouse_mode
            } else {
                mouse_mode = state;
            }
        },
        addWorkspace: function(ws) {
            workspace_tabs.addTab(ws);
            workspace_tabs.resize();
        },
        removeWorkspace: function(ws) {
            workspace_tabs.removeTab(ws.id);
        },
        getWorkspace: function() {
            return activeWorkspace;
        },
        showWorkspace: function(id) {
            workspace_tabs.activateTab(id);
        },
        redraw:redraw,
        dirty: function(d) {
            if (d == null) {
                return dirty;
            } else {
                setDirty(d);
            }
        },
        importNodes: importNodes,
        resize: function() {
            workspace_tabs.resize();
        },
        status: function(s) {
		validateEachNodeXml();
            showStatus = s;
            RED.nodes.eachNode(function(n) { n.dirty = true;});
            //TODO: subscribe/unsubscribe here
            redraw();
        },
	showYangUploadDialog:function showYangUploadDialog(){
		$(function() {
			var htmlStr= "<div id='yang-upload-div' style='width:375;height:225'>" +
			'<form id="uploadForm" name="uploadForm" enctype="multipart/form-data" action="/api/uploadyang" method="post" >' + 
			"<input id='yang-file-id' name='yangFile' type='file' accept='.yang,.zip'><p style='font-size:0.7em'><i>For Module depending on multiple yang files, zip them and upload the zip file. The zip file name should match the exact name of the module with .zip extension</i</p><br><br><br><br><br><p id='yang-upload-status'></p>" +
			//'<input id="upload-yang-button-id"  style="font-size:1em;font-weight:bold" type="button" value="Upload Yang" name="upload-yang-button">' +
			"</form></div>";

			$("#yang-upload-dialog").dialog({
				modal:true,	
				autoOpen :false,
				title: "Upload Yang",
             			width: 500,
             			height: 260,
                		minWidth : 300, 
                		minHeight :260, 
				buttons :[
                			{
                    				text: "Upload Yang",
                    				click: function() {
							if( document.getElementById("yang-file-id").files.length == 0 ){
        							$("#yang-upload-status").html("<span>No files selected.</span>");
								return ;
							}	
							$('#yang-upload-dialog').parent().find('.ui-dialog-buttonpane button:first').button("disable");
        						//$("#yang-upload-status").empty().text("File is uploading...");
        						$("#yang-upload-status").html("<span>Processing...Please wait</span><img src='images/page-loading.gif'>");
							$.ajax({
    								url: "/api/uploadyang", 
    								type: "POST",             
    								data: new FormData(document.forms['uploadForm']),
    								contentType: false,       
    								cache: false,             
    								processData:false, 
    								success: function(data) {
        								$("#yang-upload-status").html("");
        								$("#yang-upload-status").text(data.msg);
									$('#yang-upload-dialog').parent().find('.ui-dialog-buttonpane button:first').button("enable");
								/*
									sliValuesObj = {};
									rpcValues = {};
									reqInputValues = {};
									for(var i=0;i<data.sliValuesObj.length;i++){
                                						var moduleName = data.sliValuesObj[i].moduleName;
                                						sliValuesObj[moduleName] = data.sliValuesObj[i][moduleName + '_PROPS'];
                                						rpcValues[moduleName] = data.sliValuesObj[i][ moduleName +'_RPCS'];
                                						for(var k=0;rpcValues[moduleName] != undefined && k<rpcValues[moduleName].length;k++){
                                        						var rpcName = rpcValues[moduleName][k];
                                        						reqInputValues[moduleName + "_" + rpcName] = data.sliValuesObj[i][rpcName +"-input"];
                                						}
                        						}
								 */
									//close the yang upload dialogog box and open the load dialogbox
									$('#yang-upload-dialog').dialog("close");
									$("#btn-available-yang-modules").trigger("click");
    								},
								error:function (xhr, desc, err){
        								$("#yang-upload-status").html(err);
									$('#yang-upload-dialog').parent().find('.ui-dialog-buttonpane button:first').button("enable");
								}
							});
						}
					},
                			{
                    				text: "Close",
                    				click: function() {
							$("#yang-upload-dialog").dialog("close");
						}
					}
					]
			}).dialog("open").html(htmlStr);
		});
	},
        showDgNumberDialog: function showDgNumberDialog(){
	$(function() {
		var isLoopDetected = detectLoop();
		console.log("isLoopDetected:" + isLoopDetected);
		if(isLoopDetected){
			return false;
		}
		updateDgNumbers();
	var htmlStr="<div id='find-dgnumber-div' style='width:375;height:225'><label>DG Number</label><input id='dgnumber-val-id' type='text' value=''><p id='find-dgnumber-status' style='color:red'></p></div>";
	$("#dgnumber-find-dialog").dialog({
		modal:true,	
		autoOpen :false,
		title: "Find Node By DGNumber",
             	width: 300,
             	height: 215,
                minWidth : 300, 
                minHeight :215, 
		buttons :[
                	{
                    	text: "Find",
                    	click: function() {
				var dgnumVal = $("#dgnumber-val-id").val();
				$("#find-dgnumber-status").text("");
				if(dgnumVal != undefined &&  dgnumVal != '' && dgnumVal != ''){
					dgnumVal = dgnumVal.trim();
				}else{
					dgnumVal ="";
				}
					
				var dgNumberFound = false;
            			var node = vis.selectAll(".nodegroup").data(RED.nodes.nodes.filter(function(d) { return d.z == activeWorkspace }),function(d){return d.id});
                		node.each(function(d,i) {
					var thisNode = d3.select(this);
					var dgn = d.dgnumber;
					
					if(dgn != undefined && typeof dgn == 'object'){
						var found = false;
						for(var k=0;k<dgn.length;k++){
							if(dgn[k] == dgnumVal){
								found = true;
								break;
							}
						}
						if(found){
							//thisNode.select("rect").style({"stroke":"blue","stroke-width" :"3","stroke-dasharray":"5,1"});
							//$("#" + d.id).find("rect").attr("class","node-found-selected");
							//$("#" + d.id).find("rect").attr("class","node node_selected");
							//thisNode.select("rect").attr("class","node node_selected");
							thisNode.select("rect").attr("class","node node_found");
							document.getElementById( d.id ).scrollIntoView();	
							$("#dgnumber-find-dialog").dialog("close");

							//display the node edit dialogbox
							RED.editor.edit(d);
							dgNumberFound = true;
						}else{
							//thisNode.select("rect").style({"stroke":"#999","stroke-width" :"2","stroke-dasharray":"none"});
							//$("#" + d.id ).find("rect").attr("class","node-found-clear");
							thisNode.select("rect").attr("class","node");
							//$("#" + d.id ).find("rect").attr("class","node");
							//$("#find-dgnumber-status").text("DGNumber :" + dgnumVal + " Not found");
							
						}
					}
				});
				if(!dgNumberFound){
					$("#find-dgnumber-status").text("DGNumber :" + dgnumVal + " Not found");
				}
			}
			},
                	{
                    	text: "Close",
                    	click: function() {
				$("#dgnumber-find-dialog").dialog("close");
			}
			}
		],
		open:function(){
			//Bind the Enter key to Find button
		  	$('#dgnumber-find-dialog').keypress(function(e) {
                               if (e.keyCode == $.ui.keyCode.ENTER) {
					$('#dgnumber-find-dialog').parent().find('.ui-dialog-buttonpane button:first').click();
                				return false;
                                        }
                        });
			$(function(){
				//set focus on the input box
				$("#dgnumber-val-id").focus();
			});
		}
		}).dialog("open").html(htmlStr);
	});
	},	
        showSearchTextDialog: function showSearchTextDialog(){
	$(function() {
		var isLoopDetected = detectLoop();
		console.log("isLoopDetected:" + isLoopDetected);
		if(isLoopDetected){
			return false;
		}
		updateDgNumbers();
	//console.log("In the showSearchTextDialog.");	
	var htmlStr="<div id='search-text-div' style='width:675;height:525'><label>Search Text</label><input style='width:500px;' id='search-text-val-id' type='text' value=''><br><input id='ignore-case-id' type='checkbox' name='ignorecase' value='1' >Ignore Case<br><p id='search-text-status' style='color:red'></p></div>";
	//console.log("setting up search-text-dialog.");	
	$("#search-text-dialog").dialog({
		modal:true,	
		autoOpen :false,
		title: "Search text in DG",
             	width: 600,
             	height: 515,
                minWidth : 500, 
                minHeight :415, 
		buttons :[
                	{
                    	text: "Search",
                    	click: function() {
	
            			var node = vis.selectAll(".nodegroup").data(RED.nodes.nodes.filter(function(d) { return d.z == activeWorkspace }),function(d){return d.id});
				var searchText = $("#search-text-val-id").val();
				$("#search-text-status").text("");
				if(searchText != undefined &&  searchText != '' && searchText != ''){
					searchText = searchText.trim();
				}else{
					searchText ="";
                			node.each(function(d,i) {
						var thisNode = d3.select(this);
						thisNode.select("rect").attr("class","node");
					});
					return;
				}
					
				var foundSearchText = false;
				var foundInDgNumArr = [];
				//console.log("In search function");
                		node.each(function(d,i) {
					var thisNode = d3.select(this);
					var dgn = d.dgnumber;
					var xml = d.xml;
					var nName = d.name;
			
					var ignoreCase = $('#ignore-case-id').prop('checked') 
					var options = 'g';
					if(ignoreCase){
						options='gi';
					}
					var searchPattern = new RegExp(searchText, options );
					if(xml == undefined || xml == null){
						xml = "";
					}
					if(nName == undefined || nName == null){
						nName = "";
					}
					//console.log(searchPattern);
					var count1 = (xml.match(searchPattern) || []).length;
					//console.log(count1);	
					var count2 = (nName.match(searchPattern) || []).length;
					//console.log(count2);	
						
					if(count1 >0 || count2 > 0){
						thisNode.select("rect").attr("class","node text_found");
						var dgn = d.dgnumber;
					
						var dgNumber =  dgn;
						if(dgn != undefined && typeof dgn == 'object'){
							console.log("DGNUMBERS:"  + dgn);
							dgNumber =  dgn[0];
						}
						if(dgn != undefined ){
							foundInDgNumArr.push(dgNumber);
						}else{
							foundInDgNumArr.push(d.type);
						}
						foundSearchText=true;
					}else{
						thisNode.select("rect").attr("class","node");
					}
				});
				if(!foundSearchText){
					$("#search-text-status").text("Search Text :" + searchText  + " Not found");
				}else{
					//console.log("closing dialog");
					//$("#search-text-dialog").dialog("close");
					console.log(foundInDgNumArr);
					$("#search-text-status").text("Found in DG numbers :" + foundInDgNumArr);
				}
			}
			},
                	{
                    	text: "Close",
                    	click: function() {
				//console.log("closing dialog");
				$("#search-text-dialog").dialog("close");
			}
			}
		],
		open:function(){
			//console.log("called open.");
			//Bind the Enter key to Find button
		  	$('#search-text-dialog').keypress(function(e) {
                               if (e.keyCode == $.ui.keyCode.ENTER) {
					$('#search-text-dialog').parent().find('.ui-dialog-buttonpane button:first').click();
                				return false;
                                        }
                        });
			$(function(){
				//set focus on the input box
				$("#search-text-id").focus();
			});
			//console.log("done open call.");
		}
		}).dialog('open').html(htmlStr);
	});
	},	
        showRequestTemplateDialog: function showRequestTemplateDialog(){
	$(function() {
		var currNodes =  RED.nodes.nodes.filter(function(d) { return d.z == activeWorkspace })
		var moduleName = "";
		var rpcName = "";
		if(currNodes != null && currNodes.length > 1){
			currNodes.forEach(function(n){
				if(n.type == 'service-logic'){
					moduleName = getAttributeValue(n.xml,"module");
				}else if(n.type == 'method'){
					rpcName = getAttributeValue(n.xml,"rpc");
				}
			});
		}
		console.log("moduleName:" + moduleName);
		console.log("rpcName:" + rpcName);
		var inputValObj = reqInputValues[moduleName + "_" + rpcName];
		var inputValStr = "Not found. Please make sure that the Module is loaded and the rpc has input.";
		if(inputValObj != undefined && inputValObj != null){
			inputValStr = "{\n\"input\" : " + JSON.stringify(inputValObj,null,4)+ "\n}";
		}	
		
		//var htmlStr="<div id='request-template-div' style='width:875px;height:575px'><textarea style='width:875px;height:575px'>" + inputValStr + "</textarea></div>"
		//var htmlStr="<div id='request-template-div' style='width:750px;height:550px;font-weight:bold;font-size:1em'><pre>" + inputValStr + "</pre></div>"
		var htmlStr="<textarea readonly='1' id='request-template-textarea' style='width:750px;height:550px;font-weight:bold;font-size:1em'>" + inputValStr + "</textarea>"
		$("#request-input-dialog").dialog({
			dialogClass :"no-close",
			modal:true,	
			autoOpen :false,
			title: "Request Template for Module:" + moduleName + "    RPC:" + rpcName,
             		width: 800,
             		height: "auto",
			buttons :[
                	{
                    		text: "Close",
                    		click: function() {
					$("#request-input-dialog").dialog("close");
				}
			}
			],
			open:function(){
				 $('#request-input-dialog').css('overflow', 'hidden'); 
			}
		}).dialog("open").html(htmlStr);
	});
	},
        showNumbers: function(s) {
		console.log("showNumbers:" + s);
		showNumbers = s;
            RED.nodes.eachNode(function(n) { n.dirty = true;});
            redraw();
        },
        showNodePalette: function(s) {
		showNodePalette=s;
		if(!s){
			$("#main-container").addClass("palette-bar-closed");
			//RED.menu.setSelected("btn-node-panel",true);
		}else{
			$("#main-container").removeClass("palette-bar-closed");
		}
		//console.log("showNodePalette:" + showNodePalette);
        },
        
        //TODO: should these move to an import/export module?
        showImportNodesDialog: showImportNodesDialog,
        showExportNodesDialog: showExportNodesDialog,
        showExportNodesLibraryDialog: showExportNodesLibraryDialog
    };
})();
