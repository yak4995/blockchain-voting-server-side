import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { Job, DoneCallback } from 'bull';
import { AxiosModule } from '../../axios/axios.module';
import { AxiosService } from '../../axios/axios.service';
import { NodeDto } from '../dto/create-node.dto';
import { Node } from '../interfaces/node.interface';
import { AppLogger } from '../../logger/app-logger.service';

export const NodeSenderProcessor = async (job: Job, done: DoneCallback) => {
  const app: INestApplicationContext = await NestFactory.createApplicationContext(AxiosModule);
  const axiosService: AxiosService = app.get<AxiosService>(AxiosService);
  const logger: AppLogger = app.get<AppLogger>(AppLogger);

  try {
    const node: Node = job.data;
    const nodeDto: NodeDto = {
      hash: node.hash,
      parentHash: node.parentHash,
      authorPublicKey: node.authorPublicKey,
      signature: node.signature,
      type: node.type,
      votingDescription: node.votingDescription,
      startTime: node.startTime,
      endTime: node.endTime,
      candidates: node.candidates,
      admittedVoters: node.admittedVoters,
      registeredVoters: node.registeredVoters,
      votingPublicKey: node.votingPublicKey,
      admittedUserPublicKey: node.admittedUserPublicKey,
      selectedVariant: node.selectedVariant
    }
    axiosService.pushNode(nodeDto);
    done(null, job.data);
  } catch (err) {
    logger.error(err.message, err.trace);
  }
};
