import { Ed25519, ChaCha20Poly1305, ChaCha20} from "@iota/crypto.js";
import { Converter } from "@iota/util.js";

export default function useCrypto() {
  // Encryption/Decryption key and nonce (Nonce should change between request, but static one is good enough for this prototype)
  const key = Converter.hexToBytes("afasdfadsfadsfasdfasdf");
  const nonce = Converter.hexToBytes("asdasds");

  const sign = (data: string, private_key_hex: string) : Uint8Array => {
    const signature = Ed25519.sign(Converter.hexToBytes(private_key_hex), Converter.utf8ToBytes(data));

    return signature;
  }

  const validateSignature = (data: string, signature: Uint8Array, public_key_hex: string) : boolean => {
    const verified = Ed25519.verify(Converter.hexToBytes(public_key_hex), Converter.utf8ToBytes(data), signature)
    return verified;
  }

  const encrypt = (data: string) : Uint8Array => {
    const dataBytes = Converter.utf8ToBytes(data);

    const encryptor = new ChaCha20(key, nonce);
    const encrypted = encryptor.encrypt(dataBytes);

    return encrypted;
  }

  const decrypt = (encryptedData: Uint8Array) : string => {
    const decryptor = new ChaCha20(key, nonce);
    const decrypted = decryptor.decrypt(encryptedData);

    const data = Converter.bytesToUtf8(decrypted);

    return data;
  }
  
  return {sign, validateSignature, encrypt, decrypt};
}
