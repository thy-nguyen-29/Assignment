// ------------------
//   SETUP SERVER 
// ------------------
const express = require("express");
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

require('dotenv').config({ path: './.env' });

app.use(cors());
app.use(express.json());

// Add support for incoming JSON entities
app.use(bodyParser.json());

// ------------------
//   SETUP MONGODB 
// ------------------
const InventoryDB = require('./modules/inventoryDB.js');
const db = new InventoryDB();

db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error initializing MongoDB:', err);
});


app.get('/', (req, res) => {
  res.json({ message: 'API Listening' });
});

// Get all items
app.get('/api/items', async (req, res) => {
    
  try {
    const page = +req.query.page || 1;
    const perPage = +req.query.perPage || 10;
    const name = +req.query.name || '';
    const material = await db.getAllItem(page, perPage, name);
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory.' });
  }
});

//Get one item
app.get('/api/items/:id', async (req, res) => {
  try {
    const material = await db.getItemById(req.params.id);

    if (material) {
      res.json(material);
    } else {
      res.status(404).json({ error: 'Item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve item.' });
  }
});

// Add new item
app.post('/api/items/add-item', async (req, res) => {
  
  try {
    const newItem = await db.addNewItem(req.body);
    res.status(201).json({
      message: 'Item added successfully.',
      item: newItem,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to add new item.' });
  }
});

// Edit an existing item
app.put('/api/items/edit/:_id', async (req, res) => {
    const updatedItem = { 
      _id: req.params._id, 
      id: req.body.id, 
      name: req.body.name, 
      quantity: req.body.quantity 
    };
    try {
      const updateResult = await db.updateItemById(updatedItem, req.params._id);
      res.json({ message: 'Material updated successfully.' });
      return updateResult;
    } catch (error) {
      res.status(500).json({ error: 'Failed to update item.' });
    }
});

// Delete an item
app.delete('/api/items/remove/:_id', async (req, res) => {
    try {
      const deleteResult = await db.deleteItemById(req.params._id);

      if (deleteResult.deletedCount === 1) {
        res.json({ message: 'Material deleted successfully.' });
      } else {
        res.status(404).json({ error: 'Material not found.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete Material.' });
    }
});