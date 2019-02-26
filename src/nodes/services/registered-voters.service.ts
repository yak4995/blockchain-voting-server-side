import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { RegisteredVoter } from '../interfaces/registered-voter.interface';

@Injectable()
export class RegisteredVotersService {
  constructor(@Inject('RegisteredVoterModelToken') private readonly registeredVoterModel: Model<RegisteredVoter>) {}

  // проверка, зарегестрирован ли избиратель на выборах по их узлу первого типа и ид юзера-избирателя
  async isRegisteredVoter(hash: string, voterId: number): Promise<boolean> {
    return (await this.registeredVoterModel.findOne({ hash, registeredVoterId: voterId }).exec()) !== null;
  }

  // сохранение зарегистрированого пользователя в базе
  async persistRegisteredVoter(votingHash: string, voterId: number): Promise<RegisteredVoter> {
    return await new this.registeredVoterModel({ hash: votingHash, registeredVoterId: voterId }).save();
  }

  // получение пользователей, зарегистрировавшихся на выборы с указанным хешем
  async getRegisteredVotersByVotingHash(votingHash: string): Promise<number[]> {
    const result: number[] = [];
    (await this.registeredVoterModel.find({ hash: votingHash }).exec()).forEach((currentVoter: RegisteredVoter) => {
      result.push(currentVoter.registeredVoterId);
    });
    return result;
  }

  // удаление учета зарегистрироваавшихся избирателей для сохранения анонимности после начала выборов
  async purgeRegisteredVotersInfoByVotingHash(votingHash: string): Promise<void> {
    await this.registeredVoterModel.deleteMany({ hash: votingHash }).exec();
  }
}
