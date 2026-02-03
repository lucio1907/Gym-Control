import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import NotFoundException from "../../errors/NotFoundException";
import { BaseService } from "../BaseService.service";

class DeleteAdminService extends BaseService<Model>{
    constructor() {
        super(ProfileModel);
    }

    private checkAdmin = async (id: string): Promise<Model | any> => {
        const exists = await this.collection.findByPk(id);
        return exists;
    }

    public delete = async (id: string): Promise<boolean> => {
        const admin = await this.checkAdmin(id);
        if (!admin) throw new NotFoundException('Admin not found');

        await this.collection.destroy({ where: { id } });
        
        return true;
    }
};

const deleteAdminService = new DeleteAdminService();
export default deleteAdminService;