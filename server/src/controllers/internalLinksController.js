import InternalLinkRule from "../models/InternalLinkRule.js";

export const getInternalLinks = async (req, res) => {
  try {
    const rules = await InternalLinkRule.find().sort({ priority: -1, keyword: 1 });
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPublicInternalLinks = async (req, res) => {
  try {
    const rules = await InternalLinkRule.find({ enabled: true }).sort({ priority: -1, keyword: 1 });
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createInternalLink = async (req, res) => {
  try {
    const { keyword, aliases, url, priority, maxPerPage, enabled } = req.body;
    const rule = new InternalLinkRule({ keyword, aliases, url, priority, maxPerPage, enabled });
    await rule.save();
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInternalLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { keyword, aliases, url, priority, maxPerPage, enabled } = req.body;
    const rule = await InternalLinkRule.findByIdAndUpdate(
      id,
      { keyword, aliases, url, priority, maxPerPage, enabled },
      { new: true, runValidators: true }
    );
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.status(200).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteInternalLink = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await InternalLinkRule.findByIdAndDelete(id);
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const importInternalLinks = async (req, res) => {
  try {
    const { rules } = req.body;
    if (!Array.isArray(rules)) {
      return res.status(400).json({ success: false, error: "rules must be an array" });
    }
    
    const imported = [];
    for (const r of rules) {
      const exists = await InternalLinkRule.findOne({ keyword: r.keyword });
      if (!exists) {
        const newRule = new InternalLinkRule(r);
        await newRule.save();
        imported.push(newRule);
      }
    }
    
    res.status(201).json({ success: true, data: { imported: imported.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
