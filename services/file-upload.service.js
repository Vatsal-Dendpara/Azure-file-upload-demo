const {
  uploadFileToAzure,
  getFileSignedUrlFromAzure,
  uploadFileUsingStream,
  downloadFileUsingStream,
} = require("../utils/file-upload");

const fileUploadService = async (params) => {
  const fileObj = {
    fileName: params.originalname,
    buffer: params.buffer,
  };
  return await uploadFileToAzure(fileObj);
};

const getFileSignedUrlService = async (params) => {
  return await getFileSignedUrlFromAzure(params.fileName);
};

const fileUploadUsingStreamService = async (params) => {
  const fileObj = {
    fileName: params.originalname,
    buffer: params.buffer,
  };
  return await uploadFileUsingStream(fileObj);
};

const downloadFileService = async (res) => {
  return await downloadFileUsingStream(res);
};

module.exports = {
  fileUploadService,
  getFileSignedUrlService,
  fileUploadUsingStreamService,
  downloadFileService,
};
