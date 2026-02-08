import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Input } from "./input"

export default function SearchBar({ placeholder }: { placeholder: string }) {
    return (
        <div className="relative">
            <Input placeholder={placeholder} className="pl-8 placeholder:text-slate-400" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon height="1em" className="inline-block text-slate-400" />
            </div>
        </div>
    )
}