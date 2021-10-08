import express, { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import AzureFileShare from "./azure-file-share";
//
const app = express();

app.use(express.json());

app.use(fileUpload({
  limits: {
    filesize: (25 * 1024 * 1024)
  },
  responseOnLimit: 'File size limit has been reached!',
  debug: false
}));

app.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
  console.log(`Request object.......`);
  console.log(req.body);
  console.log((req as any).files);

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const sampleFile: any = (req as any).files.foo;
  const uploadPath: string = __dirname + '/files/' + sampleFile.name;
  const max_size = (25 * 1024 * 1024);
  const allowedMimeTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/pdf'];

  try {
    if (!allowedMimeTypes.includes(sampleFile.mimetype)) {
      return res.status(422).json({ msg: 'Only docx and pdf files are allowed' });
    }

    if (sampleFile.size > max_size) {
      return res.status(422).json({ msg: 'The file size should be not more than 25MB' });
    }
    // const result = await sampleFile.mv(uploadPath);
    // console.log(result);
    const azureFileShare = new AzureFileShare(true);
    const companyDirExist = await azureFileShare.checkDirectotyExist('test-amazon');

    if (!companyDirExist) {
      console.log(`Company directory does not exist`);
      const companyDirCreated = await azureFileShare.createDirctory('test-amazon');
      if (!companyDirCreated) {
        console.log(`Company directory could not be created`);
        throw new Error('Company directory could not be created');
      }
    }

    // Upload the file in Azure File Share
    // const fileUploaded = await azureFileShare.uploadFile(sampleFile, 'test-amazon');
    // if (!fileUploaded) {
    //   console.log(`File could not be uploaded`);
    //   throw new Error('File could not be uploaded');
    // }
    await azureFileShare.listAllDirsAndFiles('test-amazon1');

    const fileExist = await azureFileShare.checkFileExist('test-amazon', 'certificate-ak.pdf');
    const fileDownload = await azureFileShare.downloadFile('test-amazon', 'certificate-ak.pdf', uploadPath);
    // return res.json({ error: null, msg: 'file uploaded' });
    const uploadedFileName = ``
    // res.set("Content-Disposition", `attachment;filename=${uploadPath}`);
    res.download(uploadPath, (error) => {
      if (error) {
        throw error;
      }
      fs.unlink(uploadPath, (err) => {
        if (err) {
          console.log(`Error deleting the local file after download`);
          console.error(err);
        }
        console.log(`File removed ${uploadPath}`);
      });
    });
  } catch (e) {
    console.log(e);
    return res.json({ error: e, msg: '' });
  }
});

app.listen(5001, () => console.log(`Server started on port 5001`));
