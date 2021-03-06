module.exports={
    "name": "Release sdnc1.0",
    "loginId": "dguser",
    "emailAddress": "dguser@onap.org",
    "uiPort": 3100,
    "mqttReconnectTime": 15000,
    "serialReconnectTime": 15000,
    "debugMaxLength": 1000,
    "htmlPath": "releases/sdnc1.0/html/",
    "xmlPath": "releases/sdnc1.0/xml/",
    "flowFile": "releases/sdnc1.0/flows/flows.json",
    "sharedDir": "releases/sdnc1.0/flows/shared",
    "userDir": "releases/sdnc1.0",
    "httpAuth": {
        "user": "dguser",
        "pass": "cc03e747a6afbbcbf8be7668acfebee5"
    },
    "dbHost": "dbhost",
    "dbPort": "3306",
    "dbName": "sdnctl",
    "dbUser": "sdnctl",
    "dbPassword": "gamma",
    "gitLocalRepository": "",
    "restConfUrl": "http://localhost:8181/restconf/operations/SLI-API:execute-graph",
    "restConfUser": "admin",
    "restConfPassword": "admin",
    "formatXML": "Y",
    "formatJSON": "Y",
    "httpRoot": "/",
    "disableEditor": false,
    "httpAdminRoot": "/",
    "httpAdminAuth": {
        "user": "dguser",
        "pass": "cc03e747a6afbbcbf8be7668acfebee5"
    },
    "httpNodeRoot": "/",
    "httpNodeAuth": {
        "user": "dguser",
        "pass": "cc03e747a6afbbcbf8be7668acfebee5"
    },
    "uiHost": "0.0.0.0",
    "version": "0.9.1",
    "performGitPull": "N",
    "enableHttps" : true
}
