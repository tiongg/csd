import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { badgeVariants } from '@/components/ui/badge';
import SearchBar from '@/components/ui/searchbar';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import { cn, hexToRgb } from '@/lib/utils';
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { KeywordCourseSearchDialog } from '../learner/dashboard/KeywordCourseSearchDialog';
import RelationGraph from './RelationGraph';
import {
  buildGroupedRelationGraph,
  STRAY_TERMS_ID,
  type RelationGroup,
} from './graph-data';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

function filterRelationGroup(group: RelationGroup, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return group;
  }

  if (group.label.toLowerCase().includes(normalizedQuery)) {
    return group;
  }

  const filteredItems = group.items.filter((item) =>
    item.id.toLowerCase().includes(normalizedQuery),
  );

  if (filteredItems.length === 0) {
    return null;
  }

  return {
    ...group,
    items: filteredItems,
  };
}

function CategorySection({
  group,
  onSelect,
}: {
  group: RelationGroup;
  onSelect: (value: string) => void;
}) {
  const { r, g, b } = hexToRgb(group.color);

  return (
    <AccordionItem
      value={group.id}
      className="rounded-lg border border-slate-200/80 border-b border-slate-200/80 bg-white/75 px-3 last:border-b"
    >
      <AccordionTrigger className="cursor-pointer py-3 hover:no-underline">
        <div className="flex min-w-0 items-center gap-3 text-left">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: group.color }}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-600 uppercase">
              {group.label}
            </p>
            <p className="text-xs text-slate-500">{group.items.length} tags</p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="overflow-visible pb-4">
        <div className="flex min-h-12 flex-wrap gap-2 px-2 py-2">
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                badgeVariants({ variant: 'outline' }),
                'h-auto max-w-full cursor-pointer rounded-full px-3 py-1.5 text-left text-xs font-medium shadow-sm outline-none transition-[box-shadow,filter] hover:shadow-md hover:brightness-[1.03] focus-visible:ring-0 focus-visible:ring-offset-0',
              )}
              style={{
                borderColor: `rgba(${r}, ${g}, ${b}, 0.34)`,
                backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
                color: group.color,
              }}
              onClick={() => {
                onSelect(item.id);
              }}
            >
              {item.id}
            </button>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function DesmosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusRequestKey, setFocusRequestKey] = useState(0);
  const [sidePanelWidth, setSidePanelWidth] = useState(320);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [isCourseMatchOpen, setIsCourseMatchOpen] = useState(false);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(
    null,
  );
  const { data: glossaryItems } = useApiQuery('get', '/api/glossary/');

  const requestFocus = (query: string) => {
    setSearchQuery(query);
    setFocusRequestKey((current) => current + 1);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = resizeStateRef.current;
      const splitPane = splitPaneRef.current;
      if (!resizeState || !splitPane) {
        return;
      }

      const containerWidth = splitPane.clientWidth;
      const minWidth = 264;
      const maxWidth = Math.min(460, Math.max(320, containerWidth * 0.42));
      const nextWidth =
        resizeState.startWidth - (event.clientX - resizeState.startX);

      setSidePanelWidth(Math.min(maxWidth, Math.max(minWidth, nextWidth)));
    };

    const stopResize = () => {
      resizeStateRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResize);

    return () => {
      stopResize();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResize);
    };
  }, []);

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    resizeStateRef.current = {
      startX: event.clientX,
      startWidth: sidePanelWidth,
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const relationGraph = useMemo(
    () => buildGroupedRelationGraph(glossaryItems ?? []),
    [glossaryItems],
  );

  const filteredCategories = useMemo(
    () =>
      relationGraph.categories
        .map((group) => filterRelationGroup(group, searchQuery))
        .filter((group): group is RelationGroup => group !== null),
    [relationGraph.categories, searchQuery],
  );

  const filteredStrayGroup = useMemo(
    () =>
      relationGraph.stray
        ? filterRelationGroup(relationGraph.stray, searchQuery)
        : null,
    [relationGraph.stray, searchQuery],
  );

  const defaultOpenGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return [
      ...filteredCategories.map((group) => group.id),
      ...(filteredStrayGroup ? [STRAY_TERMS_ID] : []),
    ];
  }, [filteredCategories, filteredStrayGroup, searchQuery]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-slate-100/70 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
        <section className={glassPanelClass}>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Node Graph
          </p>
          <Heading1 className="mt-1 text-4xl leading-tight tracking-tight">
            Desmos
          </Heading1>
          <p className="mt-2 max-w-4xl text-sm text-slate-600">
            Explore glossary terms as an interactive node graph. Search for a tag
            or category to focus the view and inspect how terms connect.
          </p>
        </section>

        <section className={`${glassPanelClass} flex min-h-0 flex-1 flex-col`}>
          <div
            ref={splitPaneRef}
            className="flex min-h-[520px] flex-1 flex-col gap-4 xl:min-h-0 xl:flex-row xl:items-start xl:gap-0"
            style={
              {
                '--desmos-panel-height': 'min(72vh, 44rem)',
              } as CSSProperties
            }
          >
            <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-white/65 xl:h-[var(--desmos-panel-height)] xl:min-h-0 xl:min-w-0">
              <RelationGraph
                glossaryItems={glossaryItems ?? []}
                focusQuery={searchQuery}
                focusRequestKey={focusRequestKey}
                onNodeClick={(nodeId) => {
                  setKeywordSearch(nodeId);
                  setIsCourseMatchOpen(true);
                }}
              />
            </div>

            <button
              type="button"
              aria-label="Resize tag panel"
              className="hidden xl:flex xl:h-[var(--desmos-panel-height)] xl:w-6 xl:flex-none xl:cursor-col-resize xl:items-center xl:justify-center"
              onPointerDown={startResize}
            >
              <span className="h-16 w-1.5 rounded-full bg-slate-300/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors hover:bg-slate-400/90" />
            </button>

            <aside
              className="flex min-h-[420px] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] xl:h-[var(--desmos-panel-height)] xl:max-h-[var(--desmos-panel-height)] xl:min-h-0 xl:w-[var(--desmos-panel-width)]"
              style={
                {
                  '--desmos-panel-width': `${sidePanelWidth}px`,
                } as CSSProperties
              }
            >
              <div className="mb-4">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Category Navigator
                </p>
                <div className="mt-2">
                  <SearchBar
                    value={searchQuery}
                    placeholder="Search tag or category"
                    onSearch={requestFocus}
                    onClear={() => {
                      setFocusRequestKey((current) => current + 1);
                    }}
                    className="h-10 border-slate-400 bg-white text-slate-700 shadow-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Click a tag to focus it in the graph.
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="space-y-3 px-1 py-2 pb-6">
                  {filteredCategories.length > 0 || filteredStrayGroup ? (
                    <Accordion
                      key={defaultOpenGroups.join(',')}
                      type="multiple"
                      defaultValue={defaultOpenGroups}
                      className="space-y-3"
                    >
                      {filteredCategories.map((group) => (
                        <CategorySection
                          key={group.id}
                          group={group}
                          onSelect={requestFocus}
                        />
                      ))}
                      {filteredStrayGroup ? (
                        <CategorySection
                          group={filteredStrayGroup}
                          onSelect={requestFocus}
                        />
                      ) : null}
                    </Accordion>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No tags matched your search.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <KeywordCourseSearchDialog
        initialSearchValue={keywordSearch}
        open={isCourseMatchOpen}
        onOpenChange={setIsCourseMatchOpen}
      />
    </div>
  );
}
