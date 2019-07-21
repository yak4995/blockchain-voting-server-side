import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodeType } from '../enums/nodeType.enum';
import BaseRepository from '../../common/base.repository';
import { INode } from '../interfaces/i-node.interface';

@Injectable()
export class NodeReadService {
  constructor(
    @Inject('NodeRepository')
    private readonly nodeRepository: BaseRepository<INode>,
  ) {}

  // получение всех выборов (узлов первого типа), пока без пагинации
  getAllChainHeads(): Promise<INode[]> {
    return this.nodeRepository.findByAndCriteria({ type: 1 });
  }

  // поиск узла по хешу
  async findByHash(hash: string): Promise<INode> {
    const foundNode: INode = await this.nodeRepository.findOneByAndCriteria({ hash });
    if (foundNode) return foundNode;
    else throw new BadRequestException('Incorrect hash!', 'Current node with specified hash does not exist!');
  }

  // поиск родительского узла по хешу
  async findParentByHash(hash: string): Promise<INode> {
    const currentNode = await this.findByHash(hash);
    const foundParentNode = await this.nodeRepository.findOneByAndCriteria({ hash: currentNode.parentHash });
    if (foundParentNode) return foundParentNode;
    else throw new BadRequestException('Incorrect hash!', 'Parent node does not exist!');
  }

  // поиск головы цепочки по хешу узла, который в этой цепочке состоит
  async findChainHeadByNodeHash(hash: string): Promise<INode> {
    let currentNode = await this.findByHash(hash);
    while (NodeType.VOTING_CHAIN_HEAD < currentNode.type) {
      currentNode = await this.findByHash(currentNode.parentHash);
    }
    return currentNode;
  }

  // получение "прямых детей" узла
  findNodeChildren(hash: string): Promise<INode[]> {
    return this.nodeRepository.findByAndCriteria({ parentHash: hash });
  }

  // получить последний узел в цепочке, за исключением 4 типа
  async getLastChainNode(hash: string): Promise<INode> {
    let currentNode = await this.findByHash(hash);
    while (NodeType.VOTE > currentNode.type) {
      const childNodes = await this.findNodeChildren(currentNode.hash);
      if (childNodes.length > 0 && NodeType.VOTE !== childNodes[0].type) {
        currentNode = childNodes[0];
      } else {
        return currentNode;
      }
    }
    return currentNode;
  }

  // получение выборов, для которые уже начались, но еще не закончились
  getAllChainHeadsInCurrentBoundaries(): Promise<INode[]> {
    const now: Date = new Date();
    // $gte - greater than or equal
    // $lt - less than
    return this.nodeRepository.findByAndCriteria({ type: 1, startTime: { $lt: now }, endTime: { $gte: now } });
  }

  // получить первый голос на выборах избирателя по хешу узла 3-ого типа и его публичного ключа
  getFirstVoteByStartNodeHash(startVotingNodeHash: string, voterPublicKey: string): Promise<INode> {
    return this.nodeRepository.findOneByAndCriteria({ parentHash: startVotingNodeHash, authorPublicKey: voterPublicKey });
  }

  // получить последний(самый актуальный) голос избирателя по хешу узла 4-ого типа
  async getLastVote(voteNodeHash: string): Promise<INode> {
    // валидация узла startVotingNodeHash и voterPublicKey
    let result: INode = await this.findByHash(voteNodeHash);
    if (NodeType.VOTE !== result.type) throw new BadRequestException('Incorrect hash!', 'Node with this hash doesn`t have type 4!');
    while (result) {
      const resultChildren = await this.findNodeChildren(result.hash);
      if (resultChildren.length > 0) {
        result = resultChildren[0];
      } else {
        return result;
      }
    }
    return result;
  }

  async getStartVotingNodeByAnyVoteHash(voteNodeHash: string): Promise<INode> {
    let result: INode = await this.findParentByHash(voteNodeHash);
    while (NodeType.START_VOTING < result.type) {
      result = await this.findParentByHash(result.hash);
    }
    return result;
  }

  async getVotingResult(hash: string) {
    const startVotingNode = await this.getLastChainNode(hash);
    const nodeChildren = await this.findNodeChildren(startVotingNode.hash);
    const finalVotesPromises = nodeChildren.map(voteNode => this.getLastVote(voteNode.hash));
    const finalVotes = await Promise.all(finalVotesPromises);
    return finalVotes
      .reduce(
        (resultPresentator: object[], voteNode: INode) => {
          resultPresentator[voteNode.selectedVariant] =
            resultPresentator[voteNode.selectedVariant] ? ++resultPresentator[voteNode.selectedVariant] : 1;
          return resultPresentator;
        },
        {},
      );
  }
}
