toolsDir=$PROJECT_HOME/tools
. ${toolsDir}/setClasspath
if [ "$#" != "1" ]
then
	echo "Usage $0 className_without_the_dot_class_ext"
	exit
fi
 java org.onap.ccsdk.sli.core.sli.provider.PrintYangToProp $1
