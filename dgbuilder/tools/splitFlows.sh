#!/bin/sh
if [ "$#" != "2" ]
then
	echo "Usage: $0 full_path_to_flows_json_file full_path_to_output_dir"
	exit
fi	
rm -rf "$2" 2>/dev/null
mkdir "$2" 2>/dev/null
node ${PROJECT_HOME}/tools/splitFlows.js $1 $2
