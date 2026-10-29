const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 100 },
  description: { type: String, required: [true, "Description is required"], trim: true, maxlength: 1000 },
  category: {
    type: String,
    required: true,
    enum: ["Electrical", "Furniture", "Cleanliness", "Internet", "Plumbing", "Other"],
    default: "Other"
  },
  location: { type: String, required: [true, "Location is required"], trim: true, maxlength: 120 },
  reporter: { type: String, trim: true, default: "Student", maxlength: 80 },
  status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" }
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);
