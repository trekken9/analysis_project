module.exports = class RamUpdate {
  title;
  memory_quantity;
  cost;
  memory_type;
  radiator_type;
  image;
  description;
  constructor(ram) {
    this.cost = ram.cost;
    this.memory_quantity = ram.memory_quantity;
    this.description = ram.description;
    this.image = ram.image;
    this.title = ram.title;
    this.memory_type = ram.memory_type;
    this.radiator_type = ram.radiator_type;
  }
};
