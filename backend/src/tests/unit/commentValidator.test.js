import { describe, it, expect } from "@jest/globals";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../../validators/commentValidator.js";

describe("createCommentSchema", () => {
  const validComment = {
    content: "This is a valid comment content.",
  };

  it("should pass with valid top-level comment input", () => {
    const { error } = createCommentSchema.validate(validComment);
    expect(error).toBeUndefined();
  });

  it("should pass with valid reply comment input (includes parentId)", () => {
    const { error } = createCommentSchema.validate({
      ...validComment,
      parentId: 5,
    });
    expect(error).toBeUndefined();
  });

  it("should fail when content is missing", () => {
    const { error } = createCommentSchema.validate({});
    expect(error).toBeDefined();
  });

  it("should fail when content is empty", () => {
    const { error } = createCommentSchema.validate({ content: "" });
    expect(error).toBeDefined();
  });

  it("should fail when parentId is a string", () => {
    const { error } = createCommentSchema.validate({
      ...validComment,
      parentId: "parent",
    });
    expect(error).toBeDefined();
  });

  it("should fail when parentId is negative or zero", () => {
    const { error } = createCommentSchema.validate({
      ...validComment,
      parentId: 0,
    });
    expect(error).toBeDefined();
  });
});

describe("updateCommentSchema", () => {
  it("should pass with valid content", () => {
    const { error } = updateCommentSchema.validate({
      content: "Updated comment content here.",
    });
    expect(error).toBeUndefined();
  });

  it("should fail when content is missing", () => {
    const { error } = updateCommentSchema.validate({});
    expect(error).toBeDefined();
  });

  it("should fail when content is empty", () => {
    const { error } = updateCommentSchema.validate({
      content: "   ",
    });
    expect(error).toBeDefined();
  });

  it("should fail when passing unallowed fields like parentId", () => {
    const { error } = updateCommentSchema.validate({
      content: "Valid content",
      parentId: 5,
    });
    expect(error).toBeDefined();
  });
});
