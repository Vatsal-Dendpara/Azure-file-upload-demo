require("dotenv").config();
const {
  BlockBlobClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  BlobServiceClient,
} = require("@azure/storage-blob");
const { Readable } = require("stream");
const archiver = require("archiver");

//configs
const connectionString = process.env.AZURE_STORAGE_CONNECTIONSTRING || "",
  containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

//upload a file using base64 encoding to the Azure Storage
const uploadFileToAzure = async (params) => {
  try {
    const blockBlobClient = new BlockBlobClient(
      connectionString,
      containerName,
      params.fileName
    );
    const buffer = Buffer.from(params.buffer, "base64");
    const response = await blockBlobClient.upload(buffer, params.buffer.length);
    if (!response) {
      return new Error("Something went wrong when uploading");
    }
    return {
      status: 200,
      message: "Uploaded file",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Something went wrong",
    };
  }
};

//get a sign url of the file from Azure Storage
const getFileSignedUrlFromAzure = async (fileName) => {
  try {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    if ((await blockBlobClient.exists()) == false) {
      return {
        status: 200,
        message: "file does not found",
      };
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT,
      process.env.AZURE_STORAGE_KEY
    );
    const blobSAS = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 84600),
      },
      sharedKeyCredential
    ).toString();
    const url = blockBlobClient.url + "?" + blobSAS;
    return {
      status: 200,
      data: url,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Something went wrong",
    };
  }
};

// uploada a file to Azure Storage using stream
const uploadFileUsingStream = async (params) => {
  try {
    const blockBlobClient = new BlockBlobClient(
      connectionString,
      containerName,
      params.fileName
    );
    const stream = bufferToStream(params.buffer);
    const res = await blockBlobClient.uploadStream(
      stream,
      params.buffer.length
    );
    if (!res) {
      return new Error("Something went wrong when uploading");
    }
    return {
      status: 200,
      message: "Uploaded file",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Something went wrong",
    };
  }
};

// ! check this endpoint in browser
//downloads file from the azure and make a zip and stream it to a client
const downloadFileUsingStream = async (res) => {
  try {
    // list of file name to download as zip
    const files = ["Artboard 6.png", "ameer-basheer-gV6taBJuBTk-unsplash.jpg"];
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create a new archiver instance and set the output to be streamed
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      throw err;
    });
    // Add each file to the archive by getting buffer from Azure
    for (const file of files) {
      const blockBlobClient = containerClient.getBlockBlobClient(file);

      const blobContents = await blockBlobClient.downloadToBuffer();
      //   Add the blob contents to the zip file with the blob name as the filename
      archive.append(blobContents, { name: file });
    }

    // Set the content-disposition header to force download of the ZIP file
    const headers = {
      "Content-Disposition": `attachment; filename="Files_${new Date().getSeconds()}.zip"`,
    };
    // Pipe the ZIP file to the HTTP response object
    archive.pipe(res.set(headers));
    // When the archive is finalized, end the response
    archive.on("finish", () => {
      console.log(`ZIP file created and streamed`);
      res.end();
    });

    // Generate the ZIP file and start streaming it to the HTTP response object
    archive.finalize();
    return {
      status: 200,
      message: "file",
    };
  } catch (error) {
    console.log(error);
    return {
      status: 400,
      message: "Something went wrong",
    };
  }
};

//converts buffer to stream
function bufferToStream(binary) {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
}
module.exports = {
  getFileSignedUrlFromAzure,
  uploadFileToAzure,
  downloadFileUsingStream,
  uploadFileUsingStream,
};
