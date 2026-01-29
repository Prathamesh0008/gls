import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    shipping: {
      receiverName: String,
      street: String,
      houseNo: String,
      zipCode: String,
      city: String,
      countryCode: { type: String, default: "NL" },
      weight: { type: Number, default: 1 },
      reference: String,
    },
    glsLabelBase64: { type: String, default: "" }, // PDF base64
    trackingNumber: { type: String, default: "" },
    status: { type: String, default: "created" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
