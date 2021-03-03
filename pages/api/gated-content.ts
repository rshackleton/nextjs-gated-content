import dns from 'dns';
import { NextApiRequest, NextApiResponse } from 'next';
import { getGatedContentItem } from '../../lib/getGatedContentItem';

export default async function exit(req: NextApiRequest, res: NextApiResponse) {
  // Handle potential Googlebot request.
  const isGoogleAgent = req.headers?.['user-agent']?.toLowerCase()?.includes('googlebot') ?? false;

  if (isGoogleAgent) {
    let verified = false;

    try {
      // Verify Googlebot via reverse DNS lookup.
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string | undefined;
      verified = await verifyGooglebot(ip);
    } catch (error) {
      return res.status(400).send({ message: 'Attempted Googlebot spoof.' });
    }

    if (!verified) {
      return res.status(400).send({ message: 'Attempted Googlebot spoof.' });
    }

    return await respondWithContent(req, res);
  }

  // Otherwise validate input data.
  const animal = req.body.animal;

  if (!animal) {
    return res.status(400).send({ message: 'Invalid animal data.' });
  }

  // Fetch content for gated article.
  return await respondWithContent(req, res);
}

/**
 * Retrieve and respond with content.
 * @param req
 * @param res
 */
async function respondWithContent(req: NextApiRequest, res: NextApiResponse) {
  const contentItem = await getGatedContentItem(false);

  if (!contentItem) {
    return res.status(404).send({ message: 'Could not retrieve article data.' });
  }

  return res.status(200).send({
    gatedContent: contentItem.gated_content.value ?? '',
  });
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

  console.log('[Debug] ip', ip);

  return new Promise<boolean>((resolve, reject) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        console.log('[Debug] Failed to resolve ip');
        return reject(err);
      }

      console.log('[Debug] hostnames', hostnames);

      if (!hostnames?.length) {
        return resolve(false);
      }

      const tld = hostnames[0]?.split('.')?.slice(-2, -1)?.[0];

      console.log('[Debug] tld', tld);

      if (tld === 'google' || tld === 'googlebot') {
        return resolve(true);
      }

      return resolve(false);
    });
  });
}
