import javax.xml.transform.*;
import javax.xml.transform.stream.*;
import java.io.*;
import java.util.*;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.charset.StandardCharsets;
import java.nio.charset.Charset;
public class FormatXml{
public static String formatXml(String input, int indent) {
    try {
        Source xmlInput = new StreamSource(new StringReader(input));
        StringWriter stringWriter = new StringWriter();
        StreamResult xmlOutput = new StreamResult(stringWriter);
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        transformerFactory.setAttribute("indent-number", indent);
        Transformer transformer = transformerFactory.newTransformer(); 
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.transform(xmlInput, xmlOutput);
        return xmlOutput.getWriter().toString();
    } catch (Exception e) {
        throw new RuntimeException(e); // simple exception handling, please review it
    }
}

public static String prettyFormat(String input) {
    return formatXml(input, 2);
}

public static String readFile(String path, Charset encoding) 
  throws IOException 
{
  byte[] encoded = Files.readAllBytes(Paths.get(path));
  return new String(encoded, encoding);
}

public static void main(String[] args){
try{
	if (args != null && args.length != 1){
		System.out.println("Usage:java FormatXml xmlStr");
		System.exit(-1);
	}
	String xmlStr = readFile(args[0], StandardCharsets.UTF_8);
	System.out.println(prettyFormat(xmlStr));
}catch(Exception e){
	e.printStackTrace();
}
}
}
