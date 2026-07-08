import {
  toggleBookmarkService,
  getUserBookmarksService,
} from "../services/bookmarkService.js";

export const toggleBookmark = async (req, res) => {
  try {
    const result = await toggleBookmarkService(
      parseInt(req.user.userId),
      parseInt(req.params.id),
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getUserBookmarks = async (req, res) => {
  try {
    const result = await getUserBookmarksService(parseInt(req.user.userId));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
