import { ShareServiceClient, StorageSharedKeyCredential } from '@azure/storage-file-share';

class AzureFileShare {
  private accountName: string;
  private accountKey: string;
  private serviceClient: any;
  private shareName: string;
  private dirName: string;
  private dirB2bName: string;
  private dirB2cName: string;

  constructor(isBusiness: boolean = true) {
    this.accountName = '';
    this.accountKey = '';
    this.shareName = 'tapup';
    this.dirB2bName = 'B2B';
    this.dirB2cName = 'B2C';
    this.dirName = (isBusiness) ? this.dirB2bName : this.dirB2cName;
  }

  private __createServiceClient() {
    try {
      const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      return new ShareServiceClient(
        // When using AnonymousCredential, following url should include a valid SAS
        `https://${this.accountName}.file.core.windows.net`,
        credential
      );
    } catch (e) {
      throw e;
    }
  }

  private async __createShareClient(serviceClient: ShareServiceClient) {
    try {
      return serviceClient
        .getShareClient(this.shareName)
        .getDirectoryClient(this.dirName);
    } catch (e) {
      throw e;
    }
  }

  public async listAllDirsAndFiles(companyDirName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName);

      let dirIter = subDir.listFilesAndDirectories();
      let i = 1;
      for await (const item of dirIter) {
        if (item.kind === "directory") {
          console.log(`${i} - directory\t: ${item.name}`);
        } else {
          console.log(`${i} - file\t: ${item.name}`);

        }
        i++;
      }
    } catch (e) {
      console.error(`Error checking company directory listing...`);
      console.log(e);
      throw e;
    }
  }

  public async checkDirectotyExist(companyDirName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName);
      const exist = await subDir.exists();
      console.log(exist);
      return exist;
    } catch (e) {
      console.error(`Error checking company directory exist....`);
      console.log(e);
      throw e;
    }
  }

  public async createDirctory(companyDirName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName);
      const createDir = await subDir.create();
      console.log('Directory created');
      console.log(createDir);
      return true;
    } catch (e) {
      console.error(`Error creating company directory....`);
      console.log(e);
      throw e;
    }
  }

  public async uploadFile(fileObject: any, companyDirName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName);
      const fileClient = subDir.getFileClient(fileObject.name);
      const fileCreate = await fileClient.create(fileObject.size);
      console.log(`File created ${fileObject.name} successfully`);
      console.log(fileCreate);

      // Upload the file range
      // const fileUpload = await fileClient.uploadRange(fileObject.data, 0, fileObject.size);
      const fileUpload = await fileClient.uploadData(fileObject.data);
      console.log(`Uploaded file range...`);
      console.log(fileUpload);

      return true;
    } catch (e) {
      console.error(`Error uploading file...`);
      console.log(e);
      throw e;
    }
  }

  public async checkFileExist(companyDirName: string, fileName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const fileExist = await directoryClient.getDirectoryClient(companyDirName).getFileClient(fileName).exists();
      console.log(`File exist: ${fileExist}`);
      return fileExist;
    } catch (e) {
      console.error(`Error downloading file...`);
      console.log(e);
      throw e;
    }
  }

  public async downloadFile(companyDirName: string, fileName: string, uploadPath: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName).getFileClient(fileName);
      const downloadResponse = await subDir.downloadToFile(uploadPath);
      console.log(`Downloading file...`);
      console.log(downloadResponse);
    } catch (e) {
      console.error(`Error downloading file...`);
      console.log(e);
      throw e;
    }
  }
}

export default AzureFileShare;
