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
import NoReelsYet from './NoReelsYet';

type VideoPreviewProps = {
    setError: (hasError: boolean) => void;
    reelUrl?: string;
}

function VideoPreview({ reelUrl, setError }: VideoPreviewProps) {
    const { course, deleteReelUrl } = useContentEditor();
    return (
        <div>
            <div className='relative'>
                <video height="480" className='max-h-screen max-w-full' muted autoPlay loop>
                    <source
                        src={`${reelUrl}?t=${new Date()}`}
                        type="video/mp4"
                        onError={() => {
                            setError(true);
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
        </div>
    )
}

export default function ReelsOverview() {
    const { course } = useContentEditor();
    const [hasError, setError] = useState(false);

    return (
        <div>
            {
                !hasError ? (
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
                            <VideoPreview reelUrl={course.reelUrl} setError={setError} />
                        </CardContent>
                    </Card>
                ) : <NoReelsYet/>
            }
        </div>
    );
}
