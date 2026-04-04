import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContentEditor } from '@/context/ContentEditorContext';
import type { SectionType } from '@/lib/content.type';
import { apiQueryOptions, useApiQuery } from '@/lib/fetch-client';
import { uploadCourseContent } from '@/lib/file-upload';
import type { ContentVersion, Course } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useBoolean } from 'usehooks-ts';

type PublishCourseProps = {
  course: Course;
};

export default function PublishCourse({ course }: PublishCourseProps) {
  const { doc, getDocAsJson } = useContentEditor();
  const queryClient = useQueryClient();
  const {
    value: open,
    setFalse: closeDialog,
    setValue: setOpen,
  } = useBoolean(false);
  const [description, setDescription] = useState('');
  const [baselineSignature, setBaselineSignature] = useState<string | null>(
    null,
  );
  const [isBaselineResolved, setIsBaselineResolved] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);

  const sections = doc.getArray('root');
  const sectionCount = sections.length;
  const hasSections = sectionCount > 0;

  const { data: versions, isLoading: isVersionsLoading } = useApiQuery(
    'get',
    '/api/content-versions/{courseId}',
    {
      params: {
        path: {
          courseId: course.id,
        },
      },
    },
  );

  const latestVersion = useMemo<ContentVersion | undefined>(
    () =>
      versions?.reduce<ContentVersion | undefined>((latest, version) => {
        if (!latest || version.versionNumber > latest.versionNumber) {
          return version;
        }
        return latest;
      }, undefined),
    [versions],
  );

  const latestVersionId = latestVersion?.id;
  const { data: latestVersionReview, isLoading: isLatestVersionLoading } =
    useApiQuery(
      'get',
      '/api/content-versions/review/{contentVersionId}',
      {
        params: {
          path: {
            contentVersionId: latestVersionId ?? '',
          },
        },
      },
      {
        enabled: !!latestVersionId,
      },
    );

  useEffect(() => {
    let isMounted = true;

    async function updateCurrentSignature() {
      const content = await getDocAsJson();
      if (isMounted) {
        setCurrentSignature(JSON.stringify(content));
      }
    }

    void updateCurrentSignature();
    const observeDoc = () => void updateCurrentSignature();
    sections.observeDeep(observeDoc);

    return () => {
      isMounted = false;
      sections.unobserveDeep(observeDoc);
    };
  }, [getDocAsJson, sections]);

  useEffect(() => {
    let isMounted = true;

    async function loadLatestVersionSignature() {
      if (!latestVersionReview?.downloadUrl) {
        setBaselineSignature(null);
        setIsBaselineResolved(true);
        return;
      }

      try {
        const latestContent = (await fetch(
          latestVersionReview.downloadUrl,
        ).then((res) => res.json())) as SectionType[];

        if (isMounted) {
          setBaselineSignature(JSON.stringify(latestContent));
          setIsBaselineResolved(true);
        }
      } catch {
        if (isMounted) {
          setBaselineSignature(null);
          setIsBaselineResolved(true);
        }
      }
    }

    setIsBaselineResolved(!latestVersionId);
    void loadLatestVersionSignature();

    return () => {
      isMounted = false;
    };
  }, [latestVersionId, latestVersionReview?.downloadUrl]);

  const hasChanges = useMemo(() => {
    if (!latestVersionId) {
      return hasSections;
    }

    if (currentSignature === null) {
      return false;
    }

    if (baselineSignature === null) {
      return hasSections;
    }

    return currentSignature !== baselineSignature;
  }, [baselineSignature, currentSignature, hasSections, latestVersionId]);

  const isCheckingChanges =
    isVersionsLoading ||
    (!!latestVersionId && (isLatestVersionLoading || !isBaselineResolved)) ||
    (!latestVersionId && currentSignature === null);

  const { mutateAsync: uploadContent, isPending: isPublishing } = useMutation({
    mutationFn: async (desc: string) => {
      const docContent = await getDocAsJson();
      return uploadCourseContent(docContent, course.id, desc);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        apiQueryOptions('get', '/api/content-versions/{courseId}', {
          params: {
            path: {
              courseId: course.id,
            },
          },
        }),
      );
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    await uploadContent(description.trim());
    closeDialog();
    setDescription('');
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen || !isPublishing) {
      setOpen(newOpen);
      if (!newOpen) {
        setDescription('');
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={!hasChanges || isCheckingChanges}
          className="gap-2 transition duration-300 active:scale-95"
        >
          <Send className="size-4" />
          Submit for Approval
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Submit Course for Approval</DialogTitle>
            <DialogDescription>
              Describe the changes made in this version. This will help
              reviewers understand what has been updated.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="resize-none"
              placeholder="E.g., Updated lesson 3 with new examples and fixed quiz questions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || isPublishing || !hasChanges}
              className="gap-2"
            >
              {isPublishing ? (
                <>Submitting…</>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit for Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
