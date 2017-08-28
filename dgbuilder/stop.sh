#!/bin/bash
tbold=$(tput setf 3)
bold=$(tput setf 2)
bold1=$(tput setf 2)
offbold=$(tput rmso;tput sgr0)

function pad {
        #echo "1 is $1 2 is $2"
        if [ "$1" == "" ]
        then
                $1 = "";
        fi
        let count=0
        curr_len=`expr length "$1"`
        let space_length=$2-$curr_len
        spaces=""
        while [ $count -lt $space_length ]
        do
                spaces="$spaces "
                let count=$count+1
        done
        echo "$1$spaces"
}
releaseDir=""
if [ "$#" == "1" ]
then
	releaseDir="$1"
fi

if [ -e "releases/${releaseDir}/customSettings.js" ]
then
		port=$(cat releases/${releaseDir}/customSettings.js|grep uiPort|sed -e 's/[, ]//g'|cut -d: -f2)
	kill $(cat releases/${releaseDir}/logs/process_pid  2>/dev/null) >/dev/null 2>&1
	if [ "$?" != "0" ]
	then
		#kill only if its a node-red process
		processPid=$(netstat -upltn 2>/dev/null|grep -w $port|awk '{print $NF}'|sed -e 's%/node-red%%g')
		kill $processPid 2>/dev/null
		echo "http://localhost:$port ---- STOPPED"
		./show_status.sh|grep -w "${releaseDir}"
	else
		echo "http://localhost:$port ---- STOPPED"
		./show_status.sh|grep -w "${releaseDir}"
	fi
else
	if [ "$releaseDir" != "" ]
	then
		echo "Release Directory ${releaseDir} not setup.";
	else
		echo "Usage:$0 releaseDirName"
	fi	
fi
