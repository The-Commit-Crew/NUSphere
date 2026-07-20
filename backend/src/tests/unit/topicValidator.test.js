import { describe, it, expect } from "@jest/globals";
import { createTopicSchema } from "../../validators/topicValidator.js";

describe("createTopicSchema", () => {
  it("should validate a completely valid topic", () => {
    const validData = {
      name: "Campus Housing",
      description: "Discussions regarding dorms, RCs, and off-campus housing.",
    };
    const { error, value } = createTopicSchema.validate(validData);
    expect(error).toBeUndefined();
    expect(value.name).toBe("Campus Housing");
  });

  it("should fail if name is missing", () => {
    const invalidData = {
      description: "This is a valid description but name is missing.",
    };
    const { error } = createTopicSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Name is required");
  });

  it("should fail if description is missing", () => {
    const invalidData = {
      name: "Valid Name",
    };
    const { error } = createTopicSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Description is required");
  });

  it("should fail if name is under 3 characters", () => {
    const invalidData = {
      name: "Hi",
      description: "This description is definitely long enough.",
    };
    const { error } = createTopicSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Name must be at least 3 characters");
  });

  it("should fail if name exceeds 150 characters", () => {
    const invalidData = {
      name: "A".repeat(151),
      description: "This description is definitely long enough.",
    };
    const { error } = createTopicSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Name cannot exceed 150 characters");
  });

  it("should fail if description is under 10 characters", () => {
    const invalidData = {
      name: "Valid Name",
      description: "Short",
    };
    const { error } = createTopicSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe(
      "Description must be at least 10 characters",
    );
  });

  it("should trim whitespace from name and description", () => {
    const paddedData = {
      name: "  Spaced Name  ",
      description: "  This description has extra spaces.  ",
    };
    const { error, value } = createTopicSchema.validate(paddedData);
    expect(error).toBeUndefined();
    expect(value.name).toBe("Spaced Name");
    expect(value.description).toBe("This description has extra spaces.");
  });
});
