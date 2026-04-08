import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      offset={{ top: 80, right: 16 }}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-[18px] text-sky-700" />,
        info: <InfoIcon className="size-[18px] text-sky-700" />,
        warning: <TriangleAlertIcon className="size-[18px] text-sky-700" />,
        error: <OctagonXIcon className="size-[18px] text-sky-700" />,
        loading: <Loader2Icon className="size-[18px] animate-spin text-sky-700" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast w-[min(320px,calc(100vw-2rem))] rounded-xl border border-white/35 bg-white/18 px-2 py-2 text-sky-950 shadow-[0_16px_40px_-26px_rgba(2,32,71,0.35)] backdrop-blur-3xl",
          title: "text-[13px] font-semibold leading-4.5 text-sky-950",
          description: "text-[11px] leading-4 text-sky-900/90",
          icon: "text-sky-900",
          actionButton:
            "rounded-md bg-sky-600 px-2 py-1 text-[11px] text-white hover:bg-sky-700",
          cancelButton:
            "rounded-md border border-white/40 bg-white/20 px-2 py-1 text-[11px] text-sky-900 hover:bg-white/30",
          success: "border-white/35 bg-white/18 text-sky-950",
          info: "border-white/35 bg-white/18 text-sky-950",
          warning: "border-white/35 bg-white/18 text-sky-950",
          error: "border-white/35 bg-white/18 text-sky-950",
          loading: "border-white/35 bg-white/18 text-sky-950",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.18)",
          "--normal-text": "rgb(8, 47, 73)",
          "--normal-border": "rgba(255, 255, 255, 0.35)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
