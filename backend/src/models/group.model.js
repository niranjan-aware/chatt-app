import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    type:{
      type: String,
      default: "group",
    },
    username: {
      type: String,
      required: true,
    },
    groupProfilePic: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
