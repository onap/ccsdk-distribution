toolsDir=$PROJECT_HOME/tools
. ${toolsDir}/setClasspath
if [ "$#" != "1" ]
then
	echo "Usage $0 className_without_the_dot_class_ext"
	exit
fi
 java PrintYangToProp $1 
