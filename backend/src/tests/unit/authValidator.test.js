import { describe, it, expect } from "@jest/globals";
import {
  registerSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/authValidator.js";

describe("registerSchema", () => {
  const validInput = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "e1234567@u.nus.edu",
    password: "Password1",
  };

  it("should pass with valid input", () => {
    const { error } = registerSchema.validate(validInput);
    expect(error).toBeUndefined();
  });

  it("should fail with non-NUS email", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      email: "john@gmail.com",
    });
    expect(error).toBeDefined();
  });

  it("should fail with password under 8 characters", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      password: "Pass1",
    });
    expect(error).toBeDefined();
  });

  it("should fail with password containing no numbers", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      password: "PasswordOnly",
    });
    expect(error).toBeDefined();
  });

  it("should fail with password containing no letters", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      password: "12345678",
    });
    expect(error).toBeDefined();
  });

  it("should fail with username containing special characters", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      username: "john_doe!",
    });
    expect(error).toBeDefined();
  });

  it("should fail with username under 3 characters", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      username: "jo",
    });
    expect(error).toBeDefined();
  });

  it("should fail with firstName containing numbers", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      firstName: "John123",
    });
    expect(error).toBeDefined();
  });

  it("should fail when email is missing", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      email: undefined,
    });
    expect(error).toBeDefined();
  });

  it("should pass with nus.edu.sg email", () => {
    const { error } = registerSchema.validate({
      ...validInput,
      email: "prof.tan@nus.edu.sg",
    });
    expect(error).toBeUndefined();
  });
});

describe("loginSchema", () => {
  it("should pass with valid email and password", () => {
    const { error } = loginSchema.validate({
      email: "e1234567@u.nus.edu",
      password: "Password1",
    });
    expect(error).toBeUndefined();
  });

  it("should pass with valid username and password", () => {
    const { error } = loginSchema.validate({
      username: "johndoe",
      password: "Password1",
    });
    expect(error).toBeUndefined();
  });

  it("should fail when neither email nor username is provided", () => {
    const { error } = loginSchema.validate({
      password: "Password1",
    });
    expect(error).toBeDefined();
  });

  it("should fail when password is missing", () => {
    const { error } = loginSchema.validate({
      email: "e1234567@u.nus.edu",
    });
    expect(error).toBeDefined();
  });

  it("should fail with non-NUS email", () => {
    const { error } = loginSchema.validate({
      email: "john@gmail.com",
      password: "Password1",
    });
    expect(error).toBeDefined();
  });
});

describe("forgotPasswordSchema", () => {
  it("should pass with valid email", () => {
    const { error } = forgotPasswordSchema.validate({
      email: "e1234567@u.nus.edu",
    });
    expect(error).toBeUndefined();
  });

  it("should pass with valid username", () => {
    const { error } = forgotPasswordSchema.validate({
      username: "johndoe",
    });
    expect(error).toBeUndefined();
  });

  it("should fail when neither email nor username is provided", () => {
    const { error } = forgotPasswordSchema.validate({});
    expect(error).toBeDefined();
  });

  it("should fail with non-NUS email", () => {
    const { error } = forgotPasswordSchema.validate({
      email: "john@gmail.com",
    });
    expect(error).toBeDefined();
  });
});

describe("resetPasswordSchema", () => {
  it("should pass with a valid new password", () => {
    const { error } = resetPasswordSchema.validate({
      newPassword: "NewPassword1",
    });
    expect(error).toBeUndefined();
  });

  it("should fail with password under 8 characters", () => {
    const { error } = resetPasswordSchema.validate({
      newPassword: "Pass1",
    });
    expect(error).toBeDefined();
  });

  it("should fail with password containing no numbers", () => {
    const { error } = resetPasswordSchema.validate({
      newPassword: "PasswordOnly",
    });
    expect(error).toBeDefined();
  });

  it("should fail with password containing no letters", () => {
    const { error } = resetPasswordSchema.validate({
      newPassword: "12345678",
    });
    expect(error).toBeDefined();
  });

  it("should fail when password is missing", () => {
    const { error } = resetPasswordSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe("otpSchema", () => {
  it("should pass with valid email and 6-digit OTP", () => {
    const { error } = otpSchema.validate({
      email: "e1234567@u.nus.edu",
      otp: "123456",
    });
    expect(error).toBeUndefined();
  });

  it("should fail with OTP containing letters", () => {
    const { error } = otpSchema.validate({
      email: "e1234567@u.nus.edu",
      otp: "12345a",
    });
    expect(error).toBeDefined();
  });

  it("should fail with OTP under 6 digits", () => {
    const { error } = otpSchema.validate({
      email: "e1234567@u.nus.edu",
      otp: "12345",
    });
    expect(error).toBeDefined();
  });

  it("should fail with OTP over 6 digits", () => {
    const { error } = otpSchema.validate({
      email: "e1234567@u.nus.edu",
      otp: "1234567",
    });
    expect(error).toBeDefined();
  });

  it("should fail when OTP is missing", () => {
    const { error } = otpSchema.validate({
      email: "e1234567@u.nus.edu",
    });
    expect(error).toBeDefined();
  });
});
