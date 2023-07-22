const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Inventory Schema:
const inventorySchema = new Schema({
  id: String,
  name: String,
  quantity: Number

});

module.exports = class InventoryDB {
  constructor() {
    this.Invent = null;
  }

  // Pass the connection string to `initialize()`
 
  initialize(connectionString) {

    return new Promise((resolve, reject) => {
      const db = mongoose.createConnection(connectionString);

      db.once('error', (err) => {
        reject(err);
      });

      db.once('open', () => {
        this.Invent = db.model("inventory", inventorySchema);
        resolve();
      });
    });
  }

  async addNewItem(data) {
    const newItem = new this.Invent(data);
    await newItem.save();
    return newItem;
  }

  getAllItem(page, perPage, name) {
    let findBy = {};

    if (name){
      findBy = { name: { $regex: new RegExp(name, 'i') } };
    }

    if (+page && +perPage) {
      return this.Invent
      .find(findBy)                   // find items based on name
      .sort({ name: +1 })             // sort name ascending
      .skip((page - 1) * +perPage)    // skip a certain of documents based on the current page
      .limit(+perPage)                // limit the number of items per page
      .exec();
    }

    return Promise.reject(new Error('page and perPage query parameters must be valid numbers'));
  }

  async getItemById(id) {
    const material = await this.Invent.find({ id: new RegExp(id, 'i')}).exec();

    return material;
  }

  updateItemById(data, id) {
    return this.Invent.updateOne({ id: id }, { $set: data }).exec();
  }

  deleteItemById(id) {
    return this.Invent.deleteOne({ id: id }).exec();
  }

  async getItemByName(name) {
    const material = await this.Invent.findOne({ name: new RegExp(name, 'i')}).exec();
    return material;
  }
  
  updateItemByName(data, name) {
    return this.Invent.updateOne({ name: name }, { $set: data }).exec();
  }


 
  
 
}