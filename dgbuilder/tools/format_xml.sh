if [ "$#" != "1" ]
then
        echo "Usage: $0 xmlFileFullPath"
        exit
fi

if [ -z "$PROJECT_HOME" ]
then
        export PROJECT_HOME=$(pwd)/..
fi
if [ -e "$1" ]
then
	python $PROJECT_HOME/tools/formatXml.py $1
else
	echo "File $1 does not exist" 
fi
