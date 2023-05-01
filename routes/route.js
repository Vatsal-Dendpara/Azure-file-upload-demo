const express = require("express");
const {
  fileUploadController,
  getFileSignedUrlController,
  fileUploadUsingStreamController,
  downloadFileController,
} = require("../controllers/file-upload.controller");
const router = new express.Router();
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const upload = multer({ storage: inMemoryStorage });

router.post("/upload", upload.single("file"), fileUploadController);
router.get("/getFile", getFileSignedUrlController);
router.post(
  "/upload-file",
  upload.single("file"),
  fileUploadUsingStreamController
);
router.get("/download", downloadFileController);

module.exports = router;
