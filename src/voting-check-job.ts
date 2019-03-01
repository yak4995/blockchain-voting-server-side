import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { Node } from './nodes/interfaces/node.interface';
import { NodeDto } from './nodes/dto/create-node.dto';
import { RSAService } from './crypto/rsa.service';
import { NodeReadService } from './nodes/services/node-read.service';
import { NodePersistanceService } from './nodes/services/node-persistance.service';
import { RegisteredVotersService } from './nodes/services/registered-voters.service';
import { NodeModule } from './nodes/node.module';

(async () => {
  const app: INestApplicationContext = await NestFactory.createApplicationContext(NodeModule);
  const nodeReadService: NodeReadService = app.get<NodeReadService>(NodeReadService);
  const nodePersistanceService: NodePersistanceService = app.get<NodePersistanceService>(NodePersistanceService);
  const registeredVotersService: RegisteredVotersService = app.get<RegisteredVotersService>(RegisteredVotersService);
  const rsaService: RSAService = app.get<RSAService>(RSAService);

  const actualVotings: Node[] = await nodeReadService.getAllChainHeadsInCurrentBoundaries();

  async function processVoting(currentChainHead: Node): Promise<void> {
    const lastChainNode: Node = await nodeReadService.getLastChainNode(currentChainHead.hash);

    if (lastChainNode.type === 2) {
      const registeredVoters: number[] = await registeredVotersService.getRegisteredVotersByVotingHash(currentChainHead.hash);
      registeredVotersService.purgeRegisteredVotersInfoByVotingHash(currentChainHead.hash);
      const startNodeObj = {
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
      };
      const startNode: NodeDto = await nodePersistanceService.getNodeWithHashAndSign(
        startNodeObj,
        await rsaService.getPrivateKeyByPublic(currentChainHead.votingPublicKey)
      );
      await nodePersistanceService.startVoting(startNode);
    } else {
    }
  }

  for (const actualVoting of actualVotings) {
    await processVoting(actualVoting);
  }
})().then(() => process.exit(0));
