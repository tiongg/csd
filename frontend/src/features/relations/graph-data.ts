import { type GlossaryItem } from '@/lib/utils';

const MAX_LINKS_PER_NODE = 3;
const MAX_COMPONENT_SIZE = 18;

export const STRAY_TERMS_ID = '__stray_terms__';
export const STRAY_TERMS_LABEL = 'Stray Terms';
export const STRAY_TERMS_COLOR = '#475569';
const GENERAL_CATEGORY_LABEL = 'General';
const NICHE_CATEGORY_ITEM_THRESHOLD = 3;

export type RelationNode = {
  id: string;
};

export type RelationLink = {
  source: string;
  target: string;
  strength: number;
  reciprocal: boolean;
};

export type RelationCluster = {
  id: string;
  items: { id: string }[];
};

export type RelationGroup = {
  id: string;
  label: string;
  color: string;
  area: 'category' | 'stray';
  clusters: RelationCluster[];
  items: { id: string }[];
};

export type GroupedRelationNode = RelationNode & {
  area: 'category' | 'stray';
  category: string | null;
  cluster: number;
  color: string;
  groupId: string;
  groupLabel: string;
};

export type GroupedRelationLink = RelationLink & {
  area: 'category' | 'stray';
  groupId: string;
};

export type GroupedRelationGraph = {
  nodes: GroupedRelationNode[];
  links: GroupedRelationLink[];
  categories: RelationGroup[];
  stray: RelationGroup | null;
};

type EdgeCandidate = {
  source: string;
  target: string;
  key: string;
  directedCount: number;
  sourceDegree: number;
  targetDegree: number;
  sharedNeighborCount: number;
  jaccardScore: number;
  strength: number;
  reciprocal: boolean;
};

type BuiltGroup = RelationGroup & {
  nodes: GroupedRelationNode[];
  links: GroupedRelationLink[];
};

const alphabeticalSortOptions = { sensitivity: 'base' } as const;
const GENERAL_CATEGORY_RULES = [
  {
    label: 'Technology',
    keywords: [
      'technology',
      'tech',
      'ai',
      'software',
      'coding',
      'code',
      'developer',
      'developers',
      'internet',
      'web',
      'app',
      'apps',
      'digital',
      'device',
      'devices',
    ],
  },
  {
    label: 'Gaming',
    keywords: [
      'gaming',
      'game',
      'games',
      'gamer',
      'gamers',
      'esports',
      'console',
      'roblox',
      'minecraft',
      'fortnite',
    ],
  },
  {
    label: 'Social Media',
    keywords: [
      'social',
      'media',
      'meme',
      'memes',
      'slang',
      'creator',
      'creators',
      'content',
      'viral',
      'trend',
      'trends',
      'influencer',
      'persona',
      'vibe',
      'vibes',
      'stream',
      'streamer',
      'streamers',
    ],
  },
  {
    label: 'Fashion',
    keywords: [
      'fashion',
      'style',
      'beauty',
      'aesthetic',
      'aesthetics',
      'outfit',
      'outfits',
      'clothing',
      'makeup',
      'skincare',
    ],
  },
  {
    label: 'Education',
    keywords: [
      'education',
      'study',
      'school',
      'learning',
      'mindset',
      'productivity',
      'career',
      'knowledge',
    ],
  },
  {
    label: 'Lifestyle',
    keywords: [
      'lifestyle',
      'dating',
      'relationship',
      'relationships',
      'wellness',
      'health',
      'fitness',
      'food',
      'travel',
    ],
  },
  {
    label: 'Entertainment',
    keywords: [
      'entertainment',
      'music',
      'movie',
      'movies',
      'film',
      'films',
      'celebrity',
      'celebrities',
      'fandom',
      'lore',
      'show',
      'shows',
    ],
  },
] as const;
const GENERAL_CATEGORY_ALIASES = new Set([
  'general',
  'misc',
  'miscellaneous',
  'other',
  'others',
]);
const BROAD_CATEGORY_LABELS = new Set([
  GENERAL_CATEGORY_LABEL,
  ...GENERAL_CATEGORY_RULES.map((rule) => rule.label),
]);

function normalizeCategoryText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getBroadCategoryLabel(category: string) {
  const normalized = normalizeCategoryText(category);
  if (!normalized) {
    return null;
  }

  if (GENERAL_CATEGORY_ALIASES.has(normalized)) {
    return GENERAL_CATEGORY_LABEL;
  }

  const directMatch = GENERAL_CATEGORY_RULES.find(
    (rule) => normalizeCategoryText(rule.label) === normalized,
  );
  if (directMatch) {
    return directMatch.label;
  }

  const matchedRule = GENERAL_CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return matchedRule?.label ?? null;
}

function appendCategoryItems(
  target: Map<string, GlossaryItem[]>,
  category: string,
  items: GlossaryItem[],
) {
  const existingItems = target.get(category) ?? [];
  existingItems.push(...items);
  target.set(category, existingItems);
}

function coalesceNicheCategories(categorizedItems: Map<string, GlossaryItem[]>) {
  const mergedCategories = new Map<string, GlossaryItem[]>();

  categorizedItems.forEach((items, category) => {
    const nextCategory =
      BROAD_CATEGORY_LABELS.has(category) ||
      items.length >= NICHE_CATEGORY_ITEM_THRESHOLD
        ? category
        : GENERAL_CATEGORY_LABEL;

    appendCategoryItems(mergedCategories, nextCategory, items);
  });

  return mergedCategories;
}

export function normalizeGlossaryCategory(category?: string | null) {
  const normalized = category?.trim();
  if (!normalized) {
    return null;
  }

  return getBroadCategoryLabel(normalized) ?? normalized;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (normalizedHue < 60) {
    r = c;
    g = x;
  } else if (normalizedHue < 120) {
    r = x;
    g = c;
  } else if (normalizedHue < 180) {
    g = c;
    b = x;
  } else if (normalizedHue < 240) {
    g = x;
    b = c;
  } else if (normalizedHue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateRelationCategoryColor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 64 + (Math.abs(hash >> 6) % 14);
  const lightness = 38 + (Math.abs(hash >> 12) % 8);

  return hslToHex(hue, saturation, lightness);
}

function assignRelationCategoryColors(labels: string[]) {
  const colors = new Map<string, string>();
  if (labels.length === 0) {
    return colors;
  }

  const baseHue = 210;
  const hueStep = 360 / labels.length;

  labels.forEach((label, index) => {
    const hue = (baseHue + hueStep * index) % 360;
    const saturation = index % 2 === 0 ? 74 : 68;
    const lightness = index % 3 === 0 ? 46 : 50;

    colors.set(label, hslToHex(hue, saturation, lightness));
  });

  return colors;
}

export function buildGraph(glossaryItems: GlossaryItem[]): {
  nodes: RelationNode[];
  links: RelationLink[];
} {
  const nodesById = new Map<string, RelationNode>();
  glossaryItems.forEach((item) => {
    nodesById.set(item.title, { id: item.title });
  });

  const outgoing = new Map<string, Set<string>>();
  nodesById.forEach((_, id) => {
    outgoing.set(id, new Set());
  });

  glossaryItems.forEach((item) => {
    const source = item.title;
    const sourceNeighbors = outgoing.get(source);
    if (!sourceNeighbors) {
      return;
    }

    (item.relationships ?? []).forEach((target) => {
      if (target === source || !nodesById.has(target)) {
        return;
      }
      sourceNeighbors.add(target);
    });
  });

  const edgeCandidates = new Map<string, EdgeCandidate>();
  outgoing.forEach((targets, source) => {
    targets.forEach((target) => {
      const [a, b] = source < target ? [source, target] : [target, source];
      const key = `${a}|||${b}`;
      const existing = edgeCandidates.get(key);
      if (existing) {
        existing.directedCount += 1;
      } else {
        edgeCandidates.set(key, {
          source: a,
          target: b,
          key,
          directedCount: 1,
          sourceDegree: 0,
          targetDegree: 0,
          sharedNeighborCount: 0,
          jaccardScore: 0,
          strength: 1,
          reciprocal: false,
        });
      }
    });
  });

  const candidates = Array.from(edgeCandidates.values()).map((candidate) => {
    const sourceNeighbors = outgoing.get(candidate.source) ?? new Set<string>();
    const targetNeighbors = outgoing.get(candidate.target) ?? new Set<string>();
    const sourceContext = Array.from(sourceNeighbors).filter(
      (neighbor) => neighbor !== candidate.target,
    );
    const targetContext = Array.from(targetNeighbors).filter(
      (neighbor) => neighbor !== candidate.source,
    );

    let sharedNeighborCount = 0;
    sourceContext.forEach((neighbor) => {
      if (targetNeighbors.has(neighbor)) {
        sharedNeighborCount += 1;
      }
    });

    const reciprocal = candidate.directedCount > 1;
    const unionNeighborCount = new Set([...sourceContext, ...targetContext])
      .size;
    const jaccardScore =
      unionNeighborCount > 0 ? sharedNeighborCount / unionNeighborCount : 0;
    const strength =
      candidate.directedCount * 2 + Math.min(sharedNeighborCount, 2);

    return {
      ...candidate,
      sourceDegree: sourceNeighbors.size,
      targetDegree: targetNeighbors.size,
      sharedNeighborCount,
      jaccardScore,
      strength,
      reciprocal,
    };
  });

  const incidentByNode = new Map<string, EdgeCandidate[]>();
  nodesById.forEach((_, id) => {
    incidentByNode.set(id, []);
  });
  candidates.forEach((candidate) => {
    incidentByNode.get(candidate.source)?.push(candidate);
    incidentByNode.get(candidate.target)?.push(candidate);
  });

  const selectedByNode = new Map<string, Set<string>>();
  incidentByNode.forEach((edges, nodeId) => {
    const ranked = [...edges].sort((a, b) => {
      if (a.sharedNeighborCount !== b.sharedNeighborCount) {
        return b.sharedNeighborCount - a.sharedNeighborCount;
      }
      if (a.jaccardScore !== b.jaccardScore) {
        return b.jaccardScore - a.jaccardScore;
      }
      if (a.reciprocal !== b.reciprocal) {
        return a.reciprocal ? -1 : 1;
      }
      if (a.strength !== b.strength) {
        return b.strength - a.strength;
      }
      return a.key.localeCompare(b.key);
    });

    const selectionCap = edges.length >= 7 ? 2 : MAX_LINKS_PER_NODE;
    const preferredEdges = ranked.filter((edge) => {
      const touchesLeaf = edge.sourceDegree <= 2 || edge.targetDegree <= 2;

      return (
        edge.reciprocal ||
        edge.sharedNeighborCount > 0 ||
        edge.jaccardScore >= 0.16 ||
        touchesLeaf
      );
    });
    const selectionPool = preferredEdges.length > 0 ? preferredEdges : ranked;

    selectedByNode.set(
      nodeId,
      new Set(selectionPool.slice(0, selectionCap).map((edge) => edge.key)),
    );
  });

  const keptEdges = new Map<string, EdgeCandidate>();
  candidates.forEach((candidate) => {
    const selectedBySource =
      selectedByNode.get(candidate.source)?.has(candidate.key) ?? false;
    const selectedByTarget =
      selectedByNode.get(candidate.target)?.has(candidate.key) ?? false;
    const touchesLeaf =
      candidate.sourceDegree <= 2 || candidate.targetDegree <= 2;
    const hasLocalSupport =
      candidate.sharedNeighborCount > 0 || candidate.jaccardScore >= 0.16;

    if (
      (candidate.reciprocal && (hasLocalSupport || touchesLeaf)) ||
      (selectedBySource && selectedByTarget && (hasLocalSupport || touchesLeaf))
    ) {
      keptEdges.set(candidate.key, candidate);
    }
  });

  const degreeByNode = new Map<string, number>();
  nodesById.forEach((_, id) => {
    degreeByNode.set(id, 0);
  });
  keptEdges.forEach((edge) => {
    degreeByNode.set(edge.source, (degreeByNode.get(edge.source) ?? 0) + 1);
    degreeByNode.set(edge.target, (degreeByNode.get(edge.target) ?? 0) + 1);
  });

  incidentByNode.forEach((edges, nodeId) => {
    if ((degreeByNode.get(nodeId) ?? 0) > 0 || edges.length === 0) {
      return;
    }

    const strongest = [...edges].sort((a, b) => b.strength - a.strength)[0];
    if (!strongest || keptEdges.has(strongest.key)) {
      return;
    }

    keptEdges.set(strongest.key, strongest);
    degreeByNode.set(
      strongest.source,
      (degreeByNode.get(strongest.source) ?? 0) + 1,
    );
    degreeByNode.set(
      strongest.target,
      (degreeByNode.get(strongest.target) ?? 0) + 1,
    );
  });

  const getEdgeRetentionScore = (edge: EdgeCandidate) =>
    edge.sharedNeighborCount * 18 +
    edge.jaccardScore * 24 +
    (edge.reciprocal ? 8 : 0) +
    edge.strength * 4 -
    Math.min(edge.sourceDegree, edge.targetDegree) * 2;

  while (true) {
    const components = buildConnectedComponents(
      Array.from(nodesById.keys()),
      Array.from(keptEdges.values()).map((edge) => ({
        source: edge.source,
        target: edge.target,
      })),
    );
    const oversizedComponent = components.find(
      (component) => component.length > MAX_COMPONENT_SIZE,
    );

    if (!oversizedComponent) {
      break;
    }

    const componentNodeSet = new Set(oversizedComponent);
    const componentEdges = Array.from(keptEdges.values()).filter(
      (edge) =>
        componentNodeSet.has(edge.source) && componentNodeSet.has(edge.target),
    );
    const currentComponentDegrees = new Map<string, number>();
    oversizedComponent.forEach((nodeId) => {
      currentComponentDegrees.set(nodeId, 0);
    });
    componentEdges.forEach((edge) => {
      currentComponentDegrees.set(
        edge.source,
        (currentComponentDegrees.get(edge.source) ?? 0) + 1,
      );
      currentComponentDegrees.set(
        edge.target,
        (currentComponentDegrees.get(edge.target) ?? 0) + 1,
      );
    });

    const removableEdge = componentEdges
      .filter(
        (edge) =>
          (currentComponentDegrees.get(edge.source) ?? 0) > 1 &&
          (currentComponentDegrees.get(edge.target) ?? 0) > 1,
      )
      .sort((a, b) => getEdgeRetentionScore(a) - getEdgeRetentionScore(b))[0];

    if (!removableEdge) {
      break;
    }

    keptEdges.delete(removableEdge.key);
  }

  return {
    nodes: Array.from(nodesById.values()),
    links: Array.from(keptEdges.values()).map((edge) => ({
      source: edge.source,
      target: edge.target,
      strength: edge.strength,
      reciprocal: edge.reciprocal,
    })),
  };
}

export function buildComponentLookup(nodes: RelationNode[], links: RelationLink[]) {
  const nodeIds = nodes.map((node) => node.id);
  const components = buildConnectedComponents(nodeIds, links);
  const componentByNode = new Map<string, number>();

  components.forEach((component, componentIndex) => {
    component.forEach((nodeId) => {
      componentByNode.set(nodeId, componentIndex);
    });
  });

  return {
    componentByNode,
    componentCount: components.length,
    components,
  };
}

export function buildGroupedRelationGraph(
  glossaryItems: GlossaryItem[],
): GroupedRelationGraph {
  const categorizedItems = new Map<string, GlossaryItem[]>();
  const strayItems: GlossaryItem[] = [];

  glossaryItems.forEach((item) => {
    const category = normalizeGlossaryCategory(item.category);
    if (category) {
      const existingItems = categorizedItems.get(category) ?? [];
      existingItems.push(item);
      categorizedItems.set(category, existingItems);
      return;
    }

    strayItems.push(item);
  });

  const mergedCategories = coalesceNicheCategories(categorizedItems);
  const orderedCategories = Array.from(mergedCategories.entries()).sort(([a], [b]) =>
    a.localeCompare(b, undefined, alphabeticalSortOptions),
  );
  const categoryColors = assignRelationCategoryColors(
    orderedCategories.map(([category]) => category),
  );
  const categoryGroups = orderedCategories
    .map(([category, items]) =>
      buildGroup(
        category,
        items,
        'category',
        categoryColors.get(category) ?? generateRelationCategoryColor(category),
      ),
    );
  const strayGroup =
    strayItems.length > 0
      ? buildGroup(
          STRAY_TERMS_ID,
          strayItems,
          'stray',
          STRAY_TERMS_COLOR,
          STRAY_TERMS_LABEL,
        )
      : null;

  return {
    nodes: [
      ...categoryGroups.flatMap((group) => group.nodes),
      ...(strayGroup?.nodes ?? []),
    ],
    links: [
      ...categoryGroups.flatMap((group) => group.links),
      ...(strayGroup?.links ?? []),
    ],
    categories: categoryGroups.map(stripGroupInternals),
    stray: strayGroup ? stripGroupInternals(strayGroup) : null,
  };
}

function buildGroup(
  groupId: string,
  items: GlossaryItem[],
  area: 'category' | 'stray',
  color: string,
  label = groupId,
): BuiltGroup {
  const sortedItems = [...items].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, alphabeticalSortOptions),
  );
  const { nodes, links } = buildGraph(sortedItems);
  const { components } = buildComponentLookup(nodes, links);
  const orderedComponents = [...components].sort((a, b) => {
    if (b.length !== a.length) {
      return b.length - a.length;
    }

    const firstA = [...a].sort((left, right) =>
      left.localeCompare(right, undefined, alphabeticalSortOptions),
    )[0];
    const firstB = [...b].sort((left, right) =>
      left.localeCompare(right, undefined, alphabeticalSortOptions),
    )[0];

    return (firstA ?? '').localeCompare(
      firstB ?? '',
      undefined,
      alphabeticalSortOptions,
    );
  });

  const clusterByNode = new Map<string, number>();
  const clusters = orderedComponents.map((component, clusterIndex) => {
    const orderedItems = [...component]
      .sort((a, b) => a.localeCompare(b, undefined, alphabeticalSortOptions))
      .map((id) => ({ id }));

    orderedItems.forEach((item) => {
      clusterByNode.set(item.id, clusterIndex);
    });

    return {
      id: `${groupId}-${clusterIndex}`,
      items: orderedItems,
    };
  });

  return {
    id: groupId,
    label,
    color,
    area,
    clusters,
    items: clusters.flatMap((cluster) => cluster.items),
    nodes: nodes.map((node) => ({
      id: node.id,
      area,
      category: area === 'category' ? label : null,
      cluster: clusterByNode.get(node.id) ?? 0,
      color,
      groupId,
      groupLabel: label,
    })),
    links: links.map((link) => ({
      ...link,
      area,
      groupId,
    })),
  };
}

function stripGroupInternals(group: BuiltGroup): RelationGroup {
  return {
    id: group.id,
    label: group.label,
    color: group.color,
    area: group.area,
    clusters: group.clusters,
    items: group.items,
  };
}

function buildConnectedComponents(
  nodeIds: string[],
  links: Pick<RelationLink, 'source' | 'target'>[],
) {
  const adjacency = new Map<string, Set<string>>();
  nodeIds.forEach((nodeId) => {
    adjacency.set(nodeId, new Set());
  });

  links.forEach((link) => {
    adjacency.get(link.source)?.add(link.target);
    adjacency.get(link.target)?.add(link.source);
  });

  const visited = new Set<string>();
  const components: string[][] = [];

  nodeIds.forEach((nodeId) => {
    if (visited.has(nodeId)) {
      return;
    }

    const queue = [nodeId];
    const component: string[] = [];
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      component.push(current);
      const orderedNeighbors = Array.from(adjacency.get(current) ?? []).sort(
        (a, b) => a.localeCompare(b, undefined, alphabeticalSortOptions),
      );
      orderedNeighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }

    components.push(component);
  });

  return components;
}
