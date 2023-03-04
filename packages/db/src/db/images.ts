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
  console.error(data);
  const imageData = await getDb(uuid).localImageData.put({ key, ...data });
  return imageData;
};
