import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { getGatedContentItem } from '../lib/getGatedContentItem';

export type ContentItemModel = {
  date: string;
  freeContent: string;
  gatedContent: string;
  title: string;
};

export type IndexProps = {
  contentItem: ContentItemModel;
  preview: boolean;
};

const Index: React.FC<IndexProps> = ({ contentItem, preview }) => {
  const router = useRouter();

  const [gatedContent, setGatedContent] = useState(contentItem.gatedContent);
  const [animal, setAnimal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    doAsync();

    async function doAsync() {
      if (router.isFallback) {
        return;
      }

      if (!contentItem) {
        return;
      }

      // If we think this is a Google request then fetch content immediately.
      const isGoogle = navigator.userAgent.toLowerCase().includes('googlebot');

      if (isGoogle) {
        setLoading(true);

        const content = await fetchContent({ animal });

        setGatedContent(content);
        setLoading(false);
      }
    }
  }, []);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>{contentItem.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData(contentItem), null, 2) }}
        />
      </Head>
      <main className="container py-8 px-4 mx-auto">
        <div className="prose mx-auto lg:prose-xl">
          <h1>{contentItem.title}</h1>
          {loading && <p>We are loading your content! 👀</p>}
          {!loading && (preview || !gatedContent) && (
            <div className="no-paywall">
              <div className="mb-6" dangerouslySetInnerHTML={{ __html: contentItem.freeContent }} />
              <form
                className="grid grid-cols-2 gap-4 mb-6"
                onSubmit={async (event) => {
                  event.preventDefault();

                  const content = await fetchContent({
                    animal: animal,
                  });

                  setGatedContent(content);
                }}
              >
                <label className="font-bold" htmlFor="favourite-animal">
                  What is your favourite animal?
                </label>
                <input
                  id="favourite-animal"
                  className="rounded"
                  name="favourite-animal"
                  type="text"
                  placeholder="🐶"
                  value={animal}
                  onChange={(event) => setAnimal(event.target.value)}
                />
                <button className="col-start-2 px-6 py-2 rounded place-self-end text-white bg-purple-700" type="submit">
                  Gimme My Content!
                </button>
              </form>
            </div>
          )}
          {!loading && (preview || gatedContent) && (
            <div className="paywall" dangerouslySetInnerHTML={{ __html: gatedContent }} />
          )}
          <small>Last Modified: {formatDate(contentItem.date)}</small>
        </div>
      </main>
    </div>
  );

  async function fetchContent(formData: { animal?: string }): Promise<string | null> {
    const res = await fetch('/api/gated-content', {
      body: JSON.stringify(formData),
      cache: 'no-cache',
      credentials: 'omit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (res.ok) {
      return data.gatedContent as string | null;
    } else {
      console.error(`Error: ${data.message}`);
      return null;
    }
  }
};

export default Index;

export const getStaticProps: GetStaticProps<IndexProps> = async ({ preview = false }) => {
  const contentItem = await getGatedContentItem(preview);

  if (!contentItem) {
    console.log(`Could not find content item.`);

    return {
      notFound: true,
    };
  }

  return {
    props: {
      contentItem: {
        date: contentItem.system.lastModified.toISOString(),
        freeContent: contentItem.free_content.value,
        gatedContent: preview ? contentItem.gated_content.value : '',
        title: contentItem.title.value,
      },
      preview,
    },
    revalidate: true,
  };
};

function formatDate(input: string): string {
  const formatter = Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return formatter.format(new Date(input));
}

function getStructuredData(item: ContentItemModel) {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://${process.env.NEXT_PUBLIC_HOST}`,
    },
    headline: item.title,
    datePublished: item.date,
    dateModified: item.date,
    author: {
      '@type': 'Person',
      name: 'Richard Shackleton',
    },
    isAccessibleForFree: 'False',
    hasPart: {
      '@type': 'WebPageElement',
      isAccessibleForFree: 'False',
      cssSelector: '.paywall',
    },
  };

  return data;
}
