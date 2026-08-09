
import Topic from "../models/Topic.js";
import Article from "../models/Article.js";
import mongoose from "mongoose";

/**
 * List all topics, sorted by article count (highest first)
 */
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.aggregate([
    {
      $lookup: {
        from: "articles",
        localField: "_id",
        foreignField: "topic",
        as: "articles"
      }
    },
    {
      $addFields: {
        articleCount: { $size: "$articles" }
      }
    },
    {
      $sort: { articleCount: -1, name: 1 }
    },
    {
      $project: {
        articles: 0
      }
    }]
    );

    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    console.error("[TOPICS] getTopics error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new topic
 */
export const createTopic = async (req, res) => {
  try {
    const { name, description, isParent, parent } = req.body;

    if (!name || !description) {
      res.status(400).json({ success: false, message: "Name and description are required." });
      return;
    }

    const newTopic = await Topic.create({
      name,
      description,
      isParent: isParent || false,
      parent: parent || null
    });

    res.status(201).json({ success: true, data: newTopic });
  } catch (error) {
    console.error("[TOPICS] createTopic error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update a topic
 */
export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isParent, parent } = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { name, description, isParent, parent, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      res.status(404).json({ success: false, message: "Topic not found." });
      return;
    }

    res.status(200).json({ success: true, data: updatedTopic });
  } catch (error) {
    console.error("[TOPICS] updateTopic error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete a topic
 */
export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTopic = await Topic.findByIdAndDelete(id);

    if (!deletedTopic) {
      res.status(404).json({ success: false, message: "Topic not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Topic deleted successfully." });
  } catch (error) {
    console.error("[TOPICS] deleteTopic error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};