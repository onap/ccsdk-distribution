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

import java.nio.charset.Charset;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.xml.bind.DatatypeConverter;
import org.onap.ccsdk.sli.core.dblib.DBLIBResourceProvider;
import org.onap.ccsdk.sli.core.dblib.DBLIBResourceProviderLighty;
import org.opendaylight.aaa.encrypt.AAAEncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Custom implementation of the {@link AAAEncryptionService}. Original class {@link DBLIBResourceProvider} was accessing
 * instance of this interface via OGSi (BundleContext) and java reflection. The implementation of
 * the {@link AAAEncryptionService} has to be injected via constructor into the lighty.io version of the class with
 * removed OSGi dependency {@link DBLIBResourceProviderLighty}.
 */
public class AAAEncryptionServiceLightyImpl implements AAAEncryptionService {

    private static final Logger LOG = LoggerFactory.getLogger(AAAEncryptionServiceLightyImpl.class);

    private final Cipher encryptCipher;
    private final Cipher decryptCipher;

    public AAAEncryptionServiceLightyImpl(Cipher encryptCipher, Cipher decryptCipher) {
        this.encryptCipher = encryptCipher;
        this.decryptCipher = decryptCipher;
    }

    @Override
    public String encrypt(String data) {
        if (data != null && data.length() != 0 ) {
            try {
                synchronized (encryptCipher) {
                    byte[] cryptobytes = encryptCipher.doFinal(data.getBytes(Charset.defaultCharset()));
                    String cryptostring = DatatypeConverter.printBase64Binary(cryptobytes);
                    return cryptostring;
                }
            } catch (IllegalBlockSizeException | BadPaddingException e) {
                LOG.error("Failed to encrypt data.", e);
                return data;
            }
        } else {
            LOG.warn("data is empty or null.");
            return data;
        }
    }

    @Override
    public byte[] encrypt(byte[] data) {
        if (data != null && data.length != 0) {
            try {
                synchronized (encryptCipher) {
                    return encryptCipher.doFinal(data);
                }
            } catch (IllegalBlockSizeException | BadPaddingException e) {
                LOG.error("Failed to encrypt data.", e);
                return data;
            }
        } else {
            LOG.warn("data is empty or null.");
            return data;
        }
    }

    @Override
    public String decrypt(String encryptedData) {
        if (encryptedData != null && encryptedData.length() != 0) {
            try {
                byte[] cryptobytes = DatatypeConverter.parseBase64Binary(encryptedData);
                byte[] clearbytes = decryptCipher.doFinal(cryptobytes);
                return new String(clearbytes, Charset.defaultCharset());
            } catch (IllegalBlockSizeException | BadPaddingException e) {
                LOG.error("Failed to decrypt encoded data", e);
                return encryptedData;
            }
        } else {
            LOG.warn("encryptedData is empty or null.");
            return encryptedData;
        }
    }

    @Override
    public byte[] decrypt(byte[] encryptedData) {
        if (encryptedData != null && encryptedData.length != 0) {
            try {
                return decryptCipher.doFinal(encryptedData);
            } catch (IllegalBlockSizeException | BadPaddingException e) {
                LOG.error("Failed to decrypt encoded data", e);
                return encryptedData;
            }
        } else {
            LOG.warn("encryptedData is empty or null.");
            return encryptedData;
        }
    }

}
