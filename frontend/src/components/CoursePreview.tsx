interface CoursePreviewProps {
    title: string;
    instructor: string;
    rating: number;
}

export default function CoursePreview({title, instructor, rating}: CoursePreviewProps) {
    return (
        <div>
            <div className="lg:h-[300px] h-[100px] bg-slate-200">
            {/* image goes here */}
            </div>
            <div className="py-2">
                <h2>{title}</h2>
                <p className="subtitle">{instructor}</p>
                <p className="py-1">Rating: {rating}/5</p>
            </div>
        </div>
    );
}