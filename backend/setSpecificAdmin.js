import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const setSpecificAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected.");

    const targetEmail = "nguyenxuannghia2110@gmail.com";
    const targetPassword = "12345678";

    // 1. Remove admin role from other users if needed (optional, we'll just focus on the target)
    await User.updateOne({ email: "nghia211002@gmail.com" }, { role: "user" });
    console.log("Downgraded nghia211002@gmail.com back to normal user.");

    // 2. Find or create the target user
    let admin = await User.findOne({ email: targetEmail });

    if (admin) {
      console.log(`User ${targetEmail} exists. Updating role and password...`);
      admin.role = "admin";
      admin.password = targetPassword;
      await admin.save({ validateBeforeSave: false });
      console.log(`Successfully updated ${targetEmail} to admin with new password.`);
    } else {
      console.log(`User ${targetEmail} does not exist. Creating new account...`);
      admin = new User({
        username: "NguyenXuanNghia",
        email: targetEmail,
        password: targetPassword,
        role: "admin",
      });
      await admin.save({ validateBeforeSave: false });
      console.log(`Successfully created new admin account ${targetEmail}.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error setting admin:", error);
    process.exit(1);
  }
};

setSpecificAdmin();
