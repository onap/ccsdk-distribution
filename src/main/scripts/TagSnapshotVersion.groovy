/*-
 * ============LICENSE_START=======================================================
 * ONAP CCSDK
 * ================================================================================
 * Copyright (C) 2020 Samsung Electronics Co., Ltd.
 * ================================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============LICENSE_END============================================
 * ===================================================================
 *
 */

package org.onap.ccsdk.distribution

Properties properties = new Properties()
File propertiesFile = new File(new File(getClass().protectionDomain.codeSource.location.path).parent + '/../../../version.properties')
propertiesFile.withInputStream {
    properties.load(it)
}

project.properties['project.docker.latestminortag.snapshot.version']=properties.release_name + '.' + properties.sprint_number + "-SNAPSHOT-latest";
project.properties['project.docker.latestfulltag.snapshot.version']=properties.release_name + '.' + properties.sprint_number + '.' + properties.feature_revision + "-SNAPSHOT-latest";
project.properties['project.docker.latesttagtimestamp.snapshot.version']=properties.release_name + '.' + properties.sprint_number + '.' + properties.feature_revision + "-SNAPSHOT-"+project.properties['ccsdk.build.timestamp'];

// Temporary solution for odl-sodium-alpine dependence in odlsli-alpine image build
project.properties['project.docker.latestfulltag.version']=properties.release_name + '.' + properties.sprint_number + '.' + properties.feature_revision + "-STAGING-latest";
