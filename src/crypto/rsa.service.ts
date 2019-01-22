import { Injectable, Inject } from '@nestjs/common';
import { KeyPair } from './interfaces/key-pair.interface';
import { Model } from 'mongoose';
import { KeyPairDTO } from './dto/get-key-pair.dto';
import * as NodeRSA from 'node-rsa';

@Injectable()
export class RSAService {

    private RSAKey: NodeRSA;

    constructor(
        @Inject('KeyPairModelToken') private readonly keyPairModel: Model<KeyPair>
    ) {
        this.RSAKey = new NodeRSA();
    }

    async generateKeyPair(): Promise<KeyPairDTO> {
        
        const RSAKeyGenerator = (new NodeRSA()).generateKeyPair();
        return {
            publicKey: RSAKeyGenerator.exportKey('pkcs8-public-pem'),
            privateKey: RSAKeyGenerator.exportKey('pkcs8-private-pem')
        };
    }

    async saveKeyPair(keyPair: KeyPairDTO)  {

        return new this.keyPairModel(keyPair).save();
    }

    async getMsgSignature(payload: string, privateKey: string): Promise<string> {

        this.RSAKey.importKey(privateKey, 'pkcs8-private-pem');
        this.RSAKey.setOptions({signingScheme: 'pkcs1-sha256'});

        return this.RSAKey.sign(payload, 'hex');
    }

    async verifyMsgSignature(payload: string, signature: string, publicKey: string): Promise<boolean> {

        this.RSAKey.importKey(publicKey, 'pkcs8-public-pem');
        this.RSAKey.setOptions({signingScheme: 'pkcs1-sha256'});
        
        return this.RSAKey.verify(Buffer.from(payload), Buffer.from(signature, 'hex'), 'hex');
    }
}