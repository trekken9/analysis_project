const { CoolingSystem } = require("../Entity");
const CoolingSystemOut = require("../models/out/coolingSystem/coolingSystemOut");
const ApiError = require("../exeptions/api-error");
const components = require("../types/componentTypes");
const { Op } = require("sequelize");

const TYPE_SIZE = components.coolingSystemTypeSize;
const reversedTypeSize = components.invertMap(TYPE_SIZE);

class CoolingSystemService {
  async create(cooling) {
    const coolingSystem = await CoolingSystem.findOne({
      where: { title: cooling.title },
    });

    if (coolingSystem) {
      throw ApiError.BadRequest(
        `Cooling system with ${cooling.title} title already exists`
      );
    }

    cooling.type_size = TYPE_SIZE.get(cooling.type_size);

    await CoolingSystem.create({
      ...cooling,
    });
  }

  async getAllCoolingSystems({ page, limit, search, cost }) {
    const newPage = page || 1;
    const newLimit = limit || 12;
    const offset = (newPage - 1) * newLimit;

    let where = {};
    if (search) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // if (cost) {
    //   where.cost;
    // }

    const { count, rows } = await CoolingSystem.findAndCountAll({
      where,
      offset,
      limit: newLimit,
    });

    const totalPages = Math.ceil(count / newLimit);
    return {
      meta: { count, totalPages },
      data: rows.map((cooling) => {
        cooling.type_size = reversedTypeSize.get(cooling.type_size);
        return new CoolingSystemOut(cooling);
      }),
    };
  }

  async getCoolingSystemById(coolingId) {
    const coolingSystem = await CoolingSystem.findByPk(coolingId);

    if (!coolingSystem) {
      throw ApiError.BadRequest("There are no cooling modules with such id");
    }

    coolingSystem.type_size = reversedTypeSize.get(coolingSystem.type_size);

    return new CoolingSystemOut(coolingSystem);
  }

  async update(coolingId, cooling) {
    const coolingSystem = await CoolingSystem.findByPk(coolingId);
    if (!coolingSystem) {
      throw ApiError.BadRequest("Cooling module not found");
    }

    const coolingSystemTitleCheck = await CoolingSystem.findOne({
      where: { title: cooling.title },
    });

    if (
      coolingSystemTitleCheck &&
      coolingSystemTitleCheck.id !== coolingSystem.id
    ) {
      throw ApiError.BadRequest(
        `Cooling module with title "${cooling.title}" already exists`
      );
    }
    console.log(coo);
    cooling.type_size = TYPE_SIZE.get(cooling.type_size);
    coolingSystem.set({ ...cooling });
    return coolingSystem.save();
  }

  async delete(id) {
    const coolingSystem = await CoolingSystem.findByPk(id);
    if (!coolingSystem) {
      throw ApiError.BadRequest("Cooling module not found");
    }
    return await coolingSystem.destroy();
  }
}

module.exports = new CoolingSystemService();
