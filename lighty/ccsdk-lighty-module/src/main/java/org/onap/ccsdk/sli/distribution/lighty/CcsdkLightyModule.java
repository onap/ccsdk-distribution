package org.onap.ccsdk.sli.distribution.lighty;

import io.lighty.core.controller.api.AbstractLightyModule;
import io.lighty.core.controller.api.LightyModule;
import java.util.concurrent.ExecutionException;
import org.onap.ccsdk.sli.adaptors.lighty.CcsdkAdaptorsLightyModule;
import org.onap.ccsdk.sli.core.lighty.CcsdkCoreLightyModule;
import org.onap.ccsdk.sli.northbound.lighty.CcsdkNorhboundLightyModule;
import org.onap.ccsdk.sli.plugins.lighty.CcsdkPluginsLightyModule;
import org.opendaylight.aaa.encrypt.AAAEncryptionService;
import org.opendaylight.controller.md.sal.binding.api.DataBroker;
import org.opendaylight.controller.md.sal.binding.api.NotificationPublishService;
import org.opendaylight.controller.sal.binding.api.RpcProviderRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CcsdkLightyModule extends AbstractLightyModule {

    private static final Logger LOG = LoggerFactory.getLogger(CcsdkLightyModule.class);

    private final DataBroker dataBroker;
    private final NotificationPublishService notificationPublishService;
    private final RpcProviderRegistry rpcProviderRegistry;
    private final AAAEncryptionService aaaEncryptionService;

    private CcsdkCoreLightyModule ccsdkCoreLightyModule;
    private CcsdkAdaptorsLightyModule ccsdkAdaptorsLightyModule;
    private CcsdkNorhboundLightyModule ccsdkNorhboundLightyModule;
    private CcsdkPluginsLightyModule ccsdkPluginsLightyModule;

    public CcsdkLightyModule(DataBroker dataBroker, NotificationPublishService notificationPublishService,
            RpcProviderRegistry rpcProviderRegistry, AAAEncryptionService aaaEncryptionService) {
        this.dataBroker = dataBroker;
        this.notificationPublishService = notificationPublishService;
        this.rpcProviderRegistry = rpcProviderRegistry;
        this.aaaEncryptionService = aaaEncryptionService;
    }

    protected boolean initProcedure() {
        LOG.debug("Initializing CCSDK Lighty module...");

        this.ccsdkCoreLightyModule = new CcsdkCoreLightyModule(dataBroker, notificationPublishService,
                rpcProviderRegistry, aaaEncryptionService);
        if (!startLightyModule(ccsdkCoreLightyModule)) {
            LOG.error("Unable to start CcsdkCoreLightyModule in CCSDK Lighty module!");
            return false;
        }

        this.ccsdkAdaptorsLightyModule = new CcsdkAdaptorsLightyModule(
                ccsdkCoreLightyModule.getDblibModule().getDBResourceManager());
        if (!startLightyModule(ccsdkAdaptorsLightyModule)) {
            LOG.error("Unable to start CcsdkAdaptorsLightyModule in CCSDK Lighty module!");
            return false;
        }

        this.ccsdkNorhboundLightyModule = new CcsdkNorhboundLightyModule(
                ccsdkCoreLightyModule.getSliModule().getSvcLogicServiceImpl(), dataBroker, notificationPublishService,
                rpcProviderRegistry);
        if (!startLightyModule(ccsdkNorhboundLightyModule)) {
            LOG.error("Unable to start CcsdkNorhboundLightyModule in CCSDK Lighty module!");
            return false;
        }

        this.ccsdkPluginsLightyModule = new CcsdkPluginsLightyModule();
        if (!startLightyModule(ccsdkPluginsLightyModule)) {
            LOG.error("Unable to start CcsdkPluginsLightyModule in CCSDK Lighty module!");
            return false;
        }

        LOG.debug("CCSDK Lighty module was initialized successfully");
        return true;
    }

    protected boolean stopProcedure() {
        LOG.debug("Stopping CCSDK Lighty module...");

        boolean stopSuccessfull = true;

        if (!stopLightyModule(ccsdkPluginsLightyModule)) {
            stopSuccessfull = false;
        }

        if (!stopLightyModule(ccsdkNorhboundLightyModule)) {
            stopSuccessfull = false;
        }

        if (!stopLightyModule(ccsdkAdaptorsLightyModule)) {
            stopSuccessfull = false;
        }

        if (!stopLightyModule(ccsdkCoreLightyModule)) {
            stopSuccessfull = false;
        }

        if (stopSuccessfull) {
            LOG.debug("CCSDK Lighty module was stopped successfully");
        } else {
            LOG.error("CCSDK Lighty module was not stopped successfully!");
        }
        return stopSuccessfull;
    }

    // TODO move this method somewhere to utils?
    private boolean startLightyModule(LightyModule lightyModule) {
        try {
            return lightyModule.start().get();
        } catch (InterruptedException | ExecutionException e) {
            LOG.error("Exception thrown while initializing {} in CCSDK Lighty module!", lightyModule.getClass(),
                    e);
            return false;
        }
    }

    // TODO move this method somewhere to utils?
    private boolean stopLightyModule(LightyModule lightyModule) {
        try {
            if (!lightyModule.shutdown().get()) {
                LOG.error("{} was not stopped successfully in CCSDK Lighty module!", lightyModule.getClass());
                return false;
            } else {
                return true;
            }
        } catch (Exception e) {
            LOG.error("Exception thrown while shutting down {} in CCSDK Lighty module!", lightyModule.getClass(),
                    e);
            return false;
        }
    }

}
