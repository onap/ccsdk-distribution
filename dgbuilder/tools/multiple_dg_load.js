
var fs = require('fs');
var obj =[];
try{
 obj =	JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
}catch(err){
}
var dirPath=process.argv[3];
console.log(dirPath);
function getID() {
        return (1+Math.random()*4294967295).toString(16);
}

var filteredArray = obj.filter(function(itm){
  return itm.type == 'tab' ;
});

var tabsArr=filteredArray;
 var files = fs.readdirSync(dirPath);
    for (var i in files) {
       var currentFile = dirPath + '/' + files[i];
	//console.log(currentFile);
       var stats = fs.statSync(currentFile);
try{
	if (stats.isFile()) {
		var moduleName="";
		var methodName="";
		console.log("processing... " + currentFile);
 		var o = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
		for(var idx in o){
			if(o[idx].type == "service-logic"){
				moduleName=o[idx].name;
			} 
			if(o[idx].type == "method"){
				methodName=o[idx].name;
				methodName = methodName.replace("method ","");
			} 
			if(moduleName != "" && methodName != ""){
				break;
			}
		}
		var id  = o[0].z;
		//console.log("tab id:" + id);
		var newId = id;
		var number_of_tabs = 0;
		if(filteredArray != null ){
		 number_of_tabs = filteredArray.length;
		}
		//console.log("number_of_tabs:" + number_of_tabs);
		//console.log("id:" + id);
		if(filteredArray != null  && filteredArray.length > 0){
			for(var i in filteredArray){
				if(filteredArray[i].id == id){
					newId = getID();	
					console.log("Using new id:" + newId);
				}
			}
			for(var idx in o){
				o[idx].z= newId;
				var oldNodeId = o[idx].id;
				var newNodeId = getID();
				o[idx].id= newNodeId;
				for(var k=0;k<o.length;k++){
					if(o[k] != null && o[k].wires != undefined && o[k].wires != null){	
						for(var j=0;o[k].wires[0] != null && j< o[k].wires[0].length;j++){
							if(o[k].wires[0][j] == oldNodeId){
								o[k].wires[0][j]=newNodeId;
							}
							
						}	
					}
				}
			}
		}
        		//"label": "Sheet " + (number_of_tabs + 1),
		var tabObj= {
        		"id": newId,
        		"label": methodName,
        		"type": "tab"
		};
	
		filteredArray.push(tabObj);
		obj.unshift(tabObj);
		for(var idx in o){
			obj.push(o[idx]);
		}
		//console.dir(obj);
	}
}catch(err){
	console.log(err);
}
};
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
if (fs.existsSync(process.argv[2])) {
	fs.renameSync(process.argv[2],process.argv[2]+ "_" + getCurrentDate());
}
fs.writeFileSync( process.argv[2] + ".new", JSON.stringify(obj));
if (fs.existsSync(process.argv[2] + ".new")) {
	fs.renameSync(process.argv[2] + ".new",process.argv[2]);
}
