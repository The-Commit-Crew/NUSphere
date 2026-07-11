import prisma from "../config/prisma.js";
import {
  createProjectSchema,
  applyToProjectSchema,
  updateApplicationStatusSchema,
  updateProjectSchema,
} from "../validators/projectValidator.js";
import { sendProjectUpdateEmail } from "../utils/sendEmail.js";
import notificationEmitter from "../utils/notificationEmitter.js";

export const createProjectService = async (
  authorId,
  { title, description, skills },
) => {
  const { error, value } = createProjectSchema.validate({
    title,
    description,
    skills,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const normalizedSkills = value.skills.map((skill) => skill.toUpperCase());

  const newProject = await prisma.project.create({
    data: {
      title,
      description,
      authorId,
      skills: {
        connectOrCreate: normalizedSkills.map((skillName) => {
          return {
            where: { name: skillName },
            create: { name: skillName },
          };
        }),
      },
    },
    include: {
      skills: {
        select: { id: true, name: true },
      },
      author: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });
  return newProject;
};

export const getAllProjectsService = async () => {
  const projects = await prisma.project.findMany({
    where: {
      status: "OPEN",
    },
    orderBy: { createdAt: "desc" },
    include: {
      skills: { select: { id: true, name: true } },
      author: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });
  return projects;
};

export const getProjectByIdService = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      skills: { select: { id: true, name: true } },
      author: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  return {
    ...project,
    applicationCount: project._count.applications,
  };
};

export const updateProjectService = async (
  projectId,
  authorId,
  { title, description, status, skills },
) => {
  const { error, value } = updateProjectSchema.validate({
    title,
    description,
    skills,
    status,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const updatedProject = await prisma.project.update({
    where: {
      authorId,
      id: projectId,
    },
    data: {
      title: title ?? undefined,
      description: description ?? undefined,
      status: status ?? undefined,
      skills: value.skills
        ? {
            set: [],
            connectOrCreate: value.skills.map((skill) => {
              const name = skill.toUpperCase();
              return { where: { name }, create: { name } };
            }),
          }
        : undefined,
    },
    include: {
      skills: { select: { id: true, name: true } },
      author: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });
  if (!updatedProject) {
    throw new Error("Error updating project status");
  }
  return updatedProject;
};

export const applyToProjectService = async (
  projectId,
  applicantId,
  { message },
) => {
  const { error } = applyToProjectSchema.validate({ message });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      status: "OPEN",
    },
  });
  if (!project) {
    throw new Error("No open projects found");
  }
  if (project.authorId == applicantId) {
    throw new Error("You cannot apply to your own project");
  }
  const existingApplication = await prisma.projectApplication.findUnique({
    where: { projectId_userId: { projectId, userId: applicantId } },
  });
  if (existingApplication) {
    throw new Error("You cannot apply to the same project multiple times");
  }
  const projectApplication = await prisma.projectApplication.create({
    data: {
      projectId,
      userId: applicantId,
      message,
    },
  });
  if (!projectApplication) {
    throw new Error("Error in project application");
  }
  notificationEmitter.emit("notification", {
    userId: project.authorId,
    type: "PROJECT_APPLICATION",
    message: "Someone applied to your project!",
    postId: null,
    commentId: null,
  });
  return { message: "Project application successful" };
};

export const getProjectApplicationsService = async (projectId, authorId) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      authorId,
    },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  const applications = await prisma.projectApplication.findMany({
    where: {
      projectId,
    },
    include: {
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  return applications;
};

export const updateApplicationStatusService = async (
  applicationId,
  authorId,
  { status },
) => {
  const { error } = updateApplicationStatusSchema.validate({ status });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const application = await prisma.projectApplication.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      project: {
        select: { authorId: true, title: true },
      },
      user: {
        select: { email: true, firstName: true },
      },
    },
  });
  if (!application) {
    throw new Error("Application not found");
  }
  if (application.project.authorId != authorId) {
    throw new Error("Unauthorized to update application status");
  }
  await prisma.projectApplication.update({
    where: {
      id: applicationId,
    },
    data: {
      status,
    },
  });
  sendProjectUpdateEmail(
    application.user.email,
    application.user.firstName,
    application.project.title,
    status,
  );
  return { message: "Application status updated successfully" };
};
