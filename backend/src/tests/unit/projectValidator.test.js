import { describe, it, expect } from "@jest/globals";
import {
  createProjectSchema,
  applyToProjectSchema,
  updateApplicationStatusSchema,
  updateProjectSchema,
  searchProjectQuerySchema,
} from "../../validators/projectValidator.js";

describe("createProjectSchema", () => {
  const validInput = {
    title: "Awesome Project Title",
    description:
      "This is a detailed description of the project that meets the length requirement.",
    skills: ["React", "Node.js"],
  };

  it("should pass with valid input", () => {
    const { error } = createProjectSchema.validate(validInput);
    expect(error).toBeUndefined();
  });

  it("should fail with title under 5 characters", () => {
    const { error } = createProjectSchema.validate({
      ...validInput,
      title: "Abc",
    });
    expect(error).toBeDefined();
  });

  it("should fail with description under 20 characters", () => {
    const { error } = createProjectSchema.validate({
      ...validInput,
      description: "Too short",
    });
    expect(error).toBeDefined();
  });

  it("should fail if skills array is empty", () => {
    const { error } = createProjectSchema.validate({
      ...validInput,
      skills: [],
    });
    expect(error).toBeDefined();
  });
});

describe("applyToProjectSchema", () => {
  it("should pass with valid message", () => {
    const { error } = applyToProjectSchema.validate({
      message: "I would love to join!",
    });
    expect(error).toBeUndefined();
  });

  it("should pass when message is missing (optional)", () => {
    const { error } = applyToProjectSchema.validate({});
    expect(error).toBeUndefined();
  });

  it("should fail if message exceeds 500 characters", () => {
    const { error } = applyToProjectSchema.validate({
      message: "a".repeat(501),
    });
    expect(error).toBeDefined();
  });
});

describe("updateApplicationStatusSchema", () => {
  it("should pass with ACCEPTED", () => {
    const { error } = updateApplicationStatusSchema.validate({
      status: "ACCEPTED",
    });
    expect(error).toBeUndefined();
  });

  it("should pass with REJECTED", () => {
    const { error } = updateApplicationStatusSchema.validate({
      status: "REJECTED",
    });
    expect(error).toBeUndefined();
  });

  it("should fail with invalid status", () => {
    const { error } = updateApplicationStatusSchema.validate({
      status: "PENDING",
    });
    expect(error).toBeDefined();
  });

  it("should fail when status is missing", () => {
    const { error } = updateApplicationStatusSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe("updateProjectSchema", () => {
  it("should pass with empty object (all fields optional)", () => {
    const { error } = updateProjectSchema.validate({});
    expect(error).toBeUndefined();
  });

  it("should pass with valid partial update", () => {
    const { error } = updateProjectSchema.validate({
      title: "New Valid Title",
    });
    expect(error).toBeUndefined();
  });

  it("should pass with valid status update", () => {
    const { error } = updateProjectSchema.validate({ status: "IN_PROGRESS" });
    expect(error).toBeUndefined();
  });

  it("should fail with invalid status", () => {
    const { error } = updateProjectSchema.validate({ status: "INVALID" });
    expect(error).toBeDefined();
  });

  it("should fail if skills array provided but empty", () => {
    const { error } = updateProjectSchema.validate({ skills: [] });
    expect(error).toBeDefined();
  });
});

describe("searchProjectQuerySchema", () => {
  it("should pass with valid partial query", () => {
    const { error, value } = searchProjectQuerySchema.validate({
      q: " React ",
      page: "1",
    });
    expect(error).toBeUndefined();
    expect(value.q).toBe("React");
    expect(value.page).toBe(1);
    expect(value.limit).toBe(10);
  });

  it("should pass with full query and sort options", () => {
    const { error, value } = searchProjectQuerySchema.validate({
      q: "web",
      skills: "React, Node.js ",
      sortBy: "newest",
      page: "2",
      limit: "5",
    });
    expect(error).toBeUndefined();
    expect(value.skills).toBe("React, Node.js");
    expect(value.sortBy).toBe("newest");
    expect(value.page).toBe(2);
    expect(value.limit).toBe(5);
  });

  it("should fail with invalid limit", () => {
    const { error } = searchProjectQuerySchema.validate({ limit: "100" });
    expect(error).toBeDefined();
  });

  it("should fail with invalid sortBy", () => {
    const { error } = searchProjectQuerySchema.validate({ sortBy: "invalidField" });
    expect(error).toBeDefined();
  });
});
