import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";

interface BodyToUpdate {
  name?: string;
  lastname?: string;
  phone?: string;
}

class UpdateAdminService {
  private collection;

  constructor() {
    this.collection = ProfileModel;
  }

  public update = async (id: string, body: BodyToUpdate) => {
    const { name, lastname, phone } = body;

    const admin = await this.collection.findByPk(id);
    if (!admin) throw new NotFoundException("Admin not found");

    await admin.update({
      name: name ?? admin.get("name"),
      lastname: lastname ?? admin.get("lastname"),
      phone: phone ?? admin.get("phone"),
    });

    const {
      password,
      dni,
      billing_state,
      expiration_day,
      marked_days,
      ...adminData
    } = admin.toJSON();

    return adminData;
  };
}

const updateAdminService = new UpdateAdminService();
export default updateAdminService;
