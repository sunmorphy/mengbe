import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  tags?: string[] | null;
  isPrivateFile?: boolean | null;
  customCoordinates?: string | null;
}

export const uploadToImageKit = async (file: Buffer, fileName: string, username: string, subFolder?: string): Promise<ImageKitUploadResult> => {
  try {
    const folderPath = subFolder ? `${username}/${subFolder}` : username;
    const result = await imagekit.upload({
      file,
      fileName,
      folder: folderPath,
    });
    return {
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      height: result.height,
      width: result.width,
      size: result.size,
      filePath: result.filePath,
      tags: result.tags,
      isPrivateFile: result.isPrivateFile,
      customCoordinates: result.customCoordinates,
    };
  } catch (error) {
    throw new Error(`ImageKit upload failed: ${error}`);
  }
};

export const uploadProfileImageToImageKit = async (file: Buffer, fileName: string, username: string): Promise<ImageKitUploadResult> => {
  try {
    const result = await imagekit.upload({
      file,
      fileName,
      folder: username,
    });
    return {
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      height: result.height,
      width: result.width,
      size: result.size,
      filePath: result.filePath,
      tags: result.tags,
      isPrivateFile: result.isPrivateFile,
      customCoordinates: result.customCoordinates,
    };
  } catch (error) {
    throw new Error(`Profile image upload failed: ${error}`);
  }
};