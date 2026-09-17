import Page from '../models/Page.js';

export const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const SLUG_ALIASES = {
  privacy: ["privacy-policy", "privacy"],
  "privacy-policy": ["privacy-policy", "privacy"],
  terms: ["terms-conditions", "terms"],
  "terms-conditions": ["terms-conditions", "terms"],
  cookies: ["cookie-usage", "cookies"],
  "cookie-usage": ["cookie-usage", "cookies"],
};

export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const searchSlugs = SLUG_ALIASES[slug] || [slug];
    const page = await Page.findOne({ slug: { $in: searchSlugs } });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const searchSlugs = SLUG_ALIASES[slug] || [slug];
    const {
      title,
      content,
      summary,
      status,
      seoTitle,
      seoDescription,
      keywords,
      canonicalUrl
    } = req.body;

    const normalizedKeywords = Array.isArray(keywords)
      ? keywords
      : typeof keywords === 'string'
        ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [];

    let page = await Page.findOne({ slug: { $in: searchSlugs } });

    if (page) {
      if (title !== undefined) page.title = title;
      if (content !== undefined) page.content = content;
      if (summary !== undefined) page.summary = summary;
      if (status !== undefined) page.status = status;
      if (seoTitle !== undefined) page.seoTitle = seoTitle;
      if (seoDescription !== undefined) page.seoDescription = seoDescription;
      if (keywords !== undefined) page.keywords = normalizedKeywords;
      if (canonicalUrl !== undefined) page.canonicalUrl = canonicalUrl;
      page.lastUpdated = new Date();
      await page.save();
    } else {
      page = await Page.create({
        title: title || slug.replace(/-/g, ' ').toUpperCase(),
        slug,
        content: content || '',
        summary: summary || '',
        status: status || 'published',
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        keywords: normalizedKeywords,
        canonicalUrl: canonicalUrl || '',
        lastUpdated: new Date()
      });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};