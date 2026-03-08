import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type UploadReelDialogProps = {
    isOpen: boolean;
    setDialogOpen: (isOpen: boolean) => void;
};

const fileSizeLimit = 5 * 1024 * 1024;

const reelSchema = z.object({
    title: z.string().min(3, "Reel name must be at least 3 characters").max(50, "Reel name must not exceed 50 characters"),
    reelFile: z.instanceof(File)
        .refine(
            (file) =>
                [
                    "video/mp4",
                    "video/webm"
                ].includes(file.type),
            { message: "Invalid file type. Please upload an .mp4 or .mkv file." }
        )
        .refine(
            (file) => file.size <= fileSizeLimit, { message: "File size should not exceed 5MB" }
        )
});

type ReelFormValues = z.infer<typeof reelSchema>;

export default function UploadReelDialog({
    isOpen,
    setDialogOpen
}: UploadReelDialogProps) {
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        control
    } = useForm<ReelFormValues>({
        resolver: zodResolver(reelSchema),
        defaultValues: {
            title: '',
            reelFile: new File([], "")
        },
    });

    async function onSubmit(data: ReelFormValues) {
        try {
            await console.log(data);
        } catch (error) {
            setError("root", {
                type: "custom",
                message: "Failed to upload reel"
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-xl'>Upload New Reel</DialogTitle>
                    <DialogDescription>
                        Reach out to more users by creating reels
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
                    <FieldGroup>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="title">Reel Title</FieldLabel>
                                    <Input
                                        {...field}
                                        id="title"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="e.g., How to Say Six Seven"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Controller
                            control={control}
                            name="reelFile"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="reelFile">Reel File (.mp4 or .webm only)</FieldLabel>
                                    <Input
                                        id="reelFile"
                                        aria-invalid={fieldState.invalid}
                                        type="file"
                                        accept="video/mp4, video/webm"
                                        onChange={(e) =>
                                            field.onChange(e.target.files ? e.target.files[0] : null)}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {errors.root && (
                        <div className="text-destructive text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading...' : 'Upload Reel'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}