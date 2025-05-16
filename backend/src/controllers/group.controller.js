import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  const { name, members = [], admins = [] } = req.body;
  const creatorId = req.user?._id;

  if (!name || !creatorId) {
    return res.status(400).json({ message: "Group name and creator are required." });
  }

  try {
    const group = await Group.create({
      name,
      createdBy: creatorId,
      members: Array.from(new Set([...members, creatorId])),
      admins: Array.from(new Set([...admins, creatorId]))
    });

    return res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup:", error);
    return res.status(500).json({ message: "Failed to create group.", error: error.message });
  }
};

export const addMember = async (req, res) => {
  const { groupId, userIdToAdd } = req.body;
  const currentUserId = req.user?._id;

  if (!groupId || !userIdToAdd) {
    return res.status(400).json({ message: "Group ID and user ID to add are required." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    if (!group.admins.includes(currentUserId)) {
      return res.status(403).json({ message: "Only admins can add members." });
    }

    if (group.members.includes(userIdToAdd)) {
      return res.status(400).json({ message: "User is already a member of the group." });
    }

    group.members.push(userIdToAdd);
    await group.save();

    return res.status(200).json({ message: "User added to group successfully." });
  } catch (error) {
    console.error("Error in addMember:", error);
    return res.status(500).json({ message: "Failed to add member.", error: error.message });
  }
};

export const removeMember = async (req, res) => {
  const { groupId, userIdToRemove } = req.body;
  const currentUserId = req.user?._id;

  if (!groupId || !userIdToRemove) {
    return res.status(400).json({ message: "Group ID and user ID to remove are required." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    if (!group.admins.includes(currentUserId)) {
      return res.status(403).json({ message: "Only admins can remove members." });
    }

    if (!group.members.includes(userIdToRemove)) {
      return res.status(400).json({ message: "User is not a member of the group." });
    }

    group.members = group.members.filter(id => id.toString() !== userIdToRemove);
    group.admins = group.admins.filter(id => id.toString() !== userIdToRemove);
    await group.save();

    return res.status(200).json({ message: "User removed from group successfully." });
  } catch (error) {
    console.error("Error in removeMember:", error);
    return res.status(500).json({ message: "Failed to remove member.", error: error.message });
  }
};
