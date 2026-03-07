import { fetchClient } from './fetch-client';

export async function uploadJson(
  json: unknown,
  presignedUrl: string,
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: JSON.stringify(json),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload JSON: ${response.statusText}`);
  }
}

export async function uploadCourseContent(
  courseContent: any,
  courseId: string,
  description: string,
) {
  const { data } = await fetchClient.GET(
    '/api/content-versions/{courseId}/upload-url',
    {
      params: {
        path: {
          courseId,
        },
        query: {
          description,
        },
      },
    },
  );

  if (!data || !data.url) {
    throw new Error('Failed to get upload URL');
  }

  return await uploadJson(courseContent, data.url);
}
