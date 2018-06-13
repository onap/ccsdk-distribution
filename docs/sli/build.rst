.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0

Build
=====


Environment
-----------
Requires maven release 3.3 or greater

Steps
-----
To compile this code:

1. Make sure your local Maven settings file ($HOME/.m2/settings.xml) contains references to the ONAP repositories and OpenDaylight repositories.

2. To compile all of CCSDK SLI code
    - git clone http://gerrit.onap.org/r/ccsdk/parent
    - cd parent ; mvn clean install ; cd ..
    -  mkdir sli ; cd sli
    - git clone http://gerrit.onap.org/r/ccsdk/sli/core
    - git clone http://gerrit.onap.org/r/ccsdk/sli/adaptors
    - git clone http://gerrit.onap.org/r/ccsdk/sli/northbound
    - git clone http://gerrit.onap.org/r/ccsdk/sli/plugins
    - cd core ; mvn clean install
    - cd ../adaptors ; mvn clean install
    - cd ../northbound ; mvn clean install
    - cd ../plugins ; mvn clean install
    