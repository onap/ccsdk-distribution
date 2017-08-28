toolsDir=$PROJECT_HOME/tools
. ${toolsDir}/setClasspath
if [ "$#" != "2" ]
then
	echo "Usage $0 yang_file generated_jar_file"
	echo "example $0 /home/users/sdnc/src/sample.yang  /home/users/sdnc/target/sample.model-1.0.0.jar"
	exit
fi
yangFile="$1"
jarFile="$2"
module=$(cat $yangFile|egrep "module .*{"|awk '{print $2}'|sed -e 's/{//g')
#echo "	\"$module\" : ["
rpcs=$(grep rpc $yangFile|grep -v leaf|sed -e 's/^\s\+rpc//g'|awk '{print $1}')
#echo ${rpcs}
for i in `find ${PROJECT_HOME}/svclogic/lib -name "*.jar" -print`
do
#echo $i
export CLASSPATH=$CLASSPATH:$i
done
export CLASSPATH=$CLASSPATH:${toolsDir}/printYangToProp.jar:.
allProps=""
for rpc in $rpcs
do
rpcVal=$(echo $rpc|sed -e "s/\b\(.\)/\u\1/g"|sed s/\-//g)
className=$(jar -tvf ${jarFile}|grep "org/opendaylight/yang/gen/"|grep  -w "${rpcVal}Input.class"|grep -v grep|awk '{print $NF}'|sed -e 's/\//./g'|sed -e 's/.class$//g')
inputProps=""
if [ "$className" != "" ]
then
	#java -cp $CLASSPATH PrintYangToProp $className 2>/dev/null|grep '*' |cut -d'*' -f2|sed -e "s/^[ \t]*//g"|sed -e "s/^/\t\t\"/g"|sed -e "s/$/\",/g"
	inputProps=$(java -cp $CLASSPATH PrintYangToProp $className 2>${toolsDir}/tmpws/logs/err.log)
fi
className=$(jar -tvf ${jarFile}|grep "org/opendaylight/yang/gen/"|grep -w "${rpcVal}Output"|grep -v grep|awk '{print $NF}'|sed -e 's/\//./g'|sed -e 's/.class$//g')
#echo $inputProps
#echo $className
outputProps=""
if [ "$className" != "" ]
then
	#java -cp $CLASSPATH PrintYangToProp $className 2>/dev/null|grep '*' |cut -d'*' -f2|sed -e "s/^[ \t]*//g"|sed -e "s/^/\t\t\"/g"|sed -e "s/$/\",/g"
	outputProps=$(java -cp $CLASSPATH PrintYangToProp $className 2>${toolsDir}/tmpws/logs/err.log)
fi
if [ -z "$allProps" ]
then
	allProps=$(echo ${inputProps}${outputProps}|sed -e s/,$//g)
else
	allProps=$(echo ${allProps},${inputProps}${outputProps}|sed -e s/,$//g)
fi
done
#allProps=$(echo ${inputProps}${outputProps}|sed -e s/,$//g)
#echo $allProps
#OIFS=$IFS
#IFS=','
#arr2=$allProps
#for x in $arr2
#do
#    echo "$x"
#done
#IFS=$OIFS
#echo "	]"
echo "module.exports = {"
echo "\"moduleName\" : \"${module}\","
echo "'${module}_VALUES' : "
echo "[ $allProps ]"|python -m json.tool
echo ","
echo "'${module}_RPCS' : ["

cnt=0
#numOfRpcs=${#rpcs[@]}
numOfRpcs=0;
for rpc in $rpcs
do
	numOfRpcs=$((numOfRpcs+1))
done

for rpc in $rpcs
do
	cnt=$((cnt+1))
	if [ $cnt -eq $numOfRpcs ]
	then
		echo "		\"$rpc\""
	else
		echo "		\"$rpc\","
        fi
done
echo "	]"
echo "}"
