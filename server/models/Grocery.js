const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Family", "Party", "Guest", "Festival"],
      required: true,
    },
    selectedDate: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerEmail: {
      type: String,
      default: undefined,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grocery", grocerySchema);
