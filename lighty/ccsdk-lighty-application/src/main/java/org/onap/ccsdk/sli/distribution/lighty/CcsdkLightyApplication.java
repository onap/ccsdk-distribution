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

import io.lighty.core.controller.api.LightyController;
import io.lighty.core.controller.impl.LightyControllerBuilder;
import io.lighty.core.controller.impl.config.ConfigurationException;
import io.lighty.core.controller.impl.config.ControllerConfiguration;
import io.lighty.core.controller.impl.util.ControllerConfigUtils;
import io.lighty.modules.northbound.restconf.community.impl.CommunityRestConf;
import io.lighty.modules.northbound.restconf.community.impl.CommunityRestConfBuilder;
import io.lighty.modules.northbound.restconf.community.impl.config.RestConfConfiguration;
import io.lighty.modules.northbound.restconf.community.impl.util.RestConfConfigUtils;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import org.opendaylight.aaa.encrypt.AAAEncryptionService;
import org.opendaylight.controller.md.sal.binding.api.DataBroker;
import org.opendaylight.controller.md.sal.binding.api.NotificationPublishService;
import org.opendaylight.controller.sal.binding.api.RpcProviderRegistry;
import org.opendaylight.yang.gen.v1.config.aaa.authn.encrypt.service.config.rev160915.AaaEncryptServiceConfig;
import org.opendaylight.yang.gen.v1.config.aaa.authn.encrypt.service.config.rev160915.AaaEncryptServiceConfigBuilder;
import org.opendaylight.yangtools.yang.binding.YangModuleInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO add javadoc
public class CcsdkLightyApplication {

    private static final Logger LOG = LoggerFactory.getLogger(CcsdkLightyApplication.class);


    public static void main(String[] args) throws InterruptedException, ExecutionException, ConfigurationException {
        try {
            startBlocking();
        } catch (Throwable t) {
            LOG.error("Throwable was thrown!", t);
        }
    }

    // TODO make Lighty configurable
    public static void startBlocking() throws ConfigurationException, ExecutionException, InterruptedException {

        Set<YangModuleInfo> models = new HashSet<>(RestConfConfigUtils.YANG_MODELS);
        models.add(org.opendaylight.yang.gen.v1.org.onap.ccsdk.sli.core.sliapi.rev161110.$YangModuleInfoImpl.getInstance());
        models.add(org.opendaylight.yang.gen.v1.org.onap.ccsdk.sli.northbound.lcm.rev180329.$YangModuleInfoImpl.getInstance());
        models.add(org.opendaylight.yang.gen.v1.org.onap.ccsdk.sli.northbound.datachange.rev150519.$YangModuleInfoImpl.getInstance());
        models.add(org.opendaylight.yang.gen.v1.org.onap.ccsdk.sli.northbound.asdcapi.common.rev170201.$YangModuleInfoImpl.getInstance());
        models.add(org.opendaylight.yang.gen.v1.http.xmlns.onap.org.asdc.license.model._1._0.rev160427.$YangModuleInfoImpl.getInstance());
        models.add(org.opendaylight.yang.gen.v1.org.onap.ccsdk.rev170201.$YangModuleInfoImpl.getInstance());

        // start Lighty Controller
        ControllerConfiguration defaultSingleNodeConfiguration =
                ControllerConfigUtils.getDefaultSingleNodeConfiguration(models);
        LightyControllerBuilder lightyControllerBuilder = new LightyControllerBuilder();
        LightyController lightyController = lightyControllerBuilder.from(defaultSingleNodeConfiguration).build();
        lightyController.start().get();

        // start Ligty Restconf
        RestConfConfiguration defaultRestconfConfig = RestConfConfigUtils.getDefaultRestConfConfiguration();
        defaultRestconfConfig.setHttpPort(8181);
        try {
            defaultRestconfConfig.setInetAddress(InetAddress.getLocalHost());
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
        CommunityRestConfBuilder communityRestConfBuilder = new CommunityRestConfBuilder();
        CommunityRestConf communityRestConf = communityRestConfBuilder
                .from(RestConfConfigUtils.getRestConfConfiguration(defaultRestconfConfig, lightyController.getServices()))
                .build();
        communityRestConf.start().get();

        AAAEncryptionService aaaEncryptionService = createAAAEncryptionService(getDefaultAaaEncryptServiceConfig());

        DataBroker dataBroker = lightyController.getServices().getControllerBindingDataBroker();
        NotificationPublishService notificationPublishService = lightyController.getServices().getControllerBindingNotificationPublishService();
        RpcProviderRegistry rpcProviderRegistry = lightyController.getServices().getControllerRpcProviderRegistry();

        // start Lighty CCSDK
        CcsdkLightyModule ccsdkLightyModule = new CcsdkLightyModule(dataBroker, notificationPublishService, rpcProviderRegistry, aaaEncryptionService);
        ccsdkLightyModule.startBlocking();
    }

    public static AAAEncryptionService createAAAEncryptionService(AaaEncryptServiceConfig encrySrvConfig) throws ConfigurationException {
        final byte[] encryptionKeySalt = Base64.getDecoder().decode(encrySrvConfig.getEncryptSalt());
        try {
            final SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(encrySrvConfig.getEncryptMethod());
            final KeySpec keySpec = new PBEKeySpec(encrySrvConfig.getEncryptKey().toCharArray(), encryptionKeySalt,
                    encrySrvConfig.getEncryptIterationCount(), encrySrvConfig.getEncryptKeyLength());
            SecretKey key = new SecretKeySpec(keyFactory.generateSecret(keySpec).getEncoded(), encrySrvConfig.getEncryptType());
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

    public static AaaEncryptServiceConfig getDefaultAaaEncryptServiceConfig() {
        return new AaaEncryptServiceConfigBuilder().setEncryptKey("V1S1ED4OMeEh")
                .setPasswordLength(12).setEncryptSalt("TdtWeHbch/7xP52/rp3Usw==")
                .setEncryptMethod("PBKDF2WithHmacSHA1").setEncryptType("AES")
                .setEncryptIterationCount(32768).setEncryptKeyLength(128)
                .setCipherTransforms("AES/CBC/PKCS5Padding").build();
    }
}
