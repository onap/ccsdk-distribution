import xml.dom.minidom
import lxml.etree as etree
import sys

xml_fname=sys.argv[1]
#xml = xml.dom.minidom.parse(xml_fname) # or xml.dom.minidom.parseString(xml_string)
#pretty_xml_as_string = xml.toprettyxml()
#print pretty_xml_as_string

x = etree.parse(xml_fname)
print etree.tostring(x, pretty_print = True)
