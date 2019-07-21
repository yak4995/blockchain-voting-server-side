import { Injectable, Inject } from '@nestjs/common';
import * as NodeRSA from 'node-rsa';
import { sha256 } from 'js-sha256';
import BaseRepository from '../common/base.repository';
import { IKeyPair } from './interfaces/i-key-pair.interface';

@Injectable()
export class RSAService {
  private RSAKey: NodeRSA;

  constructor(
    @Inject('KeyPairRepository')
    private readonly keyPairRepository: BaseRepository<IKeyPair>,
  ) {
    this.RSAKey = new NodeRSA();
  }

  async generateKeyPair(): Promise<IKeyPair> {
    const RSAKeyGenerator = new NodeRSA().generateKeyPair();
    return {
      publicKey: RSAKeyGenerator.exportKey('pkcs8-public-pem'),
      privateKey: RSAKeyGenerator.exportKey('pkcs8-private-pem'),
    };
  }

  async saveKeyPair(keyPair: IKeyPair) {
    return this.keyPairRepository.create(keyPair.publicKey, keyPair.privateKey);
  }

  async getMsgSignature(payload: string, privateKey: string): Promise<string> {
    this.RSAKey.importKey(privateKey, 'pkcs8-private-pem');
    this.RSAKey.setOptions({ signingScheme: 'pkcs1-sha256' });

    return this.RSAKey.sign(payload, 'hex');
  }

  async getObjSignature(payload: object, privateKey: string): Promise<string> {
    this.RSAKey.importKey(privateKey, 'pkcs8-private-pem');
    this.RSAKey.setOptions({ signingScheme: 'pkcs1-sha256' });

    return this.RSAKey.sign(payload, 'hex');
  }

  async verifyMsgSignature(payload: string, signature: string, publicKey: string): Promise<boolean> {
    this.RSAKey.importKey(publicKey, 'pkcs8-public-pem');
    this.RSAKey.setOptions({ signingScheme: 'pkcs1-sha256' });

    return this.RSAKey.verify(Buffer.from(payload), Buffer.from(signature, 'hex'), 'hex');
  }

  async getMsgHash(payload: string): Promise<string> {
    return sha256(payload);
  }

  async getObjHash(payload: object): Promise<string> {
    return sha256(JSON.stringify(payload));
  }

  async getPrivateKeyByPublic(publicKey: string): Promise<string> {
    const privateKey: IKeyPair[] = await this.keyPairRepository.findByAndCriteria({ publicKey });
    return privateKey.length > 0 ? privateKey[0].privateKey : '';
  }
}
