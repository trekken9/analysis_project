const { Motherboard } = require("../Entity");
const MotherboardOut = require("../models/out/motherboard/motherboardOut");
const ApiError = require("../exeptions/api-error");
const components = require("../types/componentTypes");

const TYPE_SIZE = components.motherboardTypeSize;
const reversedTypeSize = components.invertMap(TYPE_SIZE);

class MotherboardService {
  async create(data) {
    const existing = await Motherboard.findOne({
      where: { title: data.title },
    });

    if (existing) {
      throw ApiError.BadRequest(
        `Motherboard with title "${data.title}" already exists`
      );
    }

    data.type_size = TYPE_SIZE.get(data.type_size);
    if (!data.type_size) {
      throw ApiError.BadRequest("Invalid type size");
    }

    await Motherboard.create({ ...data });
  }

  async getAll({ page, limit, search, cost }) {
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

    const { count, rows } = await Motherboard.findAndCountAll({
      where,
      offset,
      limit: newLimit,
    });

    const totalPages = Math.ceil(count / newLimit);
    return {
      meta: { count, totalPages },
      data: rows.map((motherboard) => {
        const motherboardObj = motherboard.toJSON();
        motherboardObj.type_size = reversedTypeSize.get(
          motherboardObj.type_size
        );
        return new MotherboardOut(motherboardObj);
      }),
    };
  }

  async getById(id) {
    const motherboard = await Motherboard.findByPk(id);

    if (!motherboard) {
      throw ApiError.BadRequest("Motherboard not found");
    }

    const obj = motherboard.toJSON();
    obj.type_size = reversedTypeSize.get(obj.type_size);
    return new MotherboardOut(obj);
  }

  async update(id, data) {
    const motherboard = await Motherboard.findByPk(id);
    if (!motherboard) {
      throw ApiError.BadRequest("Motherboard not found");
    }

    const titleCheck = await Motherboard.findOne({
      where: { title: data.title },
    });
    if (titleCheck && titleCheck.id !== motherboard.id) {
      throw ApiError.BadRequest(
        `Motherboard with title "${data.title}" already exists`
      );
    }

    data.type_size = TYPE_SIZE.get(data.type_size);
    if (!data.type_size) {
      throw ApiError.BadRequest("Invalid type size");
    }

    motherboard.set({ ...data });
    return await motherboard.save();
  }

  async delete(id) {
    const motherboard = await Motherboard.findByPk(id);
    if (!motherboard) {
      throw ApiError.BadRequest("Motherboard not found");
    }
    return await motherboard.destroy();
  }
}

module.exports = new MotherboardService();
