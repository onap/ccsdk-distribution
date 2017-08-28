if [ "$#" != "1" ]
then
        echo "Usage: $0 jsonFileFullPath"
        exit
fi
cat $1|python -m json.tool
