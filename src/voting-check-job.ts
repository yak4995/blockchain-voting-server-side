import { NestFactory } from "@nestjs/core";
import { INestApplicationContext } from "@nestjs/common";
import { AppModule } from './app.module';
import { NodeService } from './nodes/node.service';
import { Node } from "./nodes/interfaces/node.interface";
import { NodeDto } from "nodes/dto/create-node.dto";
import { RSAService } from "crypto/rsa.service";

async function bootstrap() {

    const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);
    const nodeService: NodeService = app.get<NodeService>(NodeService);
    const rsaService: RSAService = app.get<RSAService>(RSAService);
    const actualVotings: Node[] = await nodeService.getAllChainHeadsInCurrentBoundaries();

    console.log('We got ' + actualVotings.length + ' actual votings.');
    actualVotings.forEach(async (currentChainHead: Node, currentIndex: number) => {

        const lastChainNode: Node = await nodeService.getLastChainNode(currentChainHead.hash);

        if(lastChainNode.type === 2) {

            console.log('Processing ' + currentChainHead);

            const registeredVoters: number[] = await nodeService.getRegisteredVotersByVotingHash(currentChainHead.hash);
            nodeService.purgeRegisteredVotersInfoByVotingHash(currentChainHead.hash);

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
            nodeService.startVoting(startNode);
        } else {
            console.log('This voting already have started');
        }
    });
}
bootstrap();