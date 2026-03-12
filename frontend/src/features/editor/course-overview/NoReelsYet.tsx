import { FilePlay, Plus } from 'lucide-react';
import { useBoolean } from 'usehooks-ts';
import UploadReelDialog from './UploadReelDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';

export default function NoReelsYet() {
    const {
        value: isUploadReelDialogOpen,
        setTrue: openUploadReelDialog,
        setValue: setUploadReelDialogOpen,
    } = useBoolean(false);
    const { course } = useContentEditor();

    return (
        <div>
            <Card>
                <CardContent className="flex min-h-75 flex-col items-center justify-between p-8">
                    <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
                        <FilePlay className="text-muted-foreground size-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">No reels yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                        Reach out to more users by creating reels.
                    </p>
                    <Button
                        size="lg"
                        onClick={ openUploadReelDialog }
                    >
                        <Plus className="mr-2 size-5" />
                        Create Reel
                    </Button>
                </CardContent>
            </Card>
            <UploadReelDialog isOpen={ isUploadReelDialogOpen } setDialogOpen={ setUploadReelDialogOpen } course={ course }/>
        </div>
    )
}