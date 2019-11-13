#!/bin/bash
if [ "$#" != "1" ]
then
        echo "Usage: $0 jsonFileFullPath"
        exit
fi
python3 -m json.tool "$1"
