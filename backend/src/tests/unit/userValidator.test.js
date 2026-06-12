import { describe, it, expect } from "@jest/globals";
import { updateProfileSchema } from "../../validators/userValidator.js";

describe("updateProfileSchema", () => {
  const validProfile = {
    bio: "I am a full stack developer.",
    githubLink: "https://github.com/nusphere",
    linkedinLink: "https://linkedin.com/in/nusphere",
    profilePic: "https://example.com/pic.png",
    skills: ["React", "Node.js"],
  };

  it("should pass with all valid fields provided", () => {
    const { error } = updateProfileSchema.validate(validProfile);
    expect(error).toBeUndefined();
  });

  it("should pass when all optional fields are missing or null", () => {
    const { error } = updateProfileSchema.validate({});
    expect(error).toBeUndefined();

    const { error: nullError } = updateProfileSchema.validate({
      bio: null,
      githubLink: null,
      linkedinLink: null,
      profilePic: null,
      skills: null,
    });
    expect(nullError).toBeUndefined();
  });

  it("should fail when bio exceeds 500 characters", () => {
    const { error } = updateProfileSchema.validate({
      ...validProfile,
      bio: "A".repeat(501),
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Bio cannot exceed 500 characters");
  });

  it("should fail when githubLink is not a valid URI", () => {
    const { error } = updateProfileSchema.validate({
      ...validProfile,
      githubLink: "not-a-url",
    });
    expect(error).toBeDefined();
  });

  it("should fail when linkedinLink uses http instead of https", () => {
    const { error } = updateProfileSchema.validate({
      ...validProfile,
      linkedinLink: "http://linkedin.com/in/nusphere",
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe(
      "LinkedIn link must be a valid secure URL (https)",
    );
  });

  it("should pass when skills array is empty", () => {
    const { error } = updateProfileSchema.validate({
      ...validProfile,
      skills: [],
    });
    expect(error).toBeUndefined();
  });

  it("should fail when skills array contains empty strings", () => {
    const { error } = updateProfileSchema.validate({
      ...validProfile,
      skills: ["React", "  "],
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toBe("Skill names cannot be empty");
  });
});
