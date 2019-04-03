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

import io.lighty.core.controller.impl.config.ControllerConfiguration;
import io.lighty.core.controller.impl.util.ControllerConfigUtils;
import io.lighty.modules.northbound.restconf.community.impl.config.RestConfConfiguration;
import io.lighty.modules.northbound.restconf.community.impl.util.RestConfConfigUtils;
import java.net.InetAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.opendaylight.yangtools.yang.binding.YangModuleInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main class of the CCSDK lighty.io application. In order to start the application run main method. Path to
 * the configuration file can be provided as argument. If not, then default configuration will be used.
 */
public class Main {

    private static final Logger LOG = LoggerFactory.getLogger(Main.class);

    private ShutdownHook shutdownHook;

    public static void main(String[] args) {
        Main app = new Main();
        app.start(args, true);
    }

    public void start(String[] args, boolean registerShutdownHook) {
        long startTime = System.nanoTime();
        LOG.info(".__  .__       .__     __              .__                   _________ _________   _________________ "
                + "  ____  __.");
        LOG.info("|  | |__| ____ |  |___/  |_ ___.__.    |__| ____             \\_   ___ \\\\_   ___ \\ /   _____/\\___"
                + "___ \\ |    |/ _|");
        LOG.info("|  | |  |/ ___\\|  |  \\   __<   |  |    |  |/  _ \\    ______  /    \\  \\//    \\  \\/ \\_____  \\ "
                + " |    |  \\|      <");
        LOG.info("|  |_|  / /_/  >   Y  \\  |  \\___  |    |  (  <_> )  /_____/  \\     \\___\\     \\____/        \\ |"
                + "    `   \\    |  \\");
        LOG.info("|____/__\\___  /|___|  /__|  / ____| /\\ |__|\\____/             \\______  /\\______  /_______  //___"
                + "____  /____|__ \\");
        LOG.info("       /_____/      \\/      \\/      \\/                               \\/        \\/        \\/    "
                + "     \\/        \\/");

        LOG.info("Starting lighty.io CCSDK application ...");
        LOG.info("https://lighty.io/");
        LOG.info("https://github.com/PantheonTechnologies/lighty-core");
        try {
            if (args.length > 0) {
                Path configPath = Paths.get(args[0]);
                LOG.info("Using configuration from file {} ...", configPath);
                //1. get controller configuration
                ControllerConfiguration singleNodeConfiguration =
                        ControllerConfigUtils.getConfiguration(Files.newInputStream(configPath));
                //2. get RESTCONF NBP configuration
                RestConfConfiguration restConfConfiguration = RestConfConfigUtils
                        .getRestConfConfiguration(Files.newInputStream(configPath));
                //3. start lighty
                startLighty(singleNodeConfiguration, restConfConfiguration, registerShutdownHook);
            } else {
                LOG.info("Using default configuration ...");
                Set<YangModuleInfo> modelPaths = Stream.concat(RestConfConfigUtils.YANG_MODELS.stream(),
                        CcsdkLightyModule.YANG_MODELS.stream()).collect(Collectors.toSet());
                //1. get controller configuration
                ControllerConfiguration defaultSingleNodeConfiguration =
                        ControllerConfigUtils.getDefaultSingleNodeConfiguration(modelPaths);
                //2. get RESTCONF NBP configuration
                RestConfConfiguration restConfConfig =
                        RestConfConfigUtils.getDefaultRestConfConfiguration();
                restConfConfig.setInetAddress(InetAddress.getLocalHost());
                restConfConfig.setHttpPort(8181);
                //3. start lighty
                startLighty(defaultSingleNodeConfiguration, restConfConfig, registerShutdownHook);
            }
            float duration = (System.nanoTime() - startTime)/1_000_000f;
            LOG.info("lighty.io and CCSDK started in {}ms", duration);
        } catch (Exception e) {
            LOG.error("Main CCSDK lighty.io application exception: ", e);
        }
    }

    private void startLighty(ControllerConfiguration singleNodeConfiguration,
            RestConfConfiguration restConfConfiguration, boolean registerShutdownHook)
            throws ExecutionException, InterruptedException {
        CcsdkLightyApplication ccsdkLightyApplication = new CcsdkLightyApplication(singleNodeConfiguration,
                restConfConfiguration);

        if (registerShutdownHook) {
            shutdownHook = new ShutdownHook(ccsdkLightyApplication);
            Runtime.getRuntime().addShutdownHook(shutdownHook);
        }

        ccsdkLightyApplication.start().get();
    }

    private static class ShutdownHook extends Thread {

        private static final Logger LOG = LoggerFactory.getLogger(ShutdownHook.class);
        private final CcsdkLightyApplication ccsdkLightyApplication;

        ShutdownHook(CcsdkLightyApplication ccsdkLightyApplication) {
            this.ccsdkLightyApplication = ccsdkLightyApplication;
        }

        @Override
        public void run() {
            LOG.info("lighty.io and CCSDK shutting down ...");
            long startTime = System.nanoTime();
            try {
                ccsdkLightyApplication.shutdown();
            } catch (Exception e) {
                LOG.error("Exception while shutting down lighty.io CCSDK application:", e);
            }
            float duration = (System.nanoTime() - startTime)/1_000_000f;
            LOG.info("lighty.io and CCSDK stopped in {}ms", duration);
        }

    }
}
