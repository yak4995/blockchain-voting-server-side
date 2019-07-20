import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { Node } from './nodes/interfaces/node.interface';
import { RSAService } from './crypto/rsa.service';
import { NodeReadService } from './nodes/services/node-read.service';
import { NodePersistanceService } from './nodes/services/node-persistance.service';
import { RegisteredVotersService } from './nodes/services/registered-voters.service';
import { NodeModule } from './nodes/node.module';
import { NodeType } from './nodes/enums/nodeType.enum';

async function votingCheckJobRun() {
  const
    app: INestApplicationContext = await NestFactory.createApplicationContext(NodeModule),
    nodeReadService: NodeReadService = app.get<NodeReadService>(NodeReadService),
    nodePersistanceService: NodePersistanceService = app.get<NodePersistanceService>(NodePersistanceService),
    registeredVotersService: RegisteredVotersService = app.get<RegisteredVotersService>(RegisteredVotersService),
    rsaService: RSAService = app.get<RSAService>(RSAService),
    actualVotings: Node[] = await nodeReadService.getAllChainHeadsInCurrentBoundaries();

  async function processVoting(currentChainHead: Node) {
    const lastChainNode: Node = await nodeReadService.getLastChainNode(currentChainHead.hash);

    if (NodeType.REGISTER_VOTER === lastChainNode.type) {
      const [registeredVoters, privateKey] = await Promise.all([
        registeredVotersService.getRegisteredVotersByVotingHash(currentChainHead.hash),
        rsaService.getPrivateKeyByPublic(currentChainHead.votingPublicKey),
        registeredVotersService.purgeRegisteredVotersInfoByVotingHash(currentChainHead.hash),
      ]);
      nodePersistanceService
      .getNodeWithHashAndSign(
        {
          parentHash: lastChainNode.hash,
          authorPublicKey: currentChainHead.votingPublicKey,
          type: 3,
          votingDescription: currentChainHead.votingDescription,
          startTime: currentChainHead.startTime,
          endTime: currentChainHead.endTime,
          candidates: currentChainHead.candidates,
          admittedVoters: currentChainHead.admittedVoters,
          registeredVoters,
          votingPublicKey: '',
          admittedUserPublicKey: '',
          selectedVariant: '',
        },
        privateKey,
      )
      .then(startNode => nodePersistanceService.startVoting(startNode));
    }
  }
  await Promise.all(actualVotings.map(actualVoting => processVoting(actualVoting)));
}

votingCheckJobRun()
  .then(() => process.exit(0));
