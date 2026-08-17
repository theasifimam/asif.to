import ContactMessage from "../models/ContactMessage.js";
import { sendContactEmail } from "../services/email.service.js";

// POST /api/v1/contact
export const submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    // Send email to support
    sendContactEmail(name, email, subject, message).catch((err) =>
      console.error("[CONTACT] Email notification failed:", err)
    );

    res.status(201).json({ success: true, message: "Message sent successfully.", data: newMessage });
  } catch (error) {
    console.error("[CONTACT] Submit error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/contact
export const getMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ContactMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[CONTACT] GetMessages error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/v1/contact/:id/status
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error("[CONTACT] Update status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
