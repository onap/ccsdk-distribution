if [ -z "$PROJECT_HOME" ] 
then
	export PROJECT_HOME=$(pwd)/..
fi

toolsDir=$PROJECT_HOME/tools
rm -rf ${toolsDir}/tmpws 
mkdir ${toolsDir}/tmpws
mkdir ${toolsDir}/tmpws/logs
mkdir ${toolsDir}/tmpws/jars
mkdir ${toolsDir}/tmpws/tmp
if [ "$#" != "1" ]
then
	echo "Command line:$0 $*" >${toolsDir}/tmpws/logs/err.log
	echo "Usage: $0 yangFile" >>${toolsDir}/tmpws/logs/err.log
	exit
fi

isZipFile="N"
echo "$1" | grep "\.zip$" >/dev/null 2>&1
if [ "$?" -eq "0" ]
then
	isZipFile="Y"
fi

if [ "$isZipFile" = "Y" ]
then 
	#zip file of yangs provided
	zipFile=$(basename $1)
	unzip -o -d $PROJECT_HOME/tools/tmpws/tmp $1 >/dev/null 2>&1
	rm $1 >/dev/null 2>&1
	cd $PROJECT_HOME/tools/tmpws/tmp	
	fName="${zipFile}"
	extension="${fName##*.}"
        moduleName="${fName%.*}"	
	#echo "ModuleName is :$moduleName"
	rm -rf $PROJECT_HOME/yangFiles/$moduleName
	mkdir $PROJECT_HOME/yangFiles/$moduleName
	mv *.yang $PROJECT_HOME/yangFiles/$moduleName
	cd $PROJECT_HOME/tools
	yangFilesFullPath=${PROJECT_HOME}/yangFiles/$moduleName
	cd ${toolsDir}/tmpws
	mkdir -p yangApp/model/src/main/yang
	mkdir -p yangApp/model/src/main/yang-gen-sal
	cp -r ${yangFilesFullPath}/* yangApp/model/src/main/yang
	cp ${toolsDir}/pom.xml_base yangApp/model/pom.xml
	cd ${toolsDir}/tmpws/yangApp/model

	#Maven Compile	
	mvn clean install >${toolsDir}/tmpws/logs/mvn_install.log 2>${toolsDir}/tmpws/logs/err.log
	yangApp_model_jar="yangApp-model-1.0.0-SNAPSHOT.jar"

	#Copy the built jar to jars directory
	cp ${toolsDir}/tmpws/yangApp/model/target/${yangApp_model_jar} ${toolsDir}/tmpws/jars
	. ${toolsDir}/setClasspath
	
	mv  ${toolsDir}/output_js/${moduleName}_inputs.js ${toolsDir}/output_js/${moduleName}_inputs_prev.js >/dev/null 2>&1

	${toolsDir}/getRpcsClassFromYang.sh ${yangFilesFullPath}/${moduleName}.yang ${toolsDir}/tmpws/yangApp/model/target/${yangApp_model_jar} > ${toolsDir}/output_js/${moduleName}.js

	node ${toolsDir}/dot_to_json.js ${toolsDir}/output_js/${moduleName}.js $moduleName >${toolsDir}/output_js/${moduleName}_inputs.js

	cp ${toolsDir}/output_js/${moduleName}_inputs.js $PROJECT_HOME/generatedJS
else
	#Single yang provided
	yangFileFullPath=$1
	cd ${toolsDir}/tmpws
	mkdir -p yangApp/model/src/main/yang
	mkdir -p yangApp/model/src/main/yang-gen-sal
	cp ${yangFileFullPath} yangApp/model/src/main/yang
	cp ${toolsDir}/pom.xml_base yangApp/model/pom.xml
	cd ${toolsDir}/tmpws/yangApp/model
	
	#Maven Compile	
	mvn clean install >${toolsDir}/tmpws/logs/mvn_install.log 2>${toolsDir}/tmpws/logs/err.log
	yangApp_model_jar="yangApp-model-1.0.0-SNAPSHOT.jar"

	#Copy the built jar to jars directory
	cp ${toolsDir}/tmpws/yangApp/model/target/${yangApp_model_jar} ${toolsDir}/tmpws/jars
	. ${toolsDir}/setClasspath
	
	moduleName=$(cat $yangFileFullPath|egrep "module .*{"|cut -d' ' -f2|cut -d'{' -f1)

	mv  ${toolsDir}/output_js/${moduleName}_inputs.js ${toolsDir}/output_js/${moduleName}_inputs_prev.js >/dev/null 2>&1

	${toolsDir}/getRpcsClassFromYang.sh ${yangFileFullPath} ${toolsDir}/tmpws/yangApp/model/target/${yangApp_model_jar} > ${toolsDir}/output_js/${moduleName}.js

	node ${toolsDir}/dot_to_json.js ${toolsDir}/output_js/${moduleName}.js $moduleName >${toolsDir}/output_js/${moduleName}_inputs.js

	cp ${toolsDir}/output_js/${moduleName}_inputs.js $PROJECT_HOME/generatedJS


fi

echo "Done..."

