import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';
import { FilePlay } from 'lucide-react';
import { useBoolean } from 'usehooks-ts';
import UploadReelDialog from './UploadReelDialog';

export default function ReelsOverview() {
  const {
    value: isUploadReelDialogOpen,
    setTrue: openUploadReelDialog,
    setValue: setUploadReelDialogOpen,
  } = useBoolean(false);
  const { course } = useContentEditor();

  return (
    <div>
      <Card className='h-full'>
        <CardHeader>
          <div className="flex items-center gap-x-4">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <FilePlay className="text-primary size-6" />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <CardTitle className="text-2xl">Reels</CardTitle>
                <CardDescription className="text-base">
                  Reach out to more users by creating reels
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <video width="320" height="240" muted autoPlay loop>
            <source
              src={`${course.reelUrl}?t=${new Date()}`}
              type="video/mp4"
            />
          </video>
        </CardContent>
      </Card>
      <UploadReelDialog
        isOpen={isUploadReelDialogOpen}
        setDialogOpen={setUploadReelDialogOpen}
        course={course}
      />
    </div>
  );
}
