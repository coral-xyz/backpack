import mailchimp from '@mailchimp/mailchimp_marketing';
import type { NextApiRequest, NextApiResponse } from 'next';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

const listID = process.env.MAILCHIMP_LISTID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.NEXT_PUBLIC_MY_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const email = req.query.email;

  try {
    const response = await mailchimp.lists.addListMember(listID, {
      email_address: email,
      status: 'pending'
    });

    return res.end();
  } catch (err) {
    console.error('Error subscribing:', err);
    return res.status(500).send('Error subscribing email');
  }
}
