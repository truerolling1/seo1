const axios = require("axios");
const cheerio = require("cheerio");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { url, keywords } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(html);

    const title = $("title").text();
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1").first().text();
    const images = $("img");
    let imagesMissingAlt = 0;
    images.each((_, img) => {
      if (!$(img).attr("alt")) imagesMissingAlt++;
    });

    const keywordSuggestions = [];
    let keywordScore = 0;
    const keywordList = Array.isArray(keywords) ? keywords : [];

    keywordList.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const matchesTitle = title.toLowerCase().includes(keywordLower);
      const matchesH1 = h1.toLowerCase().includes(keywordLower);
      const matchesMeta = metaDescription.toLowerCase().includes(keywordLower);

      if (!matchesTitle) keywordSuggestions.push(`Add "${keyword}" to the title tag.`);
      if (!matchesH1) keywordSuggestions.push(`Include "${keyword}" in the H1 tag.`);
      if (!matchesMeta) keywordSuggestions.push(`Use "${keyword}" in the meta description.`);

      if (matchesTitle) keywordScore += 10;
      if (matchesH1) keywordScore += 10;
      if (matchesMeta) keywordScore += 10;
    });

    if (imagesMissingAlt > 0) {
      keywordSuggestions.push(`${imagesMissingAlt} image(s) missing alt tags.`);
    } else {
      keywordScore += 10;
    }

    const report = {
      url,
      keywords: keywordList,
      score: Math.min(100, keywordScore),
      suggestions: keywordSuggestions.length > 0
        ? keywordSuggestions
        : ["No issues found! Great job."]
    };

    res.status(200).json(report);
  } catch (error) {
    console.error("Audit error:", error.toString(), error.stack);
    res.status(500).json({
      error: "Failed to analyze site. The site may be blocking this tool, or the URL may be invalid."
    });
  }
}
