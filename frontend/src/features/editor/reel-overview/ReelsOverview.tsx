import { useState } from 'react';
import { FilePlay, Plus, XCircleIcon } from 'lucide-react';
import { useBoolean } from 'usehooks-ts';
import UploadReelDialog from './UploadReelDialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';
import { Button } from '@/components/ui/button';
import { deleteReel } from '@/lib/file-upload';

function VideoPreview({ reelUrl }: { reelUrl?: string }) {
    const { course, deleteReelUrl } = useContentEditor();
    const [hasError, setHasError] = useState(false);

    return (
        <div>
            {!hasError ? (
                <div className='relative'>
                    <video height="480" className='max-h-screen max-w-full' muted autoPlay loop>
                        <source
                            src={`${reelUrl}?t=${new Date()}`}
                            type="video/mp4"
                            onError={() => {
                                setHasError(true);
                            }}
                        />
                    </video>
                    <button className='cursor-pointer' onClick={() => {
                        deleteReel(course.id);
                        deleteReelUrl();
                    }}>
                        <XCircleIcon className='absolute right-0 top-0 m-2 z-10 rounded-full size-10 text-white bg-slate-700 hover:bg-rose-600 hover:shadow-lg transition' />
                    </button>
                </div>
                ) : <PreviewError />} 
        </div>
    )
}

function PreviewError() {
    const {
        value: isUploadReelDialogOpen,
        setTrue: openUploadReelDialog,
        setValue: setUploadReelDialogOpen,
    } = useBoolean(false);
    const { course, deleteReelUrl } = useContentEditor();

    return (
        <div className='flex flex-col items-center gap-y-2'>
            <div className="text-slate-500 italic">
                Reel preview could not be shown. Please check your connection.
            </div>

            <div className='flex gap-x-2'>
                <Button onClick={() => {
                    deleteReel(course.id);
                    deleteReelUrl();
                }}>
                    <XCircleIcon />
                    Delete Reel
                </Button>

                <Button onClick={openUploadReelDialog}>
                    <Plus />
                    Upload New Reel
                </Button>
            </div>

            <UploadReelDialog
                isOpen={isUploadReelDialogOpen}
                setDialogOpen={setUploadReelDialogOpen}
                course={course}
            />
        </div>
    )
}

export default function ReelsOverview() {
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

                <CardContent className='flex justify-center'>
                    <VideoPreview reelUrl={course.reelUrl} />
                </CardContent>
            </Card>
        </div>
    );
}
