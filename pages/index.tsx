import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';

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

  // @todo: State management.

  useEffect(() => {
    doAsync();

    async function doAsync() {
      if (router.isFallback) {
        return;
      }

      if (!contentItem) {
        return;
      }

      // @todo: Add check for Google user agent.
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
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
      </Head>
      <main className="container py-8 px-4 mx-auto">
        <div className="prose mx-auto lg:prose-xl">
          <h1>{contentItem.title}</h1>
          {/* @todo: Loading content. */}
          {/* @todo: Lead content. */}
          {/* @todo: Gated content. */}
          <small>Last Modified: {formatDate(contentItem.date)}</small>
        </div>
      </main>
    </div>
  );

  async function fetchContent(formData: { animal?: string }): Promise<string | null> {
    // @todo: Fetch content implementation.
    return Promise.resolve(null);
  }
};

export default Index;

export const getStaticProps: GetStaticProps<IndexProps> = async ({ preview = false }) => {
  // @todo: Fetch content and return props.
  return {
    props: {
      contentItem: {
        date: new Date().toISOString(),
        freeContent: 'freeContent',
        gatedContent: 'gatedContent',
        title: 'Gated Content in Jamstack 🤯',
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
  // @todo: Structured data.
  return {};
}
