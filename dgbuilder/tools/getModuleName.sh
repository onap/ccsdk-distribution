module=$(cat $1|egrep "module .*{"|awk '{print $2}'|sed -e 's/{//g')
echo $module
