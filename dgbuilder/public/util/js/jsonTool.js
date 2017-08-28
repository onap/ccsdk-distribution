var obj={};
function dotToJson(str,value,obj){
    //var objArr = path.split("."), part;
    var objArr = str.split(".");
	var prevStr;
	var currObj;
	var prevObj;
	console.log(str);
	for(var i=0;i<objArr.length -1;i++){
		var subStr= objArr[i] ;
		//console.log("subStr:" + subStr);
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
			//console.dir(currObj);
		}
		prevStr=subStr;
		if(i <objArr.length-2){
			prevObj=currObj;	
		}
	}
	var lastStr = objArr[objArr.length-1];
	currObj[lastStr] = value;
	//prevObj[lastStr] = value;
	//console.dir(currObj);
	return obj;
}
n=dotToJson('abcfdfghdghdghdghdhdhd.efhfjhfjhfjhfjhfjhfjhfbg.hfjhfjhfjhfjhfjhfjh.l',"1234",obj);
//console.dir(n);
JSON.stringify(n,undefined,2);
m=dotToJson('abc.ebg.h.n',"5678",n);
console.dir(m);
function printObj(obj){
for( j in obj){
	console.log(j + ":" + obj[j]);
	if(typeof obj[j] == "object" ){
		printObj(obj[j]);
	}

}
}
printObj(m);
a=JSON.parse(JSON.stringify(m,null,2));
console.dir(a);


//console.log (stringToObj('abc.ebg.h',"",{}));
