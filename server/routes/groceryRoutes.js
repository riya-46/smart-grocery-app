const express = require("express");
const router = express.Router();
const Grocery = require("../models/Grocery");

// GET all groceries
router.get("/", async (req, res) => {
  try {
    const groceries = await Grocery.find().sort({ createdAt: -1 });
    res.status(200).json(groceries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add grocery
router.post("/", async (req, res) => {
  try {
    const { itemName, quantity, unit, price, mode, selectedDate } = req.body;

    if (!itemName || !quantity || !unit || !price || !mode || !selectedDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGrocery = new Grocery({
      itemName,
      quantity,
      unit,
      price,
      mode,
      selectedDate,
    });

    const savedGrocery = await newGrocery.save();
    res.status(201).json(savedGrocery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update grocery
router.put("/:id", async (req, res) => {
  try {
    const updatedGrocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedGrocery) {
      return res.status(404).json({ message: "Grocery item not found" });
    }

    res.status(200).json(updatedGrocery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE grocery
router.delete("/:id", async (req, res) => {
  try {
    const deletedGrocery = await Grocery.findByIdAndDelete(req.params.id);

    if (!deletedGrocery) {
      return res.status(404).json({ message: "Grocery item not found" });
    }

    res.status(200).json({ message: "Grocery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;