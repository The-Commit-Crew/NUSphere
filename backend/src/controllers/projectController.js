import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  applyToProjectService,
  getProjectApplicationsService,
  updateApplicationStatusService,
  getAllSkillsService,
  searchProjectsService,
} from "../services/projectService.js";

export const createProject = async (req, res) => {
  try {
    const result = await createProjectService(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const result = await getAllProjectsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const result = await getProjectByIdService(projectId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const result = await updateProjectService(
      projectId,
      req.user.userId,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const applyToProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const result = await applyToProjectService(
      projectId,
      req.user.userId,
      req.body,
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjectApplications = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const result = await getProjectApplicationsService(
      projectId,
      req.user.userId,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.appId);
    const result = await updateApplicationStatusService(
      applicationId,
      req.user.userId,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSkills = async (req, res) => {
  try {
    const result = await getAllSkillsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const result = await searchProjectsService(req.query, req.user?.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
