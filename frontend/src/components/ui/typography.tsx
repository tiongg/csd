import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const headingBase = "font-bold text-sky-950 w-fit font-[Noto_Sans]";

export function Heading1({ className, ...rest }: ComponentProps<"h1">) {
    return <h1 className={cn("text-3xl bg-linear-[var(--color-sky-200),var(--color-sky-200),0_90%/100%_10px_no-repeat]", headingBase, className)}{...rest} />;
}

export function Heading2({ className, ...rest }: ComponentProps<"h2">) {
    return <h2 className={cn("text-2xl", headingBase, className)}{...rest} />;
}

export function Heading3({ className, ...rest }: ComponentProps<"h3">) {
    return <h3 className={cn("text-xl", headingBase, className)}{...rest} />;
}

export function Heading4({ className, ...rest }: ComponentProps<"h4">) {
    return <h4 className={cn("text-lg", headingBase, className)}{...rest} />;
}

export function Paragraph({ className, ...rest }: ComponentProps<"p">) {
    return <p className={cn("text-sky-900", className)}{...rest} />;
}