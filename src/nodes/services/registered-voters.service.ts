import { Injectable, Inject } from '@nestjs/common';
import BaseRepository from '../../common/base.repository';
import { IRegisteredVoter } from '../interfaces/i-registered-voter.interface';

@Injectable()
export class RegisteredVotersService {
  constructor(
    @Inject('RegisteredVoterRepository')
    private readonly registeredVoterModel: BaseRepository<IRegisteredVoter>,
  ) {}

  // проверка, зарегестрирован ли избиратель на выборах по их узлу первого типа и ид юзера-избирателя
  async isRegisteredVoter(hash: string, voterId: number): Promise<boolean> {
    return (await this.registeredVoterModel.findOneByAndCriteria({
      hash,
      registeredVoterId: voterId,
    })) !== null;
  }

  // сохранение зарегистрированого пользователя в базе
  persistRegisteredVoter(votingHash: string, voterId: number): Promise<IRegisteredVoter> {
    return this.registeredVoterModel.create(votingHash, voterId);
  }

  // получение пользователей, зарегистрировавшихся на выборы с указанным хешем
  async getRegisteredVotersByVotingHash(votingHash: string): Promise<number[]> {
    const currentVoters = await this.registeredVoterModel.findByAndCriteria({ hash: votingHash });
    return currentVoters.map(currentVoter => currentVoter.registeredVoterId);
  }

  // удаление учета зарегистрироваавшихся избирателей для сохранения анонимности после начала выборов
  purgeRegisteredVotersInfoByVotingHash(votingHash: string): Promise<void> {
    return this.registeredVoterModel.delete({ hash: votingHash });
  }
}
