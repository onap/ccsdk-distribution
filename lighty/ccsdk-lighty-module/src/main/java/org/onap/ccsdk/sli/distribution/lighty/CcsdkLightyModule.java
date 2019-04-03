package org.onap.ccsdk.sli.distribution.lighty;

import io.lighty.core.controller.api.AbstractLightyModule;
import io.lighty.core.controller.api.LightyModule;
import java.util.concurrent.ExecutionException;
import org.onap.ccsdk.sli.adaptors.lighty.CcsdkAdaptorsLightyModule;
import org.onap.ccsdk.sli.core.dblib.lighty.DblibModule;
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

public class CcsdkLightyModule extends AbstractLightyModule {

    private static final Logger LOG = LoggerFactory.getLogger(CcsdkLightyModule.class);

    private final DataBroker dataBroker;
    private final NotificationPublishService notificationPublishService;
    private final RpcProviderRegistry rpcProviderRegistry;
    private final AAAEncryptionService aaaEncryptionService;

    //private CcsdkCoreLightyModule ccsdkCoreLightyModule;
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
        try {
            LOG.debug("Initializing CCSDK Lighty module...");

            LOG.debug("Starting Lighty Module {}...", DblibModule.class);
            this.dblibModule = new DblibModule(aaaEncryptionService);
            if (!startLightyModule(dblibModule)) {
                LOG.error("Unable to start DblibModule in CCSDK Core Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", DblibModule.class);

            LOG.debug("Starting Lighty Module {}...", CcsdkAdaptorsLightyModule.class);
            this.ccsdkAdaptorsLightyModule = new CcsdkAdaptorsLightyModule(dblibModule.getDBResourceManager());
            if (!startLightyModule(ccsdkAdaptorsLightyModule)) {
                LOG.error("Unable to start CcsdkAdaptorsLightyModule in CCSDK Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", CcsdkAdaptorsLightyModule.class);

            LOG.debug("Starting Lighty Module {}...", SliModule.class);
            this.sliModule = new SliModule(dblibModule.getDBResourceManager(),
                    ccsdkAdaptorsLightyModule.getAaaServiceModule().getAAIService(), new Slf4jRecorder(),
                    ccsdkAdaptorsLightyModule.getAaaServiceModule().getAAIService(), null);
            if (!startLightyModule(sliModule)) {
                LOG.error("Unable to start SliModule in CCSDK Core Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", SliModule.class);

            LOG.debug("Starting Lighty Module {}...", SliApiModule.class);
            this.sliApiModule = new SliApiModule(dataBroker, notificationPublishService, rpcProviderRegistry, sliModule.getSvcLogicServiceImpl());
            if (!startLightyModule(sliApiModule)) {
                LOG.error("Unable to start SliApiModule in CCSDK Core Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", SliApiModule.class);

            LOG.debug("Starting Lighty Module {}...", SliPluginUtilsModule.class);
            this.sliPluginUtilsModule = new SliPluginUtilsModule();
            if (!startLightyModule(sliPluginUtilsModule)) {
                LOG.error("Unable to start SliPluginUtilsModule in CCSDK Core Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", SliPluginUtilsModule.class);

        /*
        // FIXME core is dependent on adaptors!
        this.ccsdkCoreLightyModule = new CcsdkCoreLightyModule(dataBroker, notificationPublishService,
                rpcProviderRegistry, aaaEncryptionService, );
        if (!startLightyModule(ccsdkCoreLightyModule)) {
            LOG.error("Unable to start CcsdkCoreLightyModule in CCSDK Lighty module!");
            return false;
        }*/

            LOG.debug("Starting Lighty Module {}...", CcsdkPluginsLightyModule.class);
            this.ccsdkPluginsLightyModule = new CcsdkPluginsLightyModule();
            if (!startLightyModule(ccsdkPluginsLightyModule)) {
                LOG.error("Unable to start CcsdkPluginsLightyModule in CCSDK Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", CcsdkPluginsLightyModule.class);

            LOG.debug("Starting Lighty Module {}...", CcsdkNorhboundLightyModule.class);
            this.ccsdkNorhboundLightyModule =
                    new CcsdkNorhboundLightyModule(sliModule.getSvcLogicServiceImpl(), dataBroker,
                            notificationPublishService, rpcProviderRegistry);
            if (!startLightyModule(ccsdkNorhboundLightyModule)) {
                LOG.error("Unable to start CcsdkNorhboundLightyModule in CCSDK Lighty module!");
                return false;
            }
            LOG.debug("Lighty Module {} started", CcsdkNorhboundLightyModule.class);

            LOG.debug("CCSDK Lighty module was initialized successfully");
            return true;
        } catch (Exception e) {
            LOG.error("Exception caught!", e);
            throw e;
        }
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

        /*if (!stopLightyModule(ccsdkCoreLightyModule)) {
            stopSuccessfull = false;
        }*/

        if (!stopLightyModule(sliPluginUtilsModule)) {
            stopSuccessfull = false;
        }

        if (!stopLightyModule(sliApiModule)) {
            stopSuccessfull = false;
        }

        if (!stopLightyModule(sliModule)) {
            stopSuccessfull = false;
        }

        if (!stopLightyModule(dblibModule)) {
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
