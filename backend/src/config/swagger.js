import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NUSphere API",
      version: "2.0.0",
      description:
        "API documentation for NUSphere, a community-driven forum and collaboration platform for the NUS community.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://nusphere-api.azurewebsites.net",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", example: "e1234567@u.nus.edu" },
            isVerified: { type: "boolean", example: true },
            bio: {
              type: "string",
              nullable: true,
              example:
                "Full-stack developer passionate about building cool stuff.",
            },
            githubLink: {
              type: "string",
              nullable: true,
              example: "https://github.com/johndoe",
            },
            linkedinLink: {
              type: "string",
              nullable: true,
              example: "https://linkedin.com/in/johndoe",
            },
            profilePic: {
              type: "string",
              nullable: true,
              example: "https://example.com/pic.jpg",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        UpdateProfileRequest: {
          type: "object",
          properties: {
            bio: {
              type: "string",
              example:
                "Full-stack developer passionate about building cool stuff.",
            },
            githubLink: {
              type: "string",
              example: "https://github.com/johndoe",
            },
            linkedinLink: {
              type: "string",
              example: "https://linkedin.com/in/johndoe",
            },
            profilePic: {
              type: "string",
              example: "https://example.com/pic.jpg",
            },
            skills: {
              type: "array",
              items: { type: "string" },
              example: ["React", "Node.js", "Prisma"],
            },
          },
        },

        UserProfile: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "React" },
                    },
                  },
                },
                authoredProjects: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Project" },
                },
                applications: {
                  type: "array",
                  description:
                    "Only visible if the logged-in user is viewing their own profile",
                  items: { $ref: "#/components/schemas/ProjectApplication" },
                },
              },
            },
          ],
        },

        UserDashboard: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "React" },
                    },
                  },
                },
                authoredProjects: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/Project" },
                      {
                        type: "object",
                        properties: {
                          applications: {
                            type: "array",
                            items: {
                              allOf: [
                                {
                                  $ref: "#/components/schemas/ProjectApplication",
                                },
                                {
                                  type: "object",
                                  properties: {
                                    user: {
                                      type: "object",
                                      properties: {
                                        id: { type: "integer", example: 2 },
                                        firstName: {
                                          type: "string",
                                          example: "Jane",
                                        },
                                        lastName: {
                                          type: "string",
                                          example: "Smith",
                                        },
                                        username: {
                                          type: "string",
                                          example: "janesmith",
                                        },
                                        profilePic: {
                                          type: "string",
                                          nullable: true,
                                        },
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
                applications: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/ProjectApplication" },
                      {
                        type: "object",
                        properties: {
                          project: {
                            type: "object",
                            properties: {
                              id: { type: "integer", example: 1 },
                              title: {
                                type: "string",
                                example: "NLP Research Assistant",
                              },
                              status: { type: "string", example: "OPEN" },
                              author: {
                                type: "object",
                                properties: {
                                  username: {
                                    type: "string",
                                    example: "johndoe",
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },

        OtpToken: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 1 },
            token: { type: "string", example: "123456" },
            expiresAt: { type: "string", format: "date-time" },
            used: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        Topic: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Housing" },
            description: {
              type: "string",
              example: "Discuss on-campus and off-campus housing options",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            postCount: {
              type: "integer",
              example: 42,
              description: "Number of posts in this topic",
            },
          },
        },

        TopicWithPosts: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Housing" },
            description: {
              type: "string",
              example: "Discuss on-campus and off-campus housing options",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            posts: {
              type: "array",
              items: {
                $ref: "#/components/schemas/PostWithDetails",
              },
            },
          },
        },

        Post: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: {
              type: "string",
              example: "Best modules to take in Year 1",
            },
            content: {
              type: "string",
              example: "I would strongly recommend taking CS1101S first...",
            },
            authorId: { type: "integer", example: 1 },
            topicId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        PostWithDetails: {
          type: "object",
          description: "Post with nested author and topic details",
          properties: {
            id: { type: "integer", example: 1 },
            title: {
              type: "string",
              example: "Best modules to take in Year 1",
            },
            content: {
              type: "string",
              example: "I would strongly recommend taking CS1101S first...",
            },
            authorId: { type: "integer", example: 1 },
            topicId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            author: {
              type: "object",
              description: "Partial author details",
              properties: {
                username: { type: "string", example: "johndoe" },
                firstName: { type: "string", example: "John" },
                lastName: { type: "string", example: "Doe" },
              },
            },
            topic: {
              type: "object",
              description: "Partial topic details",
              properties: {
                name: { type: "string", example: "Modules" },
              },
            },
            _count: {
              type: "object",
              description: "Comment count",
              properties: {
                comments: { type: "integer" },
              },
            },
          },
        },

        Comment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            content: { type: "string", example: "This is a great point!" },
            postId: { type: "integer", example: 1 },
            authorId: { type: "integer", example: 1 },
            parentId: { type: "integer", nullable: true, example: null },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        CommentWithReplies: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            content: { type: "string", example: "This is a great point!" },
            author: {
              type: "object",
              properties: {
                username: { type: "string", example: "johndoe" },
                profilePic: {
                  type: "string",
                  nullable: true,
                  example: "https://example.com/pic.jpg",
                },
              },
            },
            replies: {
              type: "array",
              description: "Nested replies (same structure as parent)",
              items: {
                type: "object",
              },
            },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "username", "email", "password"],
          properties: {
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", example: "e1234567@u.nus.edu" },
            password: { type: "string", example: "Password1" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["password"],
          properties: {
            email: {
              type: "string",
              example: "e1234567@u.nus.edu",
              description: "Provide either email or username",
            },
            username: {
              type: "string",
              example: "johndoe",
              description: "Provide either email or username",
            },
            password: { type: "string", example: "Password1" },
          },
        },

        OtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", example: "e1234567@u.nus.edu" },
            otp: { type: "string", example: "123456" },
          },
        },

        ResendOtpRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", example: "e1234567@u.nus.edu" },
          },
        },

        CreatePostRequest: {
          type: "object",
          required: ["title", "content", "topicId"],
          properties: {
            title: {
              type: "string",
              example: "Best modules to take in Year 1",
            },
            content: {
              type: "string",
              example: "I would strongly recommend taking CS1101S first...",
            },
            topicId: { type: "integer", example: 1 },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["login", "otp_required", "verified"],
              example: "login",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description:
                "JWT token — only present when action is login or verified",
            },
            email: {
              type: "string",
              example: "e1234567@u.nus.edu",
              description: "Only present when action is otp_required",
            },
            message: {
              type: "string",
              example: "OTP sent to your NUS email",
              description: "Only present when action is otp_required",
            },
            user: {
              $ref: "#/components/schemas/User",
              description: "Only present when action is login or verified",
            },
          },
        },

        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Something went wrong" },
          },
        },

        Project: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "NLP Research Assistant" },
            description: {
              type: "string",
              example:
                "Looking for a student to help with sentiment analysis research.",
            },
            status: {
              type: "string",
              enum: ["OPEN", "IN_PROGRESS", "COMPLETED"],
              example: "OPEN",
            },
            authorId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  name: { type: "string", example: "Python" },
                },
              },
            },
            author: {
              type: "object",
              properties: {
                firstName: { type: "string", example: "John" },
                lastName: { type: "string", example: "Doe" },
                username: { type: "string", example: "johndoe" },
              },
            },
          },
        },

        ProjectApplication: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            projectId: { type: "integer", example: 1 },
            userId: { type: "integer", example: 2 },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED"],
              example: "PENDING",
            },
            message: {
              type: "string",
              nullable: true,
              example: "I have 2 years of NLP experience.",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                username: { type: "string", example: "johndoe" },
                firstName: { type: "string", example: "John" },
                lastName: { type: "string", example: "Doe" },
                email: { type: "string", example: "e1234567@u.nus.edu" },
              },
            },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the notification",
            },
            userId: {
              type: "integer",
              description: "ID of the user receiving the notification",
            },
            type: {
              type: "string",
              enum: ["REPLY", "VOTE", "MENTION", "PROJECT_APPLICATION"],
              description: "The category of the notification",
            },
            message: {
              type: "string",
              description: "The main notification text",
            },
            isRead: {
              type: "boolean",
              description: "Whether the user has seen this notification yet",
            },
            postId: {
              type: "integer",
              nullable: true,
              description: "ID of the associated post (if applicable)",
            },
            commentId: {
              type: "integer",
              nullable: true,
              description: "ID of the associated comment (if applicable)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
