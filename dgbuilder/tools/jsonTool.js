var obj={};
function dotToJson(str,value,obj){
    //var objArr = path.split("."), part;
    var objArr = str.split(".");
	var prevStr;
	var currObj;
	var prevObj;
	//console.log(str);
	var isArray = false;
	var prevObjIsArray = false;
	for(var i=0;i<objArr.length -1;i++){
		var subStr= objArr[i] ;
		if(isArray){
			prevObjIsArray = true;	
		}
		isArray = false;
		if(subStr.indexOf(']') == subStr.length -1){
			subStr = subStr.substring(0,subStr.length -2);
			isArray = true;
		}
		//console.log("subStr:" + subStr + isArray);
		//console.dir(prevObj);
		if(isArray){
			if(i==0 && obj[subStr] == undefined ){
				//console.log("i==0 && obj[subStr] ");
				obj[subStr]=[];
			}else if(i==0 && obj[subStr][0] == undefined ){
						obj[subStr][0]={};
			}else if(i==0 && obj[subStr][0] != undefined ){
				currObj= obj[subStr][0];
			}else{
				if(i == 1){
					//console.log("i==1 && obj[prevStr] ");
	 				prevObj=obj[prevStr];
					if(prevObj[subStr][0] == undefined){
						prevObj[subStr] = [];
						prevObj[subStr][0] = {};
						currObj = prevObj[subStr][0];
					}else{
						currObj = prevObj[subStr][0];
					}
				}else{
					if(prevObj[subStr] == undefined){
						prevObj[subStr]=[];
						prevObj[subStr][0]={};
						currObj = prevObj[subStr][0];
					}else{
						currObj = prevObj[subStr][0];
					}
				}
			}
		}else{
			if(i==0 && obj[subStr] == undefined ){
				obj[subStr] = {};
				currObj= obj[subStr];
			}else if(i==0 && obj[subStr] != undefined ){
				currObj=obj[subStr];
			//console.log("in gkjgjkg");
			}else{
				if(i == 1){
	 				prevObj=obj[prevStr];
					if(prevObj[subStr] == undefined){
						prevObj[subStr] = {};
						currObj = prevObj[subStr];
					}else{
						currObj = prevObj[subStr];
					}
				}else{
					if(prevObj[subStr] == undefined){
						prevObj[subStr] = {};
						currObj = prevObj[subStr];
					}else{
						currObj = prevObj[subStr];
					}
				}
			}
		}
		prevStr=subStr;
		if(i <objArr.length-2){
			//console.dir(currObj);
			prevObj=currObj;	
		}
	}
	var lastStr = objArr[objArr.length-1];
	if(isArray){
		currObj[lastStr] = value;
	}else{
		currObj[lastStr] = value;
	}
	//prevObj[lastStr] = value;
	//console.dir(currObj);
	return obj;
}
function printObj(obj){
for( j in obj){
	console.log(j + ":" + obj[j]);
	if(typeof obj[j] == "object" ){
		printObj(obj[j]);
	}

}
}

var a=[];
var nObj={};
for(var i=0;i<a.length;i++){
	dotToJson(a[i],'',nObj);
}

var nObj={};
for(var i=0;i<a.length;i++){
	var key =a[i].substring(0,a[i].indexOf(':'));
	console.log(key);
	var value =a[i].substring(a[i].indexOf(':') +1);
	if(value == undefined) value ="";
	dotToJson(key,value,nObj);
}
console.log(JSON.stringify(nObj,null,4));
//console.log (stringToObj('abc.ebg.h',"",{}));
