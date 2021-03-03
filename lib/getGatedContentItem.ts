import { ContentItem, DeliveryClient } from '@kentico/kontent-delivery';

export async function getGatedContentItem(preview: boolean = false): Promise<ContentItem> {
  const client = new DeliveryClient({
    previewApiKey: preview ? process.env.KONTENT_PREVIEW_KEY : undefined,
    projectId: process.env.KONTENT_PROJECT_ID,
  });

  const response = await client.items().type('gated_content').toPromise();
  return response.firstItem;
}
