import { Model } from "sequelize";
import { v4 as uuid } from "uuid";
import PlanModel from "../../models/plans.models";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";
import NotFoundException from "../../errors/NotFoundException";

interface PlanData {
    name: string;
    price: number;
    description?: string;
}

class PlanService extends BaseService<Model> {
    constructor() {
        super(PlanModel);
    }

    public async create(data: PlanData): Promise<Model> {
        return await this.collection.create({
            id: uuid(),
            ...data
        });
    }

    public async findAll(): Promise<Model[]> {
        return await this.collection.findAll();
    }

    public async update(id: string, data: Partial<PlanData>): Promise<Model> {
        const plan = await this.collection.findByPk(id);
        if (!plan) throw new NotFoundException("Plan not found");
        await plan.update(data);
        return plan;
    }

    public async delete(id: string): Promise<void> {
        const plan = await this.collection.findByPk(id);
        if (!plan) throw new NotFoundException("Plan not found");
        
        // Before deleting, nullify plan_id in associated profiles
        await ProfileModel.update({ plan_id: null }, { where: { plan_id: id } });
        
        await plan.destroy();
    }
}

const planService = new PlanService();
export default planService;
