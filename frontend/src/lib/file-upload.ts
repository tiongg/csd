import type { SectionType } from './content.type';
import { fetchClient } from './fetch-client';

export async function uploadFile(file: File, courseId: string) {
  const { data: presignedUrlData } = await fetchClient.GET(
    '/api/contributor/{courseId}/image-upload-url',
    {
      params: {
        path: {
          courseId,
        },
        query: {
          extension: file.name.split('.').pop() || '',
        },
      },
    },
  );

  if (!presignedUrlData) {
    throw new Error('Failed to get presigned URL');
  }
  const { url: presignedUrl, publicUrl } = presignedUrlData;

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  return publicUrl;
}

export async function uploadProfilePicture(file: File) {
  const { data: presignedUrlData } = await fetchClient.GET(
    '/api/account/profile-picture-upload-url',
    {
      params: {
        query: {
          extension: file.name.split('.').pop() || '',
        },
      },
    },
  );

  if (!presignedUrlData || !presignedUrlData.url || !presignedUrlData.publicUrl) {
    throw new Error('Failed to get presigned URL');
  }

  const { url: presignedUrl, publicUrl } = presignedUrlData;

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  return publicUrl;
}

export async function uploadJson(json: unknown, presignedUrl: string) {
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

export async function uploadVideoFile(
  videoFile: File,
  presignedUrl: string,
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: videoFile,
    headers: {
      'Content-Type': 'video/mp4, video/webm',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }
}

export async function uploadCourseContent(
  courseContent: SectionType[],
  courseId: string,
  description: string,
) {
  const { data } = await fetchClient.POST(
    '/api/content-versions/{courseId}/upload-url',
    {
      params: {
        path: {
          courseId,
        },
      },
      body: {
        description,
      },
    },
  );

  if (!data || !data.url) {
    throw new Error('Failed to get upload URL');
  }

  return await uploadJson(courseContent, data.url);
}

export async function uploadCourseImage(imageFile: File, courseId: string) {
  const { data } = await fetchClient.GET(
    '/api/courses/{courseId}/image-upload-url',
    {
      params: {
        path: {
          courseId,
        },
        query: {
          extension: imageFile.name.split('.').pop() || '',
        },
      },
    },
  );

  if (!data || !data.url) {
    throw new Error('Failed to get upload URL');
  }

  const { url: presignedUrl, publicUrl } = data;

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: imageFile,
    headers: {
      'Content-Type': imageFile.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  return publicUrl;
}

export async function deleteCourseImage(courseId: string) {
  await fetchClient.DELETE(
    '/api/courses/{courseId}/image',
    {
      params: {
        path: {
          courseId,
        },
      },
    },
  );
}