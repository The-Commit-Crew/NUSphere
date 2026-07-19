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
    tags: [
      { name: "Auth", description: "Authentication and account management" },
      { name: "Users", description: "User profiles and settings" },
      { name: "Topics", description: "Discussion categories" },
      { name: "Posts", description: "Community posts" },
      { name: "Comments", description: "Post comments and replies" },
      { name: "Projects", description: "Collaboration and research projects" },
      { name: "Bookmarks", description: "Saved posts" },
      { name: "Notifications", description: "User notifications" }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description:
            "HttpOnly cookie containing the access token for authentication. Swagger will automatically pass this if it is set in your browser during testing.",
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

        TopicById: {
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
            upvoteCount: { type: "integer", example: 15 },
            downvoteCount: { type: "integer", example: 2 },
            authorId: { type: "integer", example: 1 },
            topicId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            isAnonymous: { type: "boolean", example: false },
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
            upvoteCount: { type: "integer", example: 15 },
            downvoteCount: { type: "integer", example: 2 },
            authorId: { type: "integer", example: 1 },
            topicId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            isAnonymous: { type: "boolean", example: false },
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
            isAnonymous: { type: "boolean", example: false },
          },
        },

        CommentWithReplies: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            content: { type: "string", example: "This is a great point!" },
            isAnonymous: { type: "boolean", example: false },
            isMine: { type: "boolean", example: true },
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

        ForgotPasswordRequest: {
          type: "object",
          required: [],
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
          },
        },

        ResetPasswordRequest: {
          type: "object",
          required: ["newPassword"],
          properties: {
            newPassword: {
              type: "string",
              example: "Password123",
              description: "Must meet password complexity requirements",
            },
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
            isAnonymous: { type: "boolean", example: false },
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

        RateLimitError: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Too many requests, please try again later.",
            },
            retryAfter: {
              type: "integer",
              example: 60,
            },
          },
        },

        ModerationError: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example:
                "Your content was flagged by our automated moderation system. Please revise your text.",
            },
            categories: {
              type: "array",
              items: { type: "string" },
              description:
                "List of categories that the content was flagged for.",
              example: ["hate", "harassment"],
            },
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
        Skill: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "REACT" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Operation successful" },
          },
        },
        CreateProjectRequest: {
          type: "object",
          required: ["title", "description", "skills"],
          properties: {
            title: {
              type: "string",
              minLength: 5,
              maxLength: 100,
              example: "NLP Research Assistant",
            },
            description: {
              type: "string",
              minLength: 20,
              example: "Looking for a student to help with sentiment analysis research.",
            },
            skills: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              example: ["Python", "NLP", "Machine Learning"],
            },
          },
        },
        UpdateProjectRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
              minLength: 5,
              maxLength: 100,
              example: "Updated Project Title",
            },
            description: {
              type: "string",
              minLength: 20,
              example: "Updated description with more details about the project.",
            },
            status: {
              type: "string",
              enum: ["OPEN", "IN_PROGRESS", "COMPLETED"],
              example: "IN_PROGRESS",
            },
            skills: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              example: ["Python", "React"],
            },
          },
        },
        ApplyToProjectRequest: {
          type: "object",
          properties: {
            message: {
              type: "string",
              maxLength: 500,
              description: "Optional message to the project author",
              example: "I have 2 years of experience in NLP and would love to contribute.",
            },
          },
        },
        UpdateApplicationStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["ACCEPTED", "REJECTED"],
              example: "ACCEPTED",
            },
          },
        },
        VoteRequest: {
          type: "object",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              enum: ["UP", "DOWN"],
              example: "UP",
            },
          },
        },
        CsrfTokenResponse: {
          type: "object",
          properties: {
            csrfToken: {
              type: "string",
              description: "The token string to attach to the x-csrf-token header.",
            },
          },
        },
        BookmarkRequest: {
          type: "object",
          required: ["postId"],
          properties: {
            postId: { type: "integer", example: 1 },
          },
        },
        BookmarkStatusResponse: {
          type: "object",
          properties: {
            hasBookmarked: { type: "boolean", example: true },
          },
        },
        CreateCommentRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              example: "This is a great post!",
              minLength: 1,
              maxLength: 1000,
            },
            isAnonymous: { type: "boolean", example: false, default: false },
            parentId: {
              type: "integer",
              nullable: true,
              description: "The ID of the comment being replied to. Omit or set to null for top-level comments.",
              example: null
            }
          },
        },
        UpdateCommentRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", example: "Updated comment content." },
          },
        },
        UpdatePostRequest: {
          type: "object",
          properties: {
            title: { type: "string", example: "Updated title" },
            content: { type: "string", example: "Updated content" },
            topicId: { type: "integer", example: 2 },
          },
        },
        ProjectWithDetails: {
          allOf: [
            { $ref: "#/components/schemas/Project" },
            {
              type: "object",
              properties: {
                applicationCount: {
                  type: "integer",
                  description: "Total number of applications received",
                  example: 5,
                },
              },
            },
          ],
        },
        CreateTopicRequest: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: { type: "string", description: "The name of the proposed topic", example: "Campus Housing" },
            description: { type: "string", description: "A detailed description of what the topic covers", example: "Discussions regarding dorms, RCs, and off-campus housing." },
          },
        },
        CreateTopicResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            isDuplicate: { type: "boolean", example: false },
            topic: { $ref: "#/components/schemas/Topic" },
          },
        },
        DuplicateTopicResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            isDuplicate: { type: "boolean", example: true },
            existingTopicId: { type: "integer", example: 4 },
            reason: { type: "string", example: "This topic overlaps significantly with 'Housing'." },
          },
        },
        UploadProfileImageRequest: {
          type: "object",
          properties: {
            profileImage: {
              type: "string",
              format: "binary",
              description: "The image file to upload (jpg, jpeg, png, webp). Max size 5MB.",
            },
          },
        },
        SimilarPostsResponse: {
          type: "object",
          properties: {
            similarPosts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 42 },
                  title: { type: "string", example: "CS2040C workload is crazy" },
                  content: { type: "string", example: "Does anyone else find the data structures hard?" },
                  similarity: { type: "number", format: "float", example: 0.85 },
                },
              },
            },
          },
        },
        VoteResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 42 },
            upvoteCount: { type: "integer", example: 15 },
            downvoteCount: { type: "integer", example: 3 },
          },
        },
        PostWithContext: {
          allOf: [
            { $ref: "#/components/schemas/PostWithDetails" },
            {
              type: "object",
              properties: {
                userVoteStatus: {
                  type: "string",
                  nullable: true,
                  enum: ["UP", "DOWN"],
                  description: "The current user's vote on this post. null if unauthenticated or not yet voted.",
                  example: "UP",
                },
                bookmarkStatus: {
                  type: "boolean",
                  description: "True if the user has bookmarked this post.",
                  example: false,
                },
              },
            },
          ],
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
