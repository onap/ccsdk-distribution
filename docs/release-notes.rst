.. This work is licensed under a Creative Commons Attribution 4.0 International License.

Release Notes
=============

Version: 0.2.2
--------------


:Release Date: 2018-05-24



**New Features**

+-------------+---------------------------------------------------------------------------------------------------------------------+
| Jira #      | Abstract                                                                                                            |
+=============+=====================================================================================================================+
| [CCSDK-265] | SetNodeExecutor nulling feature enhancement <https://jira.onap.org/browse/CCSDK-265>                                |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-238] | DGBuilder uploadXML displaying processing gif even after successful upload <https://jira.onap.org/browse/CCSDK-238> |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-231] | remove most of pgaas repo <https://jira.onap.org/browse/CCSDK-231>                                                  |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-227] | Simplify enumeration handling <https://jira.onap.org/browse/CCSDK-227>                                              |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-222] | Ansible server support <https://jira.onap.org/browse/CCSDK-222>                                                     |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-214] | support enumerations containing whitespace <https://jira.onap.org/browse/CCSDK-214>                                 |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-211] | change reference of sdnc to ccsdk in dgbuilder-docker files <https://jira.onap.org/browse/CCSDK-211>                |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-210] | allow request body to be passed into rest api call node <https://jira.onap.org/browse/CCSDK-210>                    |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-209] | read properties file using system property <https://jira.onap.org/browse/CCSDK-209>                                 |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-204] | svclogic loader improvements <https://jira.onap.org/browse/CCSDK-204>                                               | 
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-203] | restore previous behavior <https://jira.onap.org/browse/CCSDK-203>                                                  |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-202] | additional logging and loading related changes <https://jira.onap.org/browse/CCSDK-202>                             |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-193] | add timestamps to install log <https://jira.onap.org/browse/CCSDK-193>                                              |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-191] | enable fast loading of graphs <https://jira.onap.org/browse/CCSDK-191>                                              |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-190] | fix setnode null feature <https://jira.onap.org/browse/CCSDK-190>                                                   |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-189] | favor interfaces over concrete classes <https://jira.onap.org/browse/CCSDK-189>                                     |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-187] | reset MDC after executing certain nodes <https://jira.onap.org/browse/CCSDK-187>                                    |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-181] | Want to use the dnsdesig plugin with recent OpenStack versions <https://jira.onap.org/browse/CCSDK-181>             |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-179] | Upgrade CCSDK ODL containers to Nitrogen <https://jira.onap.org/browse/CCSDK-179>                                   |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-177] | Upgrade sli/northbound to Nitrogen <https://jira.onap.org/browse/CCSDK-177>                                         |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-176] | Upgrade sli/adaptors to Nitrogen <https://jira.onap.org/browse/CCSDK-176>                                           |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-175] | Upgrade sli/core to Nitrogen <https://jira.onap.org/browse/CCSDK-175>                                               |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-174] | Update ccsdk parent to support Nitrogen parent poms <https://jira.onap.org/browse/CCSDK-174>                        |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-172] | Ability to call Ansible playbook from directed graph <https://jira.onap.org/browse/CCSDK-172>                       |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-158] | sliPluginUtils enhancements <https://jira.onap.org/browse/CCSDK-158>                                                |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-157] | Healthcheck enhancements <https://jira.onap.org/browse/CCSDK-157>                                                   |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-156] | Fixes to logging filters package <https://jira.onap.org/browse/CCSDK-156>                                           |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-155] | Service Logic Interpreter improvements <https://jira.onap.org/browse/CCSDK-155>                                     |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-152] | Service Logic Compiler improvements <https://jira.onap.org/browse/CCSDK-152>                                        |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-151] | Address issues identified by sonar <https://jira.onap.org/browse/CCSDK-151>                                         |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-124] | minor pom changes <https://jira.onap.org/browse/CCSDK-124>                                                          | 
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-123] | number of small improvements made in SLI <https://jira.onap.org/browse/CCSDK-123>                                   |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-122] | Modifying restapicallnode to support mocking and minor refactoring <https://jira.onap.org/browse/CCSDK-122>         |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-121] | Modifying sdnc-core to support mocking and minor refactoring <https://jira.onap.org/browse/CCSDK-121>               |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-111] | Refactor CCSDK/Dashboard project <https://jira.onap.org/browse/CCSDK-111>                                           |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-109] | Documentation for ccsdk/dashboard <https://jira.onap.org/browse/CCSDK-109>                                          |
+-------------+---------------------------------------------------------------------------------------------------------------------+
| [CCSDK-63]  | Migrate all feature bundle to features-parent <https://jira.onap.org/browse/CCSDK-63>                               | 
+-------------+---------------------------------------------------------------------------------------------------------------------+

**Bug Fixes**

+-------------+--------------------------------------------------------------------------------------------------------------------------+
| Jira #      | Abstract                                                                                                                 |
+=============+==========================================================================================================================+
| [CCSDK-277] | restapicallnode OSGI lookup fails <https://jira.onap.org/browse/CCSDK-277>                                               |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-276] | Ccsdk components not installing in odlsli docker image <https://jira.onap.org/browse/CCSDK-276>                          |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-273] | Missing ansible-adapter.properties file causes NullPointerException <https://jira.onap.org/browse/CCSDK-273>             |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-272] | LCM API expects wrong names for DGs <https://jira.onap.org/browse/CCSDK-272>                                             |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-270] | Remove AT&T license from csar sample <https://jira.onap.org/browse/CCSDK-270>                                            |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-269] | Remove erroneous license header <https://jira.onap.org/browse/CCSDK-269>                                                 |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-268] | SDNC Error on loading Preload in karaf.log <https://jira.onap.org/browse/CCSDK-268>                                      |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-264] | Missing EELF dependency in ansible-bundle <https://jira.onap.org/browse/CCSDK-264>                                       |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-261] | SO build failure because of artifact not available in ccsdk pom <https://jira.onap.org/browse/CCSDK-261>                 |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-254] | UEB Listener failing <https://jira.onap.org/browse/CCSDK-254>                                                            |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-252] | LCM returns rpc not registered <https://jira.onap.org/browse/CCSDK-252>                                                  |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-251] | ansible-adapter install fails <https://jira.onap.org/browse/CCSDK-251>                                                   |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-250] | update aaiclient properties in ccsdk/distribution <https://jira.onap.org/browse/CCSDK-250>                               |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-248] | sli/adaptors release build fails <https://jira.onap.org/browse/CCSDK-248>                                                |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-247] | APPC receiving the trustAnchors parameter must be non-empty error in aai client <https://jira.onap.org/browse/CCSDK-247> |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-246] | Add support for primary identifier of type int in XSD generated model <https://jira.onap.org/browse/CCSDK-246>           |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-244] | Remove unnecessary cast in SqlResource decryptColumn() <https://jira.onap.org/browse/CCSDK-244>                          |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-243] | Precedence incorrect for properties search <https://jira.onap.org/browse/CCSDK-243>                                      |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-241] | Install karaf host key in ODL container <https://jira.onap.org/browse/CCSDK-241>                                         |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-237] | Directed graphs not installed in odlsli container <https://jira.onap.org/browse/CCSDK-237>                               |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-236] | SvcLogicService does not recognize any DG node types <https://jira.onap.org/browse/CCSDK-236>                            |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-235] | CCSDK container fails due to missing logback package <https://jira.onap.org/browse/CCSDK-235>                            |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-234] | ccsdk docker container doesnt have correct version of logback <https://jira.onap.org/browse/CCSDK-234>                   |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-230] | Code Coverage for sli-northbound <https://jira.onap.org/browse/CCSDK-230>                                                |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-229] | AAI-Service methods were removed that are still being used <https://jira.onap.org/browse/CCSDK-229>                      |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-225] | Add Junits for Adaptors <https://jira.onap.org/browse/CCSDK-225>                                                         |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-224] | Update oparent version <https://jira.onap.org/browse/CCSDK-224>                                                          |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-220] | Add default constructor for SqlResource <https://jira.onap.org/browse/CCSDK-220>                                         |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-217] | CCSDK health check responds 501 <https://jira.onap.org/browse/CCSDK-217>                                                 |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-216] | filters feature does not install <https://jira.onap.org/browse/CCSDK-216>                                                |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-215] | resource-assignment feature not installing <https://jira.onap.org/browse/CCSDK-215>                                      |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-213] | Code coverage on sli/core below 50% <https://jira.onap.org/browse/CCSDK-213>                                             |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-208] | Restart fails on odlsli container initialization <https://jira.onap.org/browse/CCSDK-208>                                |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-207] | Incorrect spring version <https://jira.onap.org/browse/CCSDK-207>                                                        |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-205] | update vnfapi provider class to support soft-delete <https://jira.onap.org/browse/CCSDK-205>                             |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-200] | Enhance vnfapi yang model to include subnet-role and network-role-tag <https://jira.onap.org/browse/CCSDK-200>           |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-198] | platform/nbapi merge fails <https://jira.onap.org/browse/CCSDK-198>                                                      |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-197] | Fix parent release build <https://jira.onap.org/browse/CCSDK-197>                                                        |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-196] | CCSDK dashboard still using code from locked repos ecompsdkos <https://jira.onap.org/browse/CCSDK-196>                   |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-192] | Update master detection for master/slave database configuration <https://jira.onap.org/browse/CCSDK-192>                 |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-184] | Use cryptographically secure random number generation <https://jira.onap.org/browse/CCSDK-184>                           |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-182] | Passwords stored in clear text in properties files <https://jira.onap.org/browse/CCSDK-182>                              |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-171] | Convert aai-service provider to blueprint <https://jira.onap.org/browse/CCSDK-171>                                       |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-170] | Null pointer exception while executing test case after sonar issue fix. <https://jira.onap.org/browse/CCSDK-170>         |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-168] | Generalize sli-core/utils FileResolver dblib package <https://jira.onap.org/browse/CCSDK-168>                            |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-154] | ccsdk/sli/northbound/dmaap-listener module compilation failure <https://jira.onap.org/browse/CCSDK-154>                  |
+-------------+--------------------------------------------------------------------------------------------------------------------------+
| [CCSDK-137] | isolate deprecated methods <https://jira.onap.org/browse/CCSDK-137>                                                      |
+-------------+--------------------------------------------------------------------------------------------------------------------------+

**Known Issues**

+-------------+-----------------------------------------------------------------------------------------------------+
| Jira #      | Abstract                                                                                            |
+=============+=====================================================================================================+
| [CCSDK-136] | pgaas is dependent on location\_prefix being all lowercase <https://jira.onap.org/browse/CCSDK-136> |
+-------------+-----------------------------------------------------------------------------------------------------+

**Security Issues**
   You may want to include a reference to CVE (Common Vulnerabilities and Exposures) `CVE <https://cve.mitre.org>`_


**Upgrade Notes**

**Deprecation Notes**

**Other**

