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
package org.onap.ccsdk.distribution.lighty;

import io.lighty.core.controller.api.AbstractLightyModule;
import io.lighty.core.controller.api.LightyController;
import io.lighty.core.controller.impl.LightyControllerBuilder;
import io.lighty.core.controller.impl.config.ConfigurationException;
import io.lighty.core.controller.impl.config.ControllerConfiguration;
import io.lighty.modules.northbound.restconf.community.impl.CommunityRestConf;
import io.lighty.modules.northbound.restconf.community.impl.CommunityRestConfBuilder;
import io.lighty.modules.northbound.restconf.community.impl.config.RestConfConfiguration;
import io.lighty.modules.northbound.restconf.community.impl.util.RestConfConfigUtils;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import org.onap.ccsdk.sli.core.lighty.common.CcsdkLightyUtils;
import org.opendaylight.aaa.encrypt.AAAEncryptionService;
import org.opendaylight.controller.md.sal.binding.api.DataBroker;
import org.opendaylight.controller.md.sal.binding.api.NotificationPublishService;
import org.opendaylight.controller.sal.binding.api.RpcProviderRegistry;
import org.opendaylight.yang.gen.v1.config.aaa.authn.encrypt.service.config.rev160915.AaaEncryptServiceConfig;
import org.opendaylight.yang.gen.v1.config.aaa.authn.encrypt.service.config.rev160915.AaaEncryptServiceConfigBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The implementation of the {@link io.lighty.core.controller.api.LightyModule} that groups all necessary components
 * needed to start the CCSDK lighty.io application.
 */
public class CcsdkLightyApplication extends AbstractLightyModule {

    private static final Logger LOG = LoggerFactory.getLogger(CcsdkLightyApplication.class);

    private ControllerConfiguration controllerConfiguration;
    private RestConfConfiguration restConfConfiguration;

    private LightyController lightyController;
    private CommunityRestConf communityRestConf;
    private CcsdkLightyModule ccsdkLightyModule;

    public CcsdkLightyApplication(ControllerConfiguration controllerConfiguration,
            RestConfConfiguration restConfConfiguration) {
        this.controllerConfiguration = controllerConfiguration;
        this.restConfConfiguration = restConfConfiguration;
    }

    @Override
    protected boolean initProcedure() {
        // Start Lighty Controller with base OLD services
        LightyControllerBuilder lightyControllerBuilder = new LightyControllerBuilder();
        try {
            lightyController = lightyControllerBuilder.from(controllerConfiguration).build();
        } catch (ConfigurationException e) {
            LOG.error("Exception thrown while starting Lighty controller!", e);
            return false;
        }
        if (!CcsdkLightyUtils.startLightyModule(lightyController)) {
            LOG.error("Unable to start Lighty controller!");
            return false;
        }

        // Start RestConf
        CommunityRestConfBuilder communityRestConfBuilder = new CommunityRestConfBuilder();
        communityRestConf = communityRestConfBuilder
                .from(RestConfConfigUtils.getRestConfConfiguration(restConfConfiguration,
                        lightyController.getServices()))
                .build();
        if (!CcsdkLightyUtils.startLightyModule(communityRestConf)) {
            LOG.error("Unable to start RestConf!");
            return false;
        }

        // Start Lighty CCSDK
        AAAEncryptionService aaaEncryptionService = null;
        try {
            aaaEncryptionService = createAAAEncryptionService(getDefaultAaaEncryptServiceConfig());
        } catch (ConfigurationException e) {
            LOG.error("Exception thrown while initializing {}!", AAAEncryptionService.class, e);
        }
        DataBroker dataBroker = lightyController.getServices().getControllerBindingDataBroker();
        NotificationPublishService notificationPublishService = lightyController.getServices()
                .getControllerBindingNotificationPublishService();
        RpcProviderRegistry rpcProviderRegistry = lightyController.getServices().getControllerRpcProviderRegistry();
        ccsdkLightyModule = new CcsdkLightyModule(dataBroker, notificationPublishService,
                rpcProviderRegistry, aaaEncryptionService);
        if (!CcsdkLightyUtils.startLightyModule(ccsdkLightyModule)) {
            LOG.error("Unable to start CCSDK Lighty module!");
            return false;
        }

        return true;
    }

    @Override
    protected boolean stopProcedure() {
        boolean stopSuccessful = true;

        if (!CcsdkLightyUtils.stopLightyModule(ccsdkLightyModule)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(communityRestConf)) {
            stopSuccessful = false;
        }

        if (!CcsdkLightyUtils.stopLightyModule(lightyController)) {
            stopSuccessful = false;
        }

        return stopSuccessful;
    }

    private AAAEncryptionService createAAAEncryptionService(AaaEncryptServiceConfig encrySrvConfig)
            throws ConfigurationException {
        final byte[] encryptionKeySalt = Base64.getDecoder().decode(encrySrvConfig.getEncryptSalt());
        try {
            final SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(encrySrvConfig.getEncryptMethod());
            final KeySpec keySpec = new PBEKeySpec(encrySrvConfig.getEncryptKey().toCharArray(), encryptionKeySalt,
                    encrySrvConfig.getEncryptIterationCount(), encrySrvConfig.getEncryptKeyLength());
            SecretKey key = new SecretKeySpec(keyFactory.generateSecret(keySpec).getEncoded(),
                    encrySrvConfig.getEncryptType());
            IvParameterSpec ivParameterSpec = new IvParameterSpec(encryptionKeySalt);

            Cipher encryptCipher = Cipher.getInstance(encrySrvConfig.getCipherTransforms());
            encryptCipher.init(Cipher.ENCRYPT_MODE, key, ivParameterSpec);

            Cipher decryptCipher = Cipher.getInstance(encrySrvConfig.getCipherTransforms());
            decryptCipher.init(Cipher.DECRYPT_MODE, key, ivParameterSpec);

            return new AAAEncryptionServiceLightyImpl(encryptCipher, decryptCipher);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException | NoSuchPaddingException
                | InvalidAlgorithmParameterException | InvalidKeyException e) {
            throw new ConfigurationException(e);
        }
    }

    private AaaEncryptServiceConfig getDefaultAaaEncryptServiceConfig() {
        return new AaaEncryptServiceConfigBuilder().setEncryptKey("V1S1ED4OMeEh")
                .setPasswordLength(12).setEncryptSalt("TdtWeHbch/7xP52/rp3Usw==")
                .setEncryptMethod("PBKDF2WithHmacSHA1").setEncryptType("AES")
                .setEncryptIterationCount(32768).setEncryptKeyLength(128)
                .setCipherTransforms("AES/CBC/PKCS5Padding").build();
    }
}
