import { Model, Document } from 'mongoose';

export type Criteria<T> = {
    [P in keyof T]?: any;
};

export default abstract class BaseRepository<T extends Document> {
    constructor(protected readonly registeredVoterModel: Model<T>) {}
    abstract create(...args: any[]): Promise<T>;
    abstract findAll(): Promise<T[]>;
    abstract findById(id: number): Promise<T>;
    abstract findOneByAndCriteria(searchCriteria: Criteria<T>): Promise<T>;
    abstract findByAndCriteria(searchCriteria: Criteria<T>): Promise<T[]>;
    abstract update(updateData: Criteria<T>, id: number): Promise<any>;
    abstract delete(deleteCriteria: Criteria<T>): Promise<any>;
}
