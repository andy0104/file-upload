import express, { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';

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
    const result = await sampleFile.mv(uploadPath);
    console.log(result);
    return res.json(result);
  } catch (e) {
    console.log(e);
    return res.json(e);
  }
});

app.listen(5001, () => console.log(`Server started on port 5001`));
