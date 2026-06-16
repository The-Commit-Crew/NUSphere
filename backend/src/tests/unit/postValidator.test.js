import { describe, it, expect } from "@jest/globals";
import {
  createPostSchema,
  voteSchema,
} from "../../validators/postValidator.js";

describe("createPostSchema", () => {
  const validPost = {
    title: "Valid Post Title",
    content: "This is a valid post content with more than 10 characters.",
    topicId: 1,
  };

  it("should pass with valid input", () => {
    const { error } = createPostSchema.validate(validPost);
    expect(error).toBeUndefined();
  });

  it("should fail when title is under 3 characters", () => {
    const { error } = createPostSchema.validate({
      ...validPost,
      title: "Hi",
    });
    expect(error).toBeDefined();
  });

  it("should fail when title is missing", () => {
    const { error } = createPostSchema.validate({
      ...validPost,
      title: undefined,
    });
    expect(error).toBeDefined();
  });

  it("should fail when content is under 10 characters", () => {
    const { error } = createPostSchema.validate({
      ...validPost,
      content: "Too short",
    });
    expect(error).toBeDefined();
  });

  it("should fail when content is missing", () => {
    const { error } = createPostSchema.validate({
      ...validPost,
      content: undefined,
    });
    expect(error).toBeDefined();
  });

  it("should fail when topicId is missing", () => {
    const { error } = createPostSchema.validate({
      ...validPost,
      topicId: undefined,
    });
    expect(error).toBeDefined();
  });

  it("should fail when topicId is a non-integer", () => {
    const { error } = createPostSchema.validate({
      ...validPost,
      topicId: "one",
    });
    expect(error).toBeDefined();
  });
});

describe("voteSchema", () => {
  it("should pass with valid UP vote", () => {
    const { error } = voteSchema.validate({ voteType: "UP" });
    expect(error).toBeUndefined();
  });

  it("should pass with valid DOWN vote", () => {
    const { error } = voteSchema.validate({ voteType: "DOWN" });
    expect(error).toBeUndefined();
  });

  it("should fail when voteType is invalid string", () => {
    const { error } = voteSchema.validate({ voteType: "SIDEWAYS" });
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe(
      "Vote type must be exactly 'UP' or 'DOWN'",
    );
  });

  it("should fail when voteType is missing", () => {
    const { error } = voteSchema.validate({});
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Vote type is required");
  });

  it("should fail when voteType is empty", () => {
    const { error } = voteSchema.validate({ voteType: "" });
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe(
      "Vote type must be exactly 'UP' or 'DOWN'",
    );
  });
});
