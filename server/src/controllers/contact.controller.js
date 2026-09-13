import { getSupportSender } from "../services/smtp.provider.js";
import ContactMessage from "../models/ContactMessage.js";
import { sendContactEmail, sendContactReplyEmail } from "../services/email.service.js";
import mongoose from "mongoose";
import { ensureConversation, notifyInbox } from "../services/communications/inbox.service.js";
import { emitAutomation } from "../services/communications/worker.service.js";

export const replyToMessage = async (req, res) => {
  const { id } = req.params;
  const { message, requestId } = req.body;
  if (!mongoose.isValidObjectId(id) || typeof message !== "string" || !message.trim() || message.length > 20000 ||
      typeof requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) {
    return res.status(400).json({ success: false, message: "Enter a reply between 1 and 20,000 characters." });
  }
  try {
    const contact = await ContactMessage.findById(id);
    if (!contact) return res.status(404).json({ success: false, message: "Enquiry not found." });
    const previous = contact.replies?.find(reply => reply.requestId === requestId);
    if (previous) {
      if (previous.status === "sent") return res.json({ success: true, data: contact });
      return res.status(409).json({ success: false, message: previous.status === "sending"
        ? "This reply is already being sent. Refresh the enquiry to check its status."
        : "This reply failed. Open a new reply to try again." });
    }
    if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(contact.email)) {
      return res.status(400).json({ success: false, message: "The enquiry has an invalid email address." });
    }
    const subject = `Re: ${contact.subject.replace(/[\r\n]/g, " ")}`.slice(0, 250);
    const claimed = await ContactMessage.updateOne({ _id: id, "replies.requestId": { $ne: requestId } }, {
      $push: { replies: { requestId, message: message.trim(), subject, from: getSupportSender().address, sentBy: req.user._id, status: "sending", createdAt: new Date() } },
    });
    if (!claimed.modifiedCount) return res.status(409).json({ success: false, message: "This reply is already being processed." });
    let delivery;
    try {
      const lastSent = [...(contact.replies || [])].reverse().find(reply => reply.status === "sent");
      delivery = await sendContactReplyEmail({ to: contact.email, subject, message: message.trim(), inReplyTo: lastSent?.messageId });
    } catch (error) {
      await ContactMessage.updateOne({ _id: id, "replies.requestId": requestId }, { $set: { "replies.$.status": "failed" } });
      console.error("[CONTACT] Reply delivery failed:", error.message);
      return res.status(502).json({ success: false, message: "Email delivery failed. Your reply text has been kept so you can retry." });
    }
    const updated = await ContactMessage.findOneAndUpdate({ _id: id, "replies.requestId": requestId }, {
      $set: { "replies.$.status": "sent", "replies.$.sentAt": new Date(), "replies.$.messageId": delivery.messageId },
    }, { returnDocument: "after" });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[CONTACT] Reply error:", error.message);
    return res.status(500).json({ success: false, message: "Could not confirm the reply status. Refresh the enquiry before trying again." });
  }
};

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

    // The original enquiry remains authoritative if notification/queue services are unavailable.
    ensureConversation(newMessage).then(async conversation => {
      await notifyInbox(conversation, "New customer enquiry");
      await emitAutomation("CONTACT_SUBMITTED", { conversation: conversation._id, email, firstName: name }, `contact:${conversation._id}`);
    }).catch(error => console.error("[COMMUNICATIONS] Contact integration:", error.message));

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
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

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
