#!/bin/bash
releaseDir="$1"
if [ "$#" != "1" ]
then
	echo "Usage: $0 releaseDirName"
	exit
fi
echo "ReleaseDir:$releaseDir"
export PROJECT_HOME=`pwd`
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
	
function isRunning {
	echo $(curl -I "$1" 2>/dev/null|head -1|tail -1|awk '{print $2}')
}

npm install

if [ -e "releases/${releaseDir}/customSettings.js" ]
then
	pid=$(cat releases/$releaseDir/logs/process_pid 2>/dev/null)
	port=$(cat releases/$releaseDir/customSettings.js|grep uiPort|sed -e 's/[, ]//g'|cut -d: -f2 )
	count=$(ps -p$pid 2>/dev/null|grep -v PID|wc -l)
	if [ "$count" != "0" ]
	then 
		echo "For Release \"$releaseDir\" - http://localhost:$port"
		echo "********ALREADY RUNNING PID:$pid *******"
	else
		pid_listening_on_port=$(netstat -upltn 2>/dev/null|grep -w $port|awk '{print $NF}'|cut -d'/' -f1)
		if [ "$pid_listening_on_port" != "" ]
		then
			if [ "$pid_listening_on_port" != "$pid" ]
			then
				echo "port $port is already in use by other process"
				ps -p $pid_listening_on_port
			else
				echo "Process is already running.";
			fi
			exit;
		fi
		node red.js --settings releases/${releaseDir}/customSettings.js 
		process_pid="$!"
		echo $process_pid  >releases/$releaseDir/logs/process_pid
		port=$(cat releases/${releaseDir}/customSettings.js|grep uiPort|sed -e 's/[, ]//g'|cut -d: -f2)
		echo "For Release \"$releaseDir\"  ${urlIp}:$port --- STARTED PID:$process_pid"
		if [ "${releaseDir}" != "" ]
		then
			sleep 3
			./show_status.sh|grep -w ${releaseDir}
		fi
	fi
else
	echo "Directory ${releaseDir}  is not setup. Use the createReleaseDir.sh script to setup the directory."
fi
