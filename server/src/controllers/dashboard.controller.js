
import Article from "../models/Article.js";
import User from "../models/User.js";
import Topic from "../models/Topic.js";

/**
 * Get dashboard overview stats and recent activity
 */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Get fundamental counts
    const totalArticles = await Article.countDocuments({ status: "published" });
    const totalDrafts = await Article.countDocuments({ status: "draft" });
    const totalUsers = await User.countDocuments();
    const totalTopics = await Topic.countDocuments();
    const recent30DaysCount = await Article.countDocuments({
      status: "published",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // 2. Analytics Calculation
    const allPublished = await Article.find({ status: "published" }, "readCount content");

    // Total Readership
    const totalReadership = allPublished.reduce((acc, art) => acc + (art.readCount || 0), 0);

    // Average Read Time (approx 200 words per minute)
    const totalWords = allPublished.reduce((acc, art) => acc + (art.content?.split(/\s+/).length || 0), 0);
    const avgMinutes = allPublished.length > 0 ? totalWords / allPublished.length / 200 : 0;
    const readTimeFormatted = `${Math.floor(avgMinutes)}:${String(Math.floor(avgMinutes % 1 * 60)).padStart(2, '0')}`;

    // Growth Percentage (Last 30 days vs total)
    const growthPercent = totalArticles > 0 ? Math.round(recent30DaysCount / totalArticles * 100) : 0;

    // Signal Velocity (Conversion ratio of finished vs total content)
    const velocity = totalArticles + totalDrafts > 0 ? Math.round(totalArticles / (totalArticles + totalDrafts) * 100) : 0;

    // 4. Get recent articles (Live Dispatches)
    const recentArticles = await Article.find().
    populate("author", "fullName").
    sort({ createdAt: -1 }).
    limit(5);

    // 5. Editorial Focus (Topic Distribution)
    const topTopics = await Article.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$topic" },
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 4 }]
    );

    const editorialFocus = await Promise.all(topTopics.map(async (t) => {
      const topic = await Topic.findById(t._id);
      const percentage = totalArticles > 0 ? Math.round(t.count / totalArticles * 100) : 0;
      return {
        label: topic?.name || 'Inertia',
        percentage: percentage || 10, // Minimum floor for visualization
        intensity: t.count > 10 ? 'ULTRA' : t.count > 3 ? 'HIGH' : 'STABLE',
        color: t.count > 10 ? 'bg-emerald-500' : t.count > 3 ? 'bg-blue-500' : 'bg-zinc-400'
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: [
        { label: 'Total Readership', value: formatCount(totalReadership), trend: `+${growthPercent}%`, icon: 'Users' },
        { label: 'Avg. Read Time', value: readTimeFormatted, trend: '+2%', icon: 'Clock' },
        { label: 'Signal Velocity', value: `${velocity}%`, trend: '+5%', icon: 'TrendingUp' },
        { label: 'Active Reports', value: totalArticles.toString(), trend: '+0%', icon: 'FileText' }],

        recentArticles: recentArticles.map((art) => ({
          id: art._id,
          title: art.title,
          status: art.status.toUpperCase(),
          views: formatCount(art.readCount || 0),
          author: art.author?.fullName || 'System',
          date: formatTimeAgo(art.createdAt)
        })),
        editorialFocus,
        counts: {
          articles: totalArticles,
          drafts: totalDrafts,
          users: totalUsers,
          topics: totalTopics
        }
      }
    });
  } catch (error) {
    console.error("[DASHBOARD] getDashboardStats error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Helper to format counts (e.g., 1200 -> 1.2K)
function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Helper to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}