import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Input } from "./input"

type SearchBarProps = {
  placeholder: string;
  onSearch?: (query: string) => void;
};

export default function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        className="pl-8 placeholder:text-slate-400"
        onChange={(e) => onSearch?.(e.target.value)}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="size-4 inline-block text-slate-400" />
      </div>
    </div>
  );
}