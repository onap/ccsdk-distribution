if [ "$#" != "2" ]
then
	echo "Usage:$0 full_path_to_flows.json full_path_to_the_files_directory"
	exit
fi
node multiple_dg_load.js $1 $2
