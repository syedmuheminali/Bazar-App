import { Request, Response } from "express";
import User from "../models/User.js";

export const savePushToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { clerkId, pushToken } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId },
      { pushToken },
      { new: true }
    );

    return res.json({
      success: true,
      user
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to save push token"
    });
  }
};