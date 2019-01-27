import { Test } from '@nestjs/testing';
import { AppLogger } from '../logger/app-logger.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { nodeProviders } from './node.providers';
import { RSAService } from '../crypto/rsa.service';
import { rsaProviders } from '../crypto/rsa.providers';
import { NodeDto } from './dto/create-node.dto';

let correctChainHead: NodeDto = {
  hash: "b71e160660dbd02a2da33bcc3a6cb95b2056fb5588901b130dfb87e55c26f46e",
  parentHash: "",
  authorPublicKey: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----",
  signature: "cde082f111412787e8e788215ebe27dde711f3df93a21fb752615e236ea9cdb144a3cdbddf9b87c62c3149ccf41ca38fb67ad0ea844812f1e1528c9a964d9e5da3b3048ce657beb9641a525088e8bc2e6e51549dc691ea422b2d8b769bf25e87ebbd9e8eaae25150d14af3019e987ebe29de651e5a9289ef0674a8a2d4ed2708ec10ca365c54ebc77ba77739c1c31df95cced7679eb0fbcd6810d90c028c91fe70a151261ec2c2a34a2bebaa7f1ac7740d80b95e82b9f814defab932d4ed3d9ad8d58f3692a6746f85a460130c3c8660883c927886966411f4612dbe68fcd93449af7edf1ba31b89a40e11138f826c88e3e1030bbd45c0b6f18dd89aba029c72",
  type: 1,
  votingDescription: "test",
  startTime: 1548979200000,
  endTime: 1549238400000,
  candidates: [
      "test1",
      "test2",
      "test3"
  ],
  admittedVoters: [
      1,
      2,
      3
  ],
  registeredVoters: [],
  votingPublicKey: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDzVXypOUQRF/IwE9I+a\nXtkcNek4GUxeuw5az6aKt810MW6Lvi0AhZxCqWSstx52VJPpBuvhDMLoyLhiRZVt\n/Ua/JB1QcQN/4FTI5cymq3jMyRVqJqCHDmwAkPCI20tSnWiNY5mc/zgUq80yvUKS\n4LPQ21Squok5cvzS2vmfnZGJmABt3cvlNtMXCvsnFQDkIsxrA2mQyIQXet8J13Tr\npVMaYo6nZY39pQA+tQWqWjykK9Pao7WPjMmAUnN4e+q7hc2qZEOPFacVR6lK53Zp\nFMkjHMuSw545mT4AOZ3wL67SMG4mgPGClcLxQiEeaIqV+Ak/Yoo86dPZRTXy7mao\nYQIDAQAB\n-----END PUBLIC KEY-----",
  admittedUserPublicKey: "",
  selectedVariant: ""
};

describe('NodeController tests', () => {

  let nodeController: NodeController;

  beforeAll(async () => {

    const mockAppLoggerProvider = {
      provide: 'logger',
      useFactory: async () => { return new AppLogger('logs', 'node-test.txt') }
    };
    
    const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          AuthModule,
          ConfigModule
        ],
        controllers: [NodeController],
        providers: [mockAppLoggerProvider, NodeService, ...nodeProviders, RSAService, ...rsaProviders]
      }).compile();

      nodeController = module.get<NodeController>(NodeController);
  });

  describe('createChainHeadTest', () => {

    it('should throw Error about incorrect authorPublicKey', async () => {
      
      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {authorPublicKey: "-----BEGINPUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----"});
      //вот так в JEST ловятся reject-ы async-функций
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect authorPublicKey!');
      }
    });

    it('should throw Error about incorrect hash', async () => {

      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {hash: "B71e160660dbd02a2da33bcc3a6cb95b2056fb5588901b130dfb87e55c26f46e"});
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect hash!');
      }
    });

    //TODO: переписать с формированием дат начала и конца, привязанных к now
    it('should throw Error about existing node in DB', async () => {

      //вначале пишем корректную ноду (это и будет в тч и тест), потом пробуем записать её во второй раз, потом удаляем ноду
      await nodeController.createChain(correctChainHead);
      try {
        await nodeController.createChain(correctChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Such node already exists!');
      }
      await nodeController.deleteChain(correctChainHead.hash);
    });

    it('should throw Error about incorrect args', async () => {

      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {
        hash: "f915270fdd9d6ddf83019b3676380c273493f55e37847d55801add996e043891",
        signature: "558d53bf71377dc9fa6cb4b6a1d4da987168bc3c18f8aa53c37f14c21cd4429c1b4218723ca4c50ccf35b5580d5c5797d726c398fc4a92d3b5d067e1c6efb2f68554dcb6f176a2f4c49fe7518606d7493231aab965252671ea598273cb26e70f55fcce1d84a89ed6ed4855d284f98a47881898f775bcc819b42b87dc899c0b03a2251d098fa9c51cc632500e63c9c209925d8e175c3505819834fec602aa075e1507064db11ea98df0a8e14c051e46aa593dfdcfaa965df842fa73a138e3de3645dd3d3406228f51e743e455b5403834f4eee6378134b6c49be95a65107d63c8667618905676028de6eb1d3507371334a103c2e0a6a1a79cd4c74b7f6cc165c7",
        startTime: 1348979200000,
        endTime: 1449238400000
      });
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect args!');
      }
    });

    //TODO: переписать с формированием дат начала и конца, привязанных к now
    it('should throw Error about incorrect votingPublicKey', async () => {
      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {
        hash: "819364948c3605a322f2216dee953d7f8f0d65986ce7610df88b52538c434795",
        signature: "4e5be3708b2af05a4012902efe8ae02c2ba66498f9b27e66cb5b8820123fb5b8b35ef4cfbcccee8795919f8abf6ccfd33879846fb2910e69fd6b814723a449fad9e89468996abaf8fd617bfcd9b924ba10e102cd18a4cd6a3392f8deb63a738bdbe00f61fc78f73b63ce75982f669d885f3640b19d078bf93dcd04ad623cead52bfdbbdcbae067c4e55d55fb92ad562df5a35e75151012a232a2501c5ebf6118e4f63c77320ddb6a044f99d604e3f043b732ebb8627962d5827bd0dc6b3dfb8572b56b2e5b8c79f7624b0cd58058fefe8fffd8055c979d82e23f1e6bb5e9a639f745bf70840286911c5490676f9a18bd0ba561f4727aaf7d24a88b600dd6658f",
        votingPublicKey: "-----BEGINPUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDzVXypOUQRF/IwE9I+a\nXtkcNek4GUxeuw5az6aKt810MW6Lvi0AhZxCqWSstx52VJPpBuvhDMLoyLhiRZVt\n/Ua/JB1QcQN/4FTI5cymq3jMyRVqJqCHDmwAkPCI20tSnWiNY5mc/zgUq80yvUKS\n4LPQ21Squok5cvzS2vmfnZGJmABt3cvlNtMXCvsnFQDkIsxrA2mQyIQXet8J13Tr\npVMaYo6nZY39pQA+tQWqWjykK9Pao7WPjMmAUnN4e+q7hc2qZEOPFacVR6lK53Zp\nFMkjHMuSw545mT4AOZ3wL67SMG4mgPGClcLxQiEeaIqV+Ak/Yoo86dPZRTXy7mao\nYQIDAQAB\n-----END PUBLIC KEY-----"
      });
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect votingPublicKey!');
      }
    });

    //TODO: переписать с формированием дат начала и конца, привязанных к now
    it('should throw Error about incorrect signature', async () => {
      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {
        signature: "de082f111412787e8e788215ebe27dde711f3df93a21fb752615e236ea9cdb144a3cdbddf9b87c62c3149ccf41ca38fb67ad0ea844812f1e1528c9a964d9e5da3b3048ce657beb9641a525088e8bc2e6e51549dc691ea422b2d8b769bf25e87ebbd9e8eaae25150d14af3019e987ebe29de651e5a9289ef0674a8a2d4ed2708ec10ca365c54ebc77ba77739c1c31df95cced7679eb0fbcd6810d90c028c91fe70a151261ec2c2a34a2bebaa7f1ac7740d80b95e82b9f814defab932d4ed3d9ad8d58f3692a6746f85a460130c3c8660883c927886966411f4612dbe68fcd93449af7edf1ba31b89a40e11138f826c88e3e1030bbd45c0b6f18dd89aba029c72"
      });
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect signature!');
      }
    });

    //TODO: переписать с формированием дат начала и конца, привязанных к now
    it('should throw Error about incorrect candidates array', async () => {
      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {
        hash: "b405baf9b3b16d4089cdfa354ea5e49908d1fd781ce46dbf41d92a313b4fea0a",
        signature: "13381b89358a7fa55158992e1a23d2ce08efcc3b213fe449492e141cdcc35202b814659a846fd8aa1443b7eca38bcfba71ba4ff25df62b17a3ab07efbb2cbcd56dd5fe3d1d59cdbf63e25b011c26c7b88ad9b3fe6ee3359f11cb6b9a2508c0189e9e417e046f68016fef64d569d5f71792b8b0da559363bd37d8dc1e6351da268fa5e5becc80e53502063b5795402148b5d4e0d3e78e878800450722b7083f46662e57e55eceffb109dbaa4526f59e31cead4173576e1200405cee50a611dc51833ab14e8ef62c53f6ad37f389df5f5570de5d1a0a5d837732973792b0f9803055dc0e64bbdc29852379df0168b58abdab62299411f6108e33e01250168f723d",
        candidates: []
      });
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Candidates are empty or incorrect!');
      }
    });

    //TODO: переписать с формированием дат начала и конца, привязанных к now
    it('should throw Error about incorrect registeredVoters array', async () => {
      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {
        hash: "3f19a29518035668e2287dea291de312ac8bf5f7e626dcb099e833740d82cad6",
        signature: "b7fa274fab7678a8e7264a47ca896adb3c8300f786cb646bcb8968124dc6f8c5e113f7d6a401df7b0c1dc4a800c9e67dc3efafb4e46521f3110f5be0c052af770681e08d40c2fcca0505f7bc0fcfdb9faa27cd4fa5b3000bd12f1ea987f4b3b8e90f6879904b01caf240fc6ed1e76fc6ac4ebc7e8919663cb24516cbce5a41f84b8f18a5c5a799c28800c548539dc1f3a821f56b2d94d6e87a20d2334337403a98f3ce9e47a70e6198f7543c2d3b9f270f464f73c3f6cace936905fdd27c1326c1dcfa001e5c180d3d686d78f5564a6d24d879fca7374f9d11045c18e1d2451d69684811cf535e5a02052f20145f2d06ea5f82f5544a8bc8372008dc78e4753f",
        registeredVoters: [1, 2]
      });
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Registered voters is not empty!');
      }
    });
  });
});
