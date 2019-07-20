import { Injectable, Inject } from '@nestjs/common';
import { RegisteredVoter } from '../interfaces/registered-voter.interface';
import { RegisteredVoter as RegisteredVoterEntity } from '../interfaces/registered-voter.interface';
import BaseRepository from '../../common/base.repository';

@Injectable()
export class RegisteredVotersService {
  constructor(
    @Inject('RegisteredVoterRepository')
    private readonly registeredVoterModel: BaseRepository<RegisteredVoter>,
  ) {}

  // проверка, зарегестрирован ли избиратель на выборах по их узлу первого типа и ид юзера-избирателя
  async isRegisteredVoter(hash: string, voterId: number): Promise<boolean> {
    return (await this.registeredVoterModel.findOneByAndCriteria({
      hash,
      registeredVoterId: voterId,
    })) !== null;
  }

  // сохранение зарегистрированого пользователя в базе
  persistRegisteredVoter(votingHash: string, voterId: number): Promise<RegisteredVoter> {
    return this.registeredVoterModel.create(votingHash, voterId);
  }

  // получение пользователей, зарегистрировавшихся на выборы с указанным хешем
  async getRegisteredVotersByVotingHash(votingHash: string): Promise<number[]> {
    return (await this.registeredVoterModel.findByAndCriteria([{ fieldName: 'hash', fieldValue: votingHash }]))
      .map((currentVoter: RegisteredVoterEntity) => currentVoter.registeredVoterId);
  }

  // удаление учета зарегистрироваавшихся избирателей для сохранения анонимности после начала выборов
  purgeRegisteredVotersInfoByVotingHash(votingHash: string): Promise<void> {
    return this.registeredVoterModel.delete({ hash: votingHash });
  }
}
