interface CoursePreviewProps {
    title: string;
    instructor: string;
}

export default function CoursePreview({title, instructor}: CoursePreviewProps) {
    return (
        <div>
            <div className="lg:h-[300px] h-[100px] bg-slate-200">
            {/* image goes here */}
            </div>
            <div className="py-2">
                <h2>{title}</h2>
                <p className="subtitle">{instructor}</p>
            </div>
        </div>
    );
}