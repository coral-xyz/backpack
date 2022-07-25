import fetch from 'isomorphic-unfetch';

/**
 * Subscribe to Mailchimp list
 * @param email
 */
export async function subscribe(email: string) {
  await fetch(`/api/email?secret=${process.env.NEXT_PUBLIC_MY_SECRET_TOKEN}&email=${email}`);
}
