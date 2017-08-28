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
	
function isRunning {
	echo $(curl -I "$1" 2>/dev/null|head -1|tail -1|awk '{print $2}')
}
dirName=$(pwd)
options=($(ls -l $dirName/releases|grep ^d|awk '{print $NF}'|sort))
	echo "$(pad RELEASE 15)$(pad URL 30)$(pad Status 10)"
	echo "$(pad '----' 15)$(pad '---' 30)$(pad '------' 10)"
	for opt in "${options[@]}" 
	do 
		
		releaseDir="$opt"
		if [ -e "./releases/${opt}/customSettings.js" ]
		then
			pid=$(cat ./releases/$releaseDir/logs/process_pid 2>/dev/null)
			port=$(cat ./releases/$releaseDir/customSettings.js 2>/dev/null|grep uiPort|sed -e 's/[, ]//g'|cut -d: -f2)
			resp1=$(isRunning "http://localhost:$port")
			if [ "$resp1" == "401" ]
			then	
				echo "$(pad $releaseDir 15)$(pad http://localhost:$port 30)${bold}$(pad running 10)${offbold}"
			else
				processId=$(netstat -upltn 2>/dev/null|grep $port|awk '{print $NF}'|sed -e 's%/node-red%%g')
				if [ "$processId" == "" ]
				then
					echo "$(pad $releaseDir 15)$(pad http://localhost:$port 30)${bold}$(pad stopped 10)${offbold}"
				else
					echo "$(pad $releaseDir 15)$(pad http://localhost:$port 30)${bold}$(pad running 10)${offbold}"
				fi
			fi
		fi
	done
