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
    this.shareName = '';
    this.dirB2bName = '';
    this.dirB2cName = '';
    this.dirName = (isBusiness) ? this.dirB2bName : this.dirB2cName;
  }

  private __createServiceClient() {
    const credential = new StorageSharedKeyCredential(account, accountKey);
    return new ShareServiceClient(
      // When using AnonymousCredential, following url should include a valid SAS
      `https://${account}.file.core.windows.net`,
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
}
