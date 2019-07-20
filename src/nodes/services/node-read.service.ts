import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Node } from '../interfaces/node.interface';
import { NodeType } from '../enums/nodeType.enum';

@Injectable()
export class NodeReadService {
  constructor(@Inject('NodeModelToken') private readonly nodeModel: Model<Node>) {}

  // получение всех выборов (узлов первого типа), пока без пагинации
  getAllChainHeads(): Promise<Node[]> {
    return this.nodeModel.find({ type: 1 }).exec();
  }

  // поиск узла по хешу
  async findByHash(hash: string): Promise<Node> {
    const foundNode: Node = await this.nodeModel.findOne({ hash }).exec();
    if (foundNode) return foundNode;
    else throw new BadRequestException('Incorrect hash!', 'Current node with specified hash does not exist!');
  }

  // поиск родительского узла по хешу
  async findParentByHash(hash: string): Promise<Node> {
    const foundParentNode = await this.nodeModel.findOne({ hash: (await this.findByHash(hash)).parentHash }).exec();
    if (foundParentNode) return foundParentNode;
    else throw new BadRequestException('Incorrect hash!', 'Parent node does not exist!');
  }

  // поиск головы цепочки по хешу узла, который в этой цепочке состоит
  async findChainHeadByNodeHash(hash: string): Promise<Node> {
    let currentNode = await this.findByHash(hash);
    while (NodeType.VOTING_CHAIN_HEAD < currentNode.type) {
      currentNode = await this.findByHash(currentNode.parentHash);
    }
    return currentNode;
  }

  // получение "прямых детей" узла
  findNodeChildren(hash: string): Promise<Node[]> {
    return this.nodeModel.find({ parentHash: hash }).exec();
  }

  // получить последний узел в цепочке, за исключением 4 типа
  async getLastChainNode(hash: string): Promise<Node> {
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
  getAllChainHeadsInCurrentBoundaries(): Promise<Node[]> {
    const now: Date = new Date();
    // $gte - greater than or equal
    // $lt - less than
    return this.nodeModel.find({ type: 1, startTime: { $lt: now }, endTime: { $gte: now } }).exec();
  }

  // получить первый голос на выборах избирателя по хешу узла 3-ого типа и его публичного ключа
  getFirstVoteByStartNodeHash(startVotingNodeHash: string, voterPublicKey: string): Promise<Node> {
    return this.nodeModel.findOne({ parentHash: startVotingNodeHash, authorPublicKey: voterPublicKey }).exec();
  }

  // получить последний(самый актуальный) голос избирателя по хешу узла 4-ого типа
  async getLastVote(voteNodeHash: string): Promise<Node> {
    // валидация узла startVotingNodeHash и voterPublicKey
    let result: Node = await this.findByHash(voteNodeHash);
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

  async getStartVotingNodeByAnyVoteHash(voteNodeHash: string): Promise<Node> {
    let result: Node = await this.findParentByHash(voteNodeHash);
    while (NodeType.START_VOTING < result.type) {
      result = await this.findParentByHash(result.hash);
    }
    return result;
  }

  async getVotingResult(hash: string) {
    const startVotingNode = await this.getLastChainNode(hash);
    const finalVotesPromises = (await this.findNodeChildren(startVotingNode.hash))
      .map(voteNode => this.getLastVote(voteNode.hash));
    return (await Promise.all(finalVotesPromises))
      .reduce(
        (resultPresentator: object[], voteNode: Node) => {
          resultPresentator[voteNode.selectedVariant] =
            resultPresentator[voteNode.selectedVariant] ? ++resultPresentator[voteNode.selectedVariant] : 1;
          return resultPresentator;
        },
        {},
      );
  }
}
