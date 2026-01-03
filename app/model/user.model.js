import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        userName: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
         emailVerified: {
    type: Boolean,
    default: false,
  },
    },
    { timestamps: true }
);

const User =
    mongoose.models.User || mongoose.model("User", userSchema);

export default User;
