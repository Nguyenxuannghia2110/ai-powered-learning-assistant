import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected.");

    let admin = await User.findOne({ email: "admin@studyai.com" });

    if (admin) {
      console.log("Admin account already exists!");
      console.log("Email: admin@studyai.com");
      console.log("Role:", admin.role);
    } else {
      admin = new User({
        username: "AdminSuper",
        email: "admin@studyai.com",
        password: "AdminPassword123",
        role: "admin",
      });
      await admin.save();
      console.log("Successfully created admin account:");
      console.log("Email: admin@studyai.com");
      console.log("Password: AdminPassword123");
    }

    const firstUser = await User.findOne({ email: { $ne: "admin@studyai.com" } });
    if (firstUser) {
      firstUser.role = "admin";
      await firstUser.save();
      console.log(`\nAlso upgraded existing user '${firstUser.email}' to admin.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

seedAdmin();
