exports.listSLA =  function(settings,req,res) {
try{
	var mysql = require('mysql');

	//console.dir(settings);
 
	var connection = mysql.createConnection(
    	{
      	host     : settings.dbHost,
        port     : settings.dbPort,
        user     : settings.dbUser,
        password : settings.dbPassword,
        database : settings.dbName
       });

        var rows=[];

	var sqlQuery = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC";
	//console.log("sqlQuery:" + sqlQuery);
         connection.query(sqlQuery, function(err, rows) {
            if(!err) {
                if ( rows.length > 0 )
                {
                        res.send({ 'rows': rows,'dbHost':settings.dbHost } );
                }else{
                        res.send({'rows': [],'dbHost':settings.dbHost});
                }
            } else {
			console.log("error:" + err);
            	    res.send({error: "Connection to DB failed.",'dbHost':settings.dbHost});
            }
		//console.dir(rows);
		connection.end();
        }); //end query
}catch(error){
	console.log(error);
        res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
}
}

exports.listCurrentDGs =  function(settings,req,res) {
	var _module = req.query.module;
	var rpc = req.query.rpc;
	console.log("_module:" + _module);
	console.log("rpc:" + rpc);
try{
	var mysql = require('mysql');

	//console.dir(settings);
 
	var connection = mysql.createConnection(
    	{
      	host     : settings.dbHost,
        port     : settings.dbPort,
        user     : settings.dbUser,
        password : settings.dbPassword,
        database : settings.dbName
       });

        var rows=[];

	var sqlQuery = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC where module ='" + _module + "' and rpc ='" + rpc + "'";
	console.log("sqlQuery:" + sqlQuery);
         connection.query(sqlQuery, function(err, rows) {
            if(!err) {
                if ( rows.length > 0 )
                {
                        res.send({ 'rows': rows,'dbHost':settings.dbHost } );
                }else{
                        res.send({'rows': [],'dbHost':settings.dbHost});
                }
            } else {
			console.log("error:" + err);
            	    res.send({error: "Connection to DB failed.",'dbHost':settings.dbHost});
            }
		//console.dir(rows);
		connection.end();
        }); //end query
}catch(error){
	console.log(error);
        res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
}
}

exports.activateDG = function(settings,req,res){
	var _module = req.query.module;
	var rpc = req.query.rpc;
	var version = req.query.version;
	var mode = req.query.mode;
	var displayOnlyCurrent = req.query.displayOnlyCurrent;

try{
	var mysql = require('mysql');
 
	var connection = mysql.createConnection(
    	{
      	host     : settings.dbHost,
        port     : settings.dbPort,
        user     : settings.dbUser,
        password : settings.dbPassword,
        database : settings.dbName
       });

        var rows=[];

	var updateStmt = "UPDATE SVC_LOGIC SET active=\'Y\' WHERE module=\'"
                        + _module + "' AND rpc=\'"
                        + rpc + "' AND version=\'"
                        +  version + "' AND mode=\'"
                        +  mode + "'";

         connection.query(updateStmt, function(err, result) {
		var nextUpdateStmt = "UPDATE SVC_LOGIC SET active=\'N\' WHERE module=\'"
                        + _module + "' AND rpc=\'"
                        + rpc + "' AND version !=\'"
                        +  version + "'";
         	connection.query(nextUpdateStmt, function(err, result) {
			var query = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC";
			if(displayOnlyCurrent == 'true'){
				query = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC WHERE module=\'"
					+  _module + "' and rpc=\'" + rpc + "'";
			}
         		connection.query(query, function(err, rows) {
            			if(!err) {
                			if ( rows.length > 0 )
                			{
                        			res.send({ 'rows': rows,'dbHost':settings.dbHost } );
                			}else{
                        			res.send({'rows': [],'dbHost':settings.dbHost});
                			}
            			} else {
            	    			res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
            			}
				connection.end();
        		}); //end query
        	}); //end query
       	}); //end query
}catch(error){
        res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
}
}


exports.deActivateDG = function(settings,req,res){

	var _module = req.query.module;
	var rpc = req.query.rpc;
	var version = req.query.version;
	var mode = req.query.mode;
	var displayOnlyCurrent = req.query.displayOnlyCurrent;

try{
	var mysql = require('mysql');
 
	var connection = mysql.createConnection(
    	{
      	host     : settings.dbHost,
        port     : settings.dbPort,
        user     : settings.dbUser,
        password : settings.dbPassword,
        database : settings.dbName
       });

        var rows=[];

	var updateStmt = "UPDATE SVC_LOGIC SET active=\'N\' WHERE module=\'"
                        + _module + "' AND rpc=\'"
                        + rpc + "' AND version=\'"
                        +  version + "' AND mode=\'"
                        +  mode + "'";

         connection.query(updateStmt, function(err, result) {
		var query = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC";
		if(displayOnlyCurrent == 'true'){
			query = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC WHERE module=\'"
				+  _module + "' and rpc=\'" + rpc + "'";
		}
         	connection.query(query, function(err, rows) {
            	if(!err) {
                	if ( rows.length > 0 )
                	{
                        	res.send({ 'rows': rows,'dbHost':settings.dbHost } );
                	}else{
                        	res.send({'rows': [],'dbHost':settings.dbHost});
                	}
            	} else {
            	    	res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
            	}
		connection.end();
        	}); //end query
       	}); //end query
}catch(error){
        res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
}
}

exports.deleteDG = function(settings,req,res){

	var _module = req.query.module;
	var rpc = req.query.rpc;
	var version = req.query.version;
	var mode = req.query.mode;
	var displayOnlyCurrent = req.query.displayOnlyCurrent;

try{
	var mysql = require('mysql');
 
	var connection = mysql.createConnection(
    	{
      	host     : settings.dbHost,
        port     : settings.dbPort,
        user     : settings.dbUser,
        password : settings.dbPassword,
        database : settings.dbName
       });

        var rows=[];

	var deleteStmt = "DELETE FROM SVC_LOGIC  WHERE module=\'"
                        + _module + "' AND rpc=\'"
                        + rpc + "' AND version=\'"
                        +  version + "' AND mode=\'"
                        +  mode + "'";
	 console.log(deleteStmt);

         connection.query(deleteStmt, function(err, result) {
		var query = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC";
		if(displayOnlyCurrent == 'true'){
			query = "SELECT module,rpc,version,mode,active FROM SVC_LOGIC WHERE module=\'"
				+  _module + "' and rpc=\'" + rpc + "'";
		}
         	connection.query(query, function(err, rows) {
            	if(!err) {
                	if ( rows.length > 0 )
                	{
                        	res.send({ 'rows': rows,'dbHost':settings.dbHost } );
                	}else{
                        	res.send({'rows': [],'dbHost':settings.dbHost});
                	}
            	} else {
            	    	res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
            	}
		connection.end();
        	}); //end query
       	}); //end query
}catch(error){
        res.send({'error': "Connection to DB failed.",'dbHost':settings.dbHost});
}
}
