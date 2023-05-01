const {
  fileUploadService,
  getFileSignedUrlService,
  fileUploadUsingStreamService,
  downloadFileService,
} = require("../services/file-upload.service");

const fileUploadController = async (req, res) => {
  const response = await fileUploadService(req.file);
  return res.status(response.status).send(response);
};

const getFileSignedUrlController = async (req, res) => {
  const response = await getFileSignedUrlService(req.query);
  return res.status(response.status).send(response);
};

const fileUploadUsingStreamController = async (req, res) => {
  const response = await fileUploadUsingStreamService(req.file);
  return res.status(response.status).send(response);
};

const downloadFileController = async (req, res) => {
  return await downloadFileService(res);
};
module.exports = {
  fileUploadController,
  getFileSignedUrlController,
  fileUploadUsingStreamController,
  downloadFileController,
};
