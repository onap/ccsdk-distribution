dt=$(date +'%m%d%Y_%H%M%S')
mv ~/dg_xml/dg.xml ~/dg_xml/dg_${dt}.xml
cp $(ls -ltr /home/users/schinthakayala/nodered/production/flowDesigner/users/sheshi/xml/*.xml|tail -1|awk '{print $NF}') ~/dg_xml/dg.xml
echo "copied the latest DG"
