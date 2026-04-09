import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DiscoverBrowseToolbarProps = {
  title?: string;
  searchPlaceholder?: string;
  onSearchQueryChange: (value: string) => void;
  searchQuery?: string;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: string[];
  showMyPreferencesOption: boolean;
};

export function DiscoverBrowseToolbar({
  title = 'Browse',
  searchPlaceholder = 'Search title, description, tags',
  onSearchQueryChange,
  searchQuery,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  showMyPreferencesOption,
}: DiscoverBrowseToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder={searchPlaceholder}
            className="h-9 rounded-lg border-slate-300 bg-white/85"
            onSearch={onSearchQueryChange}
            value={searchQuery}
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="h-9 w-full rounded-lg border-slate-300 bg-white/85 sm:w-[220px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent align="end">
            {showMyPreferencesOption && (
              <SelectItem value="__preferences__">My preferences</SelectItem>
            )}
            <SelectItem value="__all__">All categories</SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
