import { NestFactory } from "@nestjs/core";
import { INestApplicationContext } from "@nestjs/common";
import { AppModule } from './app.module';
import { Node } from "./nodes/interfaces/node.interface";
import { NodeDto } from "./nodes/dto/create-node.dto";
import { RSAService } from "./crypto/rsa.service";
import { NodeReadService } from "./nodes/services/node-read.service";
import { NodePersistanceService } from "./nodes/services/node-persistance.service";
import { RegisteredVotersService } from "./nodes/services/registered-voters.service";

async function bootstrap() {

    const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);
    const nodeReadService: NodeReadService = app.get<NodeReadService>(NodeReadService);
    const nodePersistanceService: NodePersistanceService = app.get<NodePersistanceService>(NodePersistanceService);
    const registeredVotersService: RegisteredVotersService = app.get<RegisteredVotersService>(RegisteredVotersService);
    const rsaService: RSAService = app.get<RSAService>(RSAService);
    const actualVotings: Node[] = await nodeReadService.getAllChainHeadsInCurrentBoundaries();

    console.log('We got ' + actualVotings.length + ' actual votings.');
    actualVotings.forEach(async (currentChainHead: Node, currentIndex: number) => {

        const lastChainNode: Node = await nodeReadService.getLastChainNode(currentChainHead.hash);

        if(lastChainNode.type === 2) {

            console.log('Processing ' + currentChainHead);

            const registeredVoters: number[] = await registeredVotersService.getRegisteredVotersByVotingHash(currentChainHead.hash);
            registeredVotersService.purgeRegisteredVotersInfoByVotingHash(currentChainHead.hash);

            //TODO: убрать эту копипасту
            const startNodeObj = {
                parentHash: lastChainNode.hash,
                authorPublicKey: currentChainHead.votingPublicKey,
                type: 3,
                votingDescription: currentChainHead.votingDescription,
                startTime: currentChainHead.startTime,
                endTime: currentChainHead.endTime,
                candidates: currentChainHead.candidates,
                admittedVoters: currentChainHead.admittedVoters,
                registeredVoters: registeredVoters,
                votingPublicKey: '',
                admittedUserPublicKey: '',
                selectedVariant: ''
            };
            const votingPrivateKey: string = await rsaService.getPrivateKeyByPublic(currentChainHead.votingPublicKey);
            const startNode: NodeDto = {
                hash: await rsaService.getObjHash(startNodeObj),
                parentHash: startNodeObj.parentHash,
                authorPublicKey: startNodeObj.authorPublicKey,
                signature: await rsaService.getObjSignature(startNodeObj, votingPrivateKey),
                type: startNodeObj.type,
                votingDescription: startNodeObj.votingDescription,
                startTime: startNodeObj.startTime,
                endTime: startNodeObj.endTime,
                candidates: startNodeObj.candidates,
                admittedVoters: startNodeObj.admittedVoters,
                registeredVoters: startNodeObj.registeredVoters,
                votingPublicKey: startNodeObj.votingPublicKey,
                admittedUserPublicKey: startNodeObj.admittedUserPublicKey,
                selectedVariant: startNodeObj.selectedVariant
            };
            nodePersistanceService.startVoting(startNode);
        } else {
            console.log('This voting already have started');
        }
    });
}
bootstrap();