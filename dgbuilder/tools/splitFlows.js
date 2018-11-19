var fs=require('fs');
var path = require("path");
var full_path_to_flows_json=process.argv[2];
var output_dir=process.argv[3];
console.log("full_path_to_flows_json:"  + full_path_to_flows_json);
console.log("output_dir:"  + output_dir);
var buf= null;
if (fs.existsSync(full_path_to_flows_json)) {
 buf = JSON.parse(fs.readFileSync(full_path_to_flows_json, "utf8"));
}
var tabs = [];
for (var i=0;buf != null && i<buf.length;i++){
	if(buf[i].type == "tab"){
		tabs.push(buf[i]);
	}
}
for(var i=0;tabs != null && i<tabs.length; i++){
	var tab = tabs[i];
	var tabId = tab.id;
        var dgNodes=[];
	for (var j=0;buf != null && j<buf.length;j++){
		var zId = buf[j].z;
		if(zId != undefined && zId != "" && tabId == zId){
			dgNodes.push(buf[j]);
		}
	}	
	
	fs.writeFileSync( output_dir + "/" +tabId, JSON.stringify(dgNodes,null,4));
}
