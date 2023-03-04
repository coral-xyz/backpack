import { getDb } from "./index";

export const getImage = async (uuid: string, key: string) => {
  const imageData = await getDb(uuid).localImageData.get(key);
  return imageData;
};

export const putImage = async (
  uuid: string,
  key,
  data: {
    url: string;
    timestamp: number;
    fullImage: boolean;
  }
) => {
  const imageData = await getDb(uuid).localImageData.put({ key, ...data });
  return imageData;
};

export const bulkGetImages = async (uuid: string) => {
  return getDb(uuid).localImageData.offset(0).keys();
};
