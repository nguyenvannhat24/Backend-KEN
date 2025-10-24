const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, maxlength: 200 },
    body: { type: String, maxlength: 1000 },
    type: { type: String, maxlength: 50 },
    created_at: { type: Date, default: Date.now },
    read_at: { type: Date },
  },
  { collection: "Notifications" }
);

module.exports = mongoose.model("Notification", NotificationSchema);
