import dns from 'dns';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function exit(req: NextApiRequest, res: NextApiResponse) {
  // @todo: Validate Google Bot request.
  // @todo: Validate input data.
}

/**
 * Retrieve and respond with content.
 * @param req
 * @param res
 */
async function respondWithContent(req: NextApiRequest, res: NextApiResponse) {
  // @todo: Response.
  return res.status(200).send({ gatedContent: '' });
}

/**
 * Verify IP address as a Googlebot.
 * @param ip The IPv4 or IPv6 address to be verified.
 * @see https://support.google.com/webmasters/answer/80553?hl=en
 * @see https://github.com/jcowley/googlebot-verify/blob/master/index.js
 */
async function verifyGooglebot(ip: string | undefined): Promise<boolean> {
  if (!ip) {
    return false;
  }

  // @todo: Reverse DNS lookup.

  return true;
}
