import { ShareServiceClient, StorageSharedKeyCredential } from '@azure/storage-file-share';

// async function main() {
//   let shareIter = serviceClient.listShares();
//   let i = 1;
//   for await (const share of shareIter) {
//     console.log(`Share${i}: ${share.name}`);
//     i++;
//   }
// }
// async function main() {
//   const dirName = 'test-company';
//   const azureFileShare = new AzureFileShare();
//   await azureFileShare.createDirctory(dirName);
//   await azureFileShare.listAllDirsAndFiles(dirName);
// }

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
    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    return new ShareServiceClient(
      // When using AnonymousCredential, following url should include a valid SAS
      `https://${this.accountName}.file.core.windows.net`,
      credential
    );
  }

  private async __createShareClient(serviceClient: ShareServiceClient) {
    return serviceClient
      .getShareClient(this.shareName)
      .getDirectoryClient(this.dirName);
  }

  public async listAllDirsAndFiles(companyDirName: string) {
    this.serviceClient = this.__createServiceClient();
    const directoryClient = await this.__createShareClient(this.serviceClient);
    const subDir = await directoryClient.getDirectoryClient(companyDirName);
    const exist = await subDir.exists();
    console.log(exist);

    if (exist) {
      console.log('folder exist');
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
    } else {
      console.log('folder does not exist...Create the folder first');
      // await subDir.create();
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
      console.error(`error creating company directory....`);
      console.log(e);
    }
  }

  public async createDirctory(companyDirName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName);
      const exist = await subDir.exists();
      console.log(exist);

      if (!exist) {
        const createDir = await subDir.create();
        console.log('Directory created');
        console.log(createDir);
      } else {
        console.log('Directory already exist');
        console.log(subDir);
      }
    } catch (e) {
      console.error(`error creating company directory....`);
      console.log(e);
    }
  }

  public async uploadFile(fileObject: any, companyDirName: string) {
    try {
      this.serviceClient = this.__createServiceClient();
      const directoryClient = await this.__createShareClient(this.serviceClient);
      const subDir = await directoryClient.getDirectoryClient(companyDirName);
      const exist = await subDir.exists();
      console.log(exist);

      if (exist) {
        const fileClient = subDir.getFileClient(fileObject.name);
        const fileCreate = await fileClient.create(fileObject.size);
        console.log(`File created ${fileObject.name} successfully`);
        console.log(fileCreate);

        // Upload the file range
        const fileUpload = await fileClient.uploadRange(fileObject.data, 0, fileObject.size);
        console.log(`Uploaded file range...`);
        console.log(fileUpload);

      } else {
        console.log('Directory does not exist');
        console.log(subDir);
      }
    } catch (e) {
      console.error(`error company directory does not exist....Create directory first`);
      console.log(e);
    }
  }
}

export default AzureFileShare;
