import { FilePlay } from 'lucide-react';
import { useBoolean } from 'usehooks-ts';
import UploadReelDialog from './UploadReelDialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CardWithPlusIcon } from '@/components/ui/custom-cards';
import { useContentEditor } from '@/context/ContentEditorContext';

export default function ReelsOverview() {
    const {
        value: isUploadReelDialogOpen,
        setTrue: openUploadReelDialog,
        setValue: setUploadReelDialogOpen,
    } = useBoolean(false);
    const { course } = useContentEditor();

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-x-4'>
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
                    <CardWithPlusIcon title="Add New Reel" onClick={openUploadReelDialog} />
                    {/* reels go here */}
                </CardContent>
            </Card >
            <UploadReelDialog isOpen={isUploadReelDialogOpen} setDialogOpen={setUploadReelDialogOpen} course={course} />
        </div>
    )
}