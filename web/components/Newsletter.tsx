import { memo, useState } from 'react';
import { CheckIcon } from '@heroicons/react/outline';

import { subscribe } from '../lib/mailchimp';

function Newsletter() {
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  async function subscribeEmail(e) {
    e.preventDefault();

    // TODO: improve error handling
    try {
      await subscribe(email);
      setEmail('');
      setSubscribed(true);
    } catch {
      // Pass
    }
  }

  return (
    <div>
      <div className="mx-auto py-12">
        <div
          className="rounded-lg bg-teal-600 px-6 py-6 md:py-12 md:px-12 lg:py-16
           lg:px-16 xl:flex xl:items-center"
        >
          <div className="xl:w-0 xl:flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-3xl">
              Want Backpack news and updates?
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-teal-200">
              Sign up for our Substack to stay up to date.
            </p>
          </div>
          <div className="mt-8 sm:w-full sm:max-w-md xl:mt-0 xl:ml-8">
            <form className="sm:flex" onSubmit={subscribeEmail}>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="block w-full rounded-md border-0 px-4 py-3
                            text-base text-gray-900 placeholder-gray-500"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="mt-3 flex w-32 items-center
                  justify-center rounded-md border border-teal-500
                   bg-teal-500 text-base font-medium text-teal-50
                    shadow hover:bg-teal-400 sm:mt-0 sm:ml-3"
              >
                {subscribed ? <CheckIcon className="h-8 w-8" /> : 'Notify me'}
              </button>
            </form>
            <p className="mt-3 text-sm text-teal-200">
              {subscribed
                ? 'You’ll be the first to know when Backpack is ready.'
                : 'We hate spam as much as you do.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Newsletter);
