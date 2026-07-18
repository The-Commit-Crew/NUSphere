import OpenAI from "openai";

export const moderateContent = async (req, res, next) => {
  const incoming = Object.values(req.body);
  const text = incoming.filter((value) => {
    return typeof value === "string" && value.trim() != "";
  });
  if (text.length === 0) {
    return next();
  }

  if (!process.env.OPENAI_API_KEY || process.env.JEST_WORKER_ID) {
    return next();
  }

  try {
    const openai = new OpenAI();
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const isFlagged = moderation.results.some((result) => result.flagged);
    if (!isFlagged) {
      return next();
    }

    const flaggedResults = moderation.results.filter(
      (result) => result.flagged,
    );

    const uniqueCategories = new Set();

    flaggedResults.forEach((result) => {
      Object.keys(result.categories).forEach((category) => {
        if (result.categories[category] === true) {
          uniqueCategories.add(category);
        }
      });
    });

    const flaggedCategories = Array.from(uniqueCategories);

    return res.status(400).json({
      message:
        "Your content was flagged by our automated moderation system. Please revise your text.",
      categories: flaggedCategories,
    });
  } catch (error) {
    console.error("OpenAI Moderation Error:", error);
    return res.status(500).json({
      message:
        "Unable to verify content safety at this time. Please try again.",
    });
  }
};
