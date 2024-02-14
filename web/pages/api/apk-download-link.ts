import type { NextApiRequest, NextApiResponse } from 'next';

type Res = {
  version: string;
  buildNumber: number;
  url: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response: Promise<Res> = await fetch(
      `https://expo-eas-services.backpack.workers.dev/api/apk-download-link`
    ).then(r => r.json());
    return res.status(200).json(response);
  } catch (err) {
    // Remember to update this every once in awhile
    return res.status(200).json({
      url: 'https://pub-2ee2f082ae5a494585ea53c1e7eca5a8.r2.dev/backpack-apk-1.4.7-42.apk',
      buildNumber: 42,
      version: '1.4.7'
    });
  }
}
