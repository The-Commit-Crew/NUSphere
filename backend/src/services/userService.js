import prisma from "../config/prisma.js";
import { updateProfileSchema } from "../validators/userValidator.js";

export const updateUserProfileService = async (
  userId,
  { bio, githubLink, linkedinLink, profilePic, skills },
) => {
  const { error, value } = updateProfileSchema.validate({
    bio,
    githubLink,
    linkedinLink,
    profilePic,
    skills,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const normalizedSkills = value.skills?.map((skill) => {
    const lower = skill.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      bio,
      githubLink,
      linkedinLink,
      profilePic,
      ...(value.skills && {
        skills: {
          set: [],
          connectOrCreate: normalizedSkills.map((skillName) => {
            return {
              where: { name: skillName },
              create: { name: skillName },
            };
          }),
        },
      }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      createdAt: true,
      bio: true,
      githubLink: true,
      linkedinLink: true,
      profilePic: true,
      skills: { select: { id: true, name: true } },
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getUserProfileService = async (userId, username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      bio: true,
      githubLink: true,
      linkedinLink: true,
      profilePic: true,
      skills: { select: { id: true, name: true } },

      authoredProjects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          skills: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (userId == user.id) {
    const privateData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        createdAt: true,
        applications: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            message: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });
    return { ...user, ...privateData };
  }
  return user;
};

export const getUserDashboardService = async (userId) => {
  const data = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      createdAt: true,
      bio: true,
      githubLink: true,
      linkedinLink: true,
      profilePic: true,

      authoredProjects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          applications: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              status: true,
              message: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  profilePic: true,
                },
              },
            },
          },
        },
      },
      applications: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          message: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              title: true,
              status: true,
              author: {
                select: { username: true },
              },
            },
          },
        },
      },
    },
  });
  if (!data) {
    throw new Error("User not found");
  }
  return data;
};
