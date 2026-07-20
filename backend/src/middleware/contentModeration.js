import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";

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
    // eslint-disable-next-line no-console
    console.error("OpenAI Moderation Error:", error);
    return res.status(500).json({
      message:
        "Unable to verify content safety at this time. Please try again.",
    });
  }
};

export const moderateImageContent = async (req, res, next) => {
  if (!req.file || !req.file.path) {
    return next();
  }

  if (!process.env.OPENAI_API_KEY || process.env.JEST_WORKER_ID) {
    return next();
  }

  try {
    const openai = new OpenAI();
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: [
        {
          type: "image_url",
          image_url: {
            url: req.file.path,
          },
        },
      ],
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

    if (req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    return res.status(400).json({
      message:
        "Your profile picture was flagged by our automated moderation system.",
      categories: flaggedCategories,
    });
  } catch (error) {
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    // eslint-disable-next-line no-console
    console.error("OpenAI Moderation Error:", error);
    return res.status(500).json({
      message: "Unable to verify image safety at this time. Please try again.",
    });
  }
};
