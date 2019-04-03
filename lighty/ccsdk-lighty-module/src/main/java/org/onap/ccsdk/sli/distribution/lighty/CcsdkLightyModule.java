/*
 * ============LICENSE_START==========================================
 * Copyright (c) 2019 PANTHEON.tech s.r.o.
 * ===================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, either express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 * ============LICENSE_END============================================
 *
 */
package org.onap.ccsdk.sli.distribution.lighty;

import io.lighty.core.controller.api.AbstractLightyModule;
import org.onap.ccsdk.sli.adaptors.lighty.CcsdkAdaptorsLightyModule;
import org.onap.ccsdk.sli.core.dblib.lighty.DblibModule;
import org.onap.ccsdk.sli.core.lighty.common.CcsdkLightyUtils;
import org.onap.ccsdk.sli.core.sli.lighty.SliModule;
import org.onap.ccsdk.sli.core.sli.recording.Slf4jRecorder;
import org.onap.ccsdk.sli.core.sliapi.lighty.SliApiModule;
import org.onap.ccsdk.sli.core.slipluginutils.lighty.SliPluginUtilsModule;
import org.onap.ccsdk.sli.northbound.lighty.CcsdkNorhboundLightyModule;
import org.onap.ccsdk.sli.plugins.lighty.CcsdkPluginsLightyModule;
import org.opendaylight.aaa.encrypt.AAAEncryptionService;
import org.opendaylight.controller.md.sal.binding.api.DataBroker;
import org.opendaylight.controller.md.sal.binding.api.NotificationPublishService;
import org.opendaylight.controller.sal.binding.api.RpcProviderRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The implementation of the {@link io.lighty.core.controller.api.LightyModule} that groups all other LightyModules
 * from the CCSDK project so they can be all treated as one component (for example started/stopped at once).
 * For more information about the lighty.io visit the website https://lighty.io.
 */
public class CcsdkLightyModule extends AbstractLightyModule {

    private static final Logger LOG = LoggerFactory.getLogger(CcsdkLightyModule.class);

    private final DataBroker dataBroker;
    private final NotificationPublishService notificationPublishService;
    private final RpcProviderRegistry rpcProviderRegistry;
    private final AAAEncryptionService aaaEncryptionService;

    private CcsdkAdaptorsLightyModule ccsdkAdaptorsLightyModule;
    private CcsdkNorhboundLightyModule ccsdkNorhboundLightyModule;
    private CcsdkPluginsLightyModule ccsdkPluginsLightyModule;
    private DblibModule dblibModule;
    private SliModule sliModule;
    private SliApiModule sliApiModule;
    private SliPluginUtilsModule sliPluginUtilsModule;

    public CcsdkLightyModule(DataBroker dataBroker, NotificationPublishService notificationPublishService,
            RpcProviderRegistry rpcProviderRegistry, AAAEncryptionService aaaEncryptionService) {
        this.dataBroker = dataBroker;
        this.notificationPublishService = notificationPublishService;
        this.rpcProviderRegistry = rpcProviderRegistry;
        this.aaaEncryptionService = aaaEncryptionService;
    }

    protected boolean initProcedure() {
        // FIXME modules from CcsdkCoreLightyModule need to be started separately (not through CcsdkCoreLightyModule
        //  itself) because SliApiModule is dependent on the adaptors
        try {
            LOG.debug("Initializing CCSDK Lighty module...");

            this.dblibModule = new DblibModule(aaaEncryptionService);
            if (!CcsdkLightyUtils.startLightyModule(dblibModule)) {
                LOG.error("Unable to start DblibModule in CCSDK Core Lighty module!");
                return false;
            }

            this.ccsdkAdaptorsLightyModule = new CcsdkAdaptorsLightyModule(dblibModule.getDbLibService());
            if (!CcsdkLightyUtils.startLightyModule(ccsdkAdaptorsLightyModule)) {
                LOG.error("Unable to start CcsdkAdaptorsLightyModule in CCSDK Lighty module!");
                return false;
            }

            this.sliModule = new SliModule(dblibModule.getDbLibService(),
                    ccsdkAdaptorsLightyModule.getAaaServiceModule().getAAIService(), new Slf4jRecorder(),
                    ccsdkAdaptorsLightyModule.getAaaServiceModule().getAAIService(), null);
            if (!CcsdkLightyUtils.startLightyModule(sliModule)) {
                LOG.error("Unable to start SliModule in CCSDK Core Lighty module!");
                return false;
            }

            this.sliApiModule = new SliApiModule(dataBroker, notificationPublishService, rpcProviderRegistry, sliModule.getSvcLogicServiceImpl());
            if (!CcsdkLightyUtils.startLightyModule(sliApiModule)) {
                LOG.error("Unable to start SliApiModule in CCSDK Core Lighty module!");
                return false;
            }

            this.sliPluginUtilsModule = new SliPluginUtilsModule();
            if (!CcsdkLightyUtils.startLightyModule(sliPluginUtilsModule)) {
                LOG.error("Unable to start SliPluginUtilsModule in CCSDK Core Lighty module!");
                return false;
            }

            this.ccsdkPluginsLightyModule = new CcsdkPluginsLightyModule();
            if (!CcsdkLightyUtils.startLightyModule(ccsdkPluginsLightyModule)) {
                LOG.error("Unable to start CcsdkPluginsLightyModule in CCSDK Lighty module!");
                return false;
            }

            this.ccsdkNorhboundLightyModule =
                    new CcsdkNorhboundLightyModule(sliModule.getSvcLogicServiceImpl(), dataBroker,
                            notificationPublishService, rpcProviderRegistry);
            if (!CcsdkLightyUtils.startLightyModule(ccsdkNorhboundLightyModule)) {
                LOG.error("Unable to start CcsdkNorhboundLightyModule in CCSDK Lighty module!");
                return false;
            }

            LOG.debug("CCSDK Lighty module was initialized successfully");
            return true;
        } catch (Exception e) {
            LOG.error("Exception caught!", e);
            throw e;
        }
    }

    protected boolean stopProcedure() {
        LOG.debug("Stopping CCSDK Lighty module...");

        boolean stopSuccessful = true;

        if (!CcsdkLightyUtils.stopLightyModule(ccsdkPluginsLightyModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(ccsdkNorhboundLightyModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(ccsdkAdaptorsLightyModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(sliPluginUtilsModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(sliApiModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(sliModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(dblibModule)) {
            stopSuccessful = false;
        }

        if (stopSuccessful) {
            LOG.debug("CCSDK Lighty module was stopped successfully");
        } else {
            LOG.error("CCSDK Lighty module was not stopped successfully!");
        }
        return stopSuccessful;
    }

}
