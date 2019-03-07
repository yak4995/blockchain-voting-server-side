import { Test } from '@nestjs/testing';
import { HttpModule, HttpService, NotFoundException, BadRequestException } from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { NodeController } from './node.controller';
import { nodeProviders } from './node.providers';
import { RSAService } from '../crypto/rsa.service';
import { rsaProviders } from '../crypto/rsa.providers';
import { NodeDto } from './dto/create-node.dto';
import { AxiosService } from '../axios/axios.service';
import { ConfigService } from '../config/config.service';
import { NodeReadService } from './services/node-read.service';
import { NodePersistanceService } from './services/node-persistance.service';
import { RegisteredVotersService } from './services/registered-voters.service';
import { NodeValidationService } from './services/node-validation.service';
import { BullModule } from 'nest-bull';
import { NodeSenderProcessor } from './processors/node-sender.processor';

// votingPublicKey - первый в парах в базе
const correctChainHead: NodeDto = {
  hash: 'a657f12ff38fb472b426ad5fd8471e70276293fab77603ef044177742a226ba3',
  parentHash: '',
  authorPublicKey:
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----',
  signature:
    '09bc556b192e0e1b1fa9825ffa499eb13875aaba00968286c00ad923411fe54054a95109f631bbce6d2ebfe8fa726daf4d4872733ea316f352ee4334fec571498bef90f2460d5ae7a17254423bdd610fea951ae7b6ef1abfee50ea8e03519475f4cecdf04f2f92f829670e0645e0e4b06fad1ec4b564bf613f099f9cb97417dff4cca6cd2111048827e3460f98cf1420ae1ce76b6422d44d0996b71af118895f06089f3fcf4bbe00e7f64e0850dddfffbc2bc85121ce0de04bbe7e45df52ef065467b734fc27db7d3791973cd64d76a3c02377a9bd7e8683bd242d7f13f7eefe15da8431e9de6337b7ab36d1e0947473f23425cd54ea8ffd9c19a198f824c112',
  type: 1,
  votingDescription: 'test',
  startTime: 1704067200000,
  endTime: 1706572800000,
  candidates: ['test1', 'test2', 'test3'],
  admittedVoters: [1, 2, 3],
  registeredVoters: [],
  votingPublicKey:
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDzVXypOUQRF/IwE9I+a\nXtkcNek4GUxeuw5az6aKt810MW6Lvi0AhZxCqWSstx52VJPpBuvhDMLoyLhiRZVt\n/Ua/JB1QcQN/4FTI5cymq3jMyRVqJqCHDmwAkPCI20tSnWiNY5mc/zgUq80yvUKS\n4LPQ21Squok5cvzS2vmfnZGJmABt3cvlNtMXCvsnFQDkIsxrA2mQyIQXet8J13Tr\npVMaYo6nZY39pQA+tQWqWjykK9Pao7WPjMmAUnN4e+q7hc2qZEOPFacVR6lK53Zp\nFMkjHMuSw545mT4AOZ3wL67SMG4mgPGClcLxQiEeaIqV+Ak/Yoo86dPZRTXy7mao\nYQIDAQAB\n-----END PUBLIC KEY-----',
  admittedUserPublicKey: '',
  selectedVariant: '',
};

const correctRegisterVotingNode: NodeDto = {
  hash: '',
  parentHash: 'a657f12ff38fb472b426ad5fd8471e70276293fab77603ef044177742a226ba3',
  authorPublicKey:
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnDzVXypOUQRF/IwE9I+a\nXtkcNek4GUxeuw5az6aKt810MW6Lvi0AhZxCqWSstx52VJPpBuvhDMLoyLhiRZVt\n/Ua/JB1QcQN/4FTI5cymq3jMyRVqJqCHDmwAkPCI20tSnWiNY5mc/zgUq80yvUKS\n4LPQ21Squok5cvzS2vmfnZGJmABt3cvlNtMXCvsnFQDkIsxrA2mQyIQXet8J13Tr\npVMaYo6nZY39pQA+tQWqWjykK9Pao7WPjMmAUnN4e+q7hc2qZEOPFacVR6lK53Zp\nFMkjHMuSw545mT4AOZ3wL67SMG4mgPGClcLxQiEeaIqV+Ak/Yoo86dPZRTXy7mao\nYQIDAQAB\n-----END PUBLIC KEY-----',
  signature: '',
  type: 2,
  votingDescription: '',
  startTime: 0,
  endTime: 0,
  candidates: [],
  admittedVoters: [],
  registeredVoters: [],
  votingPublicKey: '',
  admittedUserPublicKey:
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgXS312Dk1daptRM0iH/J\n5sAfW2KdrJBzAhaHmwFVZj9YLQ3d6YYZqSReZNrShDsuhwh0TQT8HRDR44odIICo\nhmtC9OLKRFS6uwuxgxWqYA6/k7ktegRxjqVOWIonNrEQk2fMUxdRn2mYXZqdv5Nh\nRE7WQ1DnWS/A+7nxb7mDye27o7oGzSOqolObQcIGXmOoNCm5SRZPsPL6VEx1Vo64\nl14Xny4AJVNQaR10Eo6IhaeiY7Xt9x8ljFN7DXLrW7qBarhgQBSMh82hCLUZQoOj\nwxvJJbwieHBxOnvAypsPUD1T7+NYFHq/l5DzCrDBc9anJuknRCl8z6/0ZTDlZYyi\nhwIDAQAB\n-----END PUBLIC KEY-----',
  selectedVariant: '',
};

const correctVote: NodeDto = {
  hash: '',
  parentHash: 'test',
  authorPublicKey: 'test',
  signature: '',
  type: 4,
  votingDescription: '',
  startTime: 0,
  endTime: 0,
  candidates: [],
  admittedVoters: [],
  registeredVoters: [],
  votingPublicKey: '',
  admittedUserPublicKey: '',
  selectedVariant: 'test',
};

describe('NodeController tests', () => {
  let nodeController: NodeController,
    axiosService: AxiosService,
    rsaService: RSAService,
    nodeReadService: NodeReadService,
    nodeValidationService: NodeValidationService,
    registeredVotersService: RegisteredVotersService;

  beforeAll(async () => {
    const mockAppLoggerProvider = {
      provide: 'logger',
      useFactory: async () => {
        return new AppLogger('logs', 'node-test.txt');
      },
    };

    const module = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        AuthModule,
        HttpModule,
        BullModule.forRoot({
          name: 'store',
          options: {
            redis: {
              port: Number(process.env.REDIS_PORT),
              host: process.env.REDIS_URL,
              password: process.env.REDIS_PASS,
            },
          },
          processors: [
            {
              concurrency: 1,
              name: 'nodeSenderProcessor',
              callback: NodeSenderProcessor,
            },
          ],
        }),
      ],
      controllers: [NodeController],
      providers: [
        mockAppLoggerProvider,
        NodeReadService,
        NodeValidationService,
        NodePersistanceService,
        RegisteredVotersService,
        ...nodeProviders,
        RSAService,
        ...rsaProviders,
        { provide: AxiosService, useValue: new AxiosService(new ConfigService('test'), new HttpService(), null) },
      ],
    }).compile();

    axiosService = module.get<AxiosService>(AxiosService);
    nodeReadService = module.get<NodeReadService>(NodeReadService);
    nodeValidationService = module.get<NodeValidationService>(NodeValidationService);
    registeredVotersService = module.get<RegisteredVotersService>(RegisteredVotersService);
    rsaService = module.get<RSAService>(RSAService);
    nodeController = module.get<NodeController>(NodeController);

    jest.spyOn(nodeController, 'broadcastNode').mockImplementation(async (node: any) => {
      return;
    });
  });

  describe('createChainHeadTest', () => {
    it('should throw Error about incorrect authorPublicKey', async () => {
      const testChainHead: NodeDto = Object.assign({}, correctChainHead, { authorPublicKey: 'Some incorrect key' });
      // вот так в JEST ловятся reject-ы async-функций
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect authorPublicKey!');
      }
    });

    it('should throw Error about incorrect hash', async () => {
      jest.spyOn(rsaService, 'getMsgHash').mockImplementationOnce(async (payload: string) => {
        return 'incorrect hash';
      });

      try {
        await nodeController.createChain(correctChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect hash!');
      }

      jest.spyOn(rsaService, 'getMsgHash').mockClear();
    });

    it('should throw Error about existing node in DB', async () => {
      jest.spyOn(nodeReadService, 'findByHash').mockImplementationOnce(
        (hash: string): any => {
          return {};
        },
      );

      try {
        await nodeController.createChain(correctChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Such node already exists!');
      }

      jest.spyOn(nodeReadService, 'findByHash').mockClear();
    });

    it('should throw Error about incorrect dates', async () => {
      let testChainHead: NodeDto = Object.assign({}, correctChainHead, {
        hash: 'f915270fdd9d6ddf83019b3676380c273493f55e37847d55801add996e043891',
        signature:
          '558d53bf71377dc9fa6cb4b6a1d4da987168bc3c18f8aa53c37f14c21cd4429c1b4218723ca4c50ccf35b5580d5c5797d726c398fc4a92d3b5d067e1c6efb2f68554dcb6f176a2f4c49fe7518606d7493231aab965252671ea598273cb26e70f55fcce1d84a89ed6ed4855d284f98a47881898f775bcc819b42b87dc899c0b03a2251d098fa9c51cc632500e63c9c209925d8e175c3505819834fec602aa075e1507064db11ea98df0a8e14c051e46aa593dfdcfaa965df842fa73a138e3de3645dd3d3406228f51e743e455b5403834f4eee6378134b6c49be95a65107d63c8667618905676028de6eb1d3507371334a103c2e0a6a1a79cd4c74b7f6cc165c7',
        startTime: 1348979200000,
        endTime: 1449238400000,
      });
      try {
        await nodeController.createChain(testChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect type or dates!');
      }
    });

    it('should throw Error about incorrect votingPublicKey', async () => {
      jest.spyOn(rsaService, 'getPrivateKeyByPublic').mockImplementationOnce(async (publicKey: string) => {
        return '';
      });

      try {
        await nodeController.createChain(correctChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect votingPublicKey!');
      }

      jest.spyOn(rsaService, 'getPrivateKeyByPublic').mockClear();
    });

    it('should throw Error about incorrect signature', async () => {
      jest.spyOn(rsaService, 'getPrivateKeyByPublic').mockImplementationOnce(async (publicKey: string) => {
        return 'smth';
      });
      jest.spyOn(rsaService, 'verifyMsgSignature').mockImplementationOnce(async (payload: string, signature: string, publicKey: string) => {
        return false;
      });

      try {
        await nodeController.createChain(correctChainHead);
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect signature!');
      }

      jest.spyOn(rsaService, 'verifyMsgSignature').mockClear();
      jest.spyOn(rsaService, 'getPrivateKeyByPublic').mockClear();
    });
  });

  describe('Registering new voter test', () => {
    beforeAll(() => {
      jest.spyOn(nodeReadService, 'findByHash').mockImplementation(
        (hash: string): any => {
          if (hash === 'incorrect') {
            throw new BadRequestException('Incorrect hash!', 'Current node with specified hash does not exist!');
          } else {
            return {};
          }
        },
      );
      jest.spyOn(axiosService, 'getUserByAccessToken').mockImplementation(async (accessToken: string) => {
        if (accessToken === 'fake') throw new NotFoundException(null, 'Request failed with status code 404');
        return accessToken === 'access-token-for-5-id' ? { id: 5 } : { id: 2 };
      });
    });

    it('validate voter test. Should throw Error about incorrect accessToken', async () => {
      try {
        await nodeController.registerVoter(correctRegisterVotingNode, 2, 'fake');
      } catch (e) {
        expect(e.message.error).toMatch('Request failed with status code 404');
      }
    });

    it('should throw Error about type', async () => {
      let testRegisterVotingNode: NodeDto = Object.assign({}, correctRegisterVotingNode, {
        type: 3,
      });
      try {
        await nodeController.registerVoter(testRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('Incorrect type!');
      }
    });

    it('should throw Error about non-existing parent node', async () => {
      let testRegisterVotingNode: NodeDto = Object.assign({}, correctRegisterVotingNode, {
        parentHash: 'incorrect',
      });
      try {
        await nodeController.registerVoter(testRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('Node with specified parent hash doesn`t exist!');
      }
    });

    it('should throw Error about existing child', async () => {
      jest.spyOn(nodeReadService, 'findNodeChildren').mockImplementationOnce(
        (hash: string): any => {
          return ['someParentNode'];
        },
      );

      try {
        await nodeController.registerVoter(correctRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('Parent node already have children!');
      }

      jest.spyOn(nodeReadService, 'findNodeChildren').mockClear();
    });

    it('should throw Error about incorrect voting date', async () => {
      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockImplementationOnce(async (hash: string) => {
        let objectForCheck: any = {};
        Object.keys(correctChainHead).forEach(key => (objectForCheck[key] = objectForCheck[key]));
        objectForCheck.startTime = 1348979200000;
        return objectForCheck;
      });

      try {
        await nodeController.registerVoter(correctRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('The voting already has been started!');
      }

      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockClear();
    });

    it('should throw Error about author key', async () => {
      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockImplementationOnce(
        (hash: string): any => {
          return {
            votingPublicKey: 'another fake',
            startTime: new Date().valueOf() + 10000,
            admittedVoters: [2],
          };
        },
      );

      let testRegisterVotingNode: NodeDto = Object.assign({}, correctRegisterVotingNode, {
        authorPublicKey: 'fake',
      });
      try {
        await nodeController.registerVoter(testRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('You have to write voting public key in author field!');
      }

      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockClear();
    });

    it('should throw Error about already registered user', async () => {
      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockImplementationOnce(
        (hash: string): any => {
          return {
            votingPublicKey: correctRegisterVotingNode.authorPublicKey,
            startTime: new Date().valueOf() + 10000,
            admittedVoters: [2],
          };
        },
      );
      jest.spyOn(registeredVotersService, 'isRegisteredVoter').mockImplementationOnce(async (hash: string, voterId: number) => true);

      try {
        await nodeController.registerVoter(correctRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('This user has been registered in the voting already!');
      }

      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockClear();
      jest.spyOn(registeredVotersService, 'isRegisteredVoter').mockClear();
    });

    it('should throw Error about already registered key', async () => {
      jest.spyOn(nodeValidationService, 'isAdmittedVoter').mockImplementationOnce(async (someNodeHash: string, checkingPublicKey: string) => true);
      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockImplementationOnce(
        (hash: string): any => {
          return {
            votingPublicKey: correctRegisterVotingNode.authorPublicKey,
            startTime: new Date().valueOf() + 10000,
            admittedVoters: [2],
          };
        },
      );

      try {
        await nodeController.registerVoter(correctRegisterVotingNode, 2, 'qwerty');
      } catch (e) {
        expect(e.message.error).toMatch('This public key has been registered in the voting already!');
      }

      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockClear();
      jest.spyOn(nodeValidationService, 'isAdmittedVoter').mockClear();
    });

    it('should throw Error about non-admitted user', async () => {
      jest.spyOn(nodeValidationService, 'validateVoter').mockImplementationOnce(async (voterId: number, accessToken: string) => {});
      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockImplementationOnce(
        (hash: string): any => {
          return {
            votingPublicKey: correctRegisterVotingNode.authorPublicKey,
            startTime: new Date().valueOf() + 10000,
            admittedVoters: [2],
          };
        },
      );

      try {
        await nodeController.registerVoter(correctRegisterVotingNode, 5, 'access-token-for-5-id');
      } catch (e) {
        expect(e.message.error).toMatch('This user isn`t admitted voter of the voting!');
      }

      jest.spyOn(nodeReadService, 'findChainHeadByNodeHash').mockClear();
      jest.spyOn(nodeValidationService, 'validateVoter').mockClear();
    });

    afterAll(() => {
      jest.spyOn(nodeReadService, 'findByHash').mockClear();
      jest.spyOn(axiosService, 'getUserByAccessToken').mockClear();
    });
  });

  describe('voteTest', () => {
    beforeAll(() => {
      // мокаем getMsgHash и verifyMsgSignature, findByHash
      jest.spyOn(rsaService, 'getMsgHash').mockImplementation(async (payload: string) => {
        return '';
      });
      jest.spyOn(rsaService, 'verifyMsgSignature').mockImplementation(async (payload: string, signature: string, publicKey: string) => {
        return true;
      });
      jest.spyOn(nodeReadService, 'findByHash').mockImplementation(
        (hash: string): any => {
          switch (hash) {
            case 'fake':
              throw new BadRequestException('Incorrect hash!', 'Current node with specified hash does not exist!');
            case 'vote':
              return { type: 4 };
            case 'incorrect-type':
              return { type: 1 };
            case 'outdated':
              return { type: 3, startTime: +new Date() + 10000 };
            case 'incorrect-candidate':
              return { type: 3, startTime: +new Date() - 10000, endTime: +new Date() + 10000, candidates: ['somewho else'] };
            default:
              return { type: 3, startTime: +new Date() - 10000, endTime: +new Date() + 10000, candidates: ['test'] };
          }
        },
      );
    });

    it('should throw Error about absent parent node', async () => {
      let testVote: NodeDto = Object.assign({}, correctVote, {
        parentHash: 'fake',
      });
      try {
        await nodeController.registerVote(testVote);
      } catch (e) {
        expect(e.message.error).toMatch('Current node with specified hash does not exist!');
      }
    });

    it('should throw Error about not last vote as parent', async () => {
      jest.spyOn(nodeReadService, 'getFirstVoteByStartNodeHash').mockImplementationOnce(
        (hash: string): any => {
          return { type: 4 };
        },
      );

      try {
        await nodeController.registerVote(correctVote);
      } catch (e) {
        expect(e.message.error).toMatch('Start voting node already have votes with this author key! You must note your last vote as parent node');
      }

      jest.spyOn(nodeReadService, 'getFirstVoteByStartNodeHash').mockClear();
    });

    it('should throw Error about second primary vote', async () => {
      jest.spyOn(nodeReadService, 'findNodeChildren').mockImplementationOnce(
        (hash: string): any => {
          return [{ type: 4 }];
        },
      );

      let testVote: NodeDto = Object.assign({}, correctVote, {
        parentHash: 'vote',
      });
      try {
        await nodeController.registerVote(testVote);
      } catch (e) {
        expect(e.message.error).toMatch('Parent node already have children!');
      }

      jest.spyOn(nodeReadService, 'findNodeChildren').mockClear();
    });

    it('should throw Error about incorrect type of parent node', async () => {
      let testVote: NodeDto = Object.assign({}, correctVote, {
        parentHash: 'incorrect-type',
      });
      try {
        await nodeController.registerVote(testVote);
      } catch (e) {
        expect(e.message.error).toMatch('Parent node must have type 3 or 4!');
      }
    });

    it('should throw Error about outdated voting', async () => {
      let testVote: NodeDto = Object.assign({}, correctVote, {
        parentHash: 'outdated',
      });
      try {
        await nodeController.registerVote(testVote);
      } catch (e) {
        expect(e.message.error).toMatch('Voting have not started or already have finished!');
      }
    });

    it('should throw Error about incorrect candidate', async () => {
      let testVote: NodeDto = Object.assign({}, correctVote, {
        parentHash: 'incorrect-candidate',
      });
      try {
        await nodeController.registerVote(testVote);
      } catch (e) {
        expect(e.message.error).toMatch('Selected candidate doesn`t exist!');
      }
    });

    it('should throw Error about not registered voter', async () => {
      jest.spyOn(nodeValidationService, 'isAdmittedVoter').mockImplementationOnce(async (someNodeHash: string, checkingPublicKey: string) => {
        return false;
      });

      try {
        await nodeController.registerVote(correctVote);
      } catch (e) {
        expect(e.message.error).toMatch('Your are not registered voter!');
      }

      jest.spyOn(nodeValidationService, 'isAdmittedVoter').mockClear();
    });

    afterAll(() => {
      jest.spyOn(rsaService, 'getMsgHash').mockClear();
      jest.spyOn(rsaService, 'verifyMsgSignature').mockClear();
      jest.spyOn(nodeReadService, 'findByHash').mockClear();
    });
  });

  afterAll(() => {
    jest.spyOn(nodeController, 'broadcastNode').mockClear();
  });
});
