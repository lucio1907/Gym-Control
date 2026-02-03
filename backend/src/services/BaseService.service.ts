import { Model, ModelStatic } from "sequelize";

export abstract class BaseService<T extends Model> {
    constructor(protected readonly collection: ModelStatic<T>) {}
};