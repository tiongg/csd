import { cn, hexToRgb, type GlossaryItem } from '@/lib/utils';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildGroupedRelationGraph,
  normalizeGlossaryCategory,
  STRAY_TERMS_LABEL,
  type GroupedRelationLink,
  type GroupedRelationNode,
  type RelationGroup,
} from './graph-data';

const SEARCH_FOCUS_SCALE = 2.75;
const SEARCH_FOCUS_DURATION_MS = 500;
const LABEL_VISIBILITY_SCALE = 0.98;
const CATEGORY_HEADER_GAP = 18;
const MIN_GRAPH_LAYOUT_SCALE = 0.82;
const CATEGORY_RADIUS_SCALE = 0.9;
const CLUSTER_SLOT_SPACING = 22;
const CLUSTER_PADDING = 26;
const CLUSTER_GAP = 34;
const GROUP_PADDING = 40;
const GROUP_GAP = 108;

type NodeType = SimulationNodeDatum &
  GroupedRelationNode & {
    clusterKey: string;
    anchorX?: number;
    anchorY?: number;
    x?: number;
    y?: number;
  };

type LinkType = SimulationLinkDatum<NodeType> & GroupedRelationLink;

type RelationGraphProps = {
  glossaryItems: GlossaryItem[];
  onNodeClick?: (nodeId: string, connections: string[]) => void;
  className?: string;
  focusQuery?: string;
  focusRequestKey?: number;
};

type Point = {
  x: number;
  y: number;
};

type StrayZone = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type GroupLayout = {
  center: Point;
  radius: number;
};

type ClusterLayout = {
  center: Point;
  radius: number;
  width: number;
  height: number;
  slots: Point[];
};

type LayoutBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type HexCell = {
  q: number;
  r: number;
};

type PackedLayouts = {
  layouts: Map<string, ClusterLayout>;
  radius: number;
  bounds: LayoutBounds;
};

function getNodeId(value: NodeType | string) {
  return typeof value === 'string' ? value : value.id;
}

function getStableHash(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
}

function getCellKey(cell: HexCell) {
  return `${cell.q},${cell.r}`;
}

function axialToPoint(cell: HexCell): Point {
  return {
    x: Math.sqrt(3) * (cell.q + cell.r / 2),
    y: 1.5 * cell.r,
  };
}

function countOccupiedNeighbors(cell: HexCell, occupied: Set<string>) {
  const directions: HexCell[] = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];

  return directions.reduce((count, direction) => {
    const neighborKey = getCellKey({
      q: cell.q + direction.q,
      r: cell.r + direction.r,
    });

    return occupied.has(neighborKey) ? count + 1 : count;
  }, 0);
}

function buildOrganicClusterShape(
  clusterId: string,
  itemCount: number,
): Pick<ClusterLayout, 'radius' | 'width' | 'height' | 'slots'> {
  if (itemCount <= 1) {
    return {
      width: CLUSTER_PADDING * 2,
      height: CLUSTER_PADDING * 2,
      radius: CLUSTER_PADDING,
      slots: [{ x: 0, y: 0 }],
    };
  }

  const directions: HexCell[] = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];
  const occupied = new Set<string>();
  const frontier = new Map<string, HexCell>();
  const cells: HexCell[] = [{ q: 0, r: 0 }];
  const clusterSeed = getStableHash(clusterId);
  const initialCell = cells[0];

  const addFrontierNeighbors = (cell: HexCell) => {
    directions.forEach((direction) => {
      const neighbor = {
        q: cell.q + direction.q,
        r: cell.r + direction.r,
      };
      const neighborKey = getCellKey(neighbor);
      if (!occupied.has(neighborKey) && !frontier.has(neighborKey)) {
        frontier.set(neighborKey, neighbor);
      }
    });
  };

  if (!initialCell) {
    return {
      width: CLUSTER_PADDING * 2,
      height: CLUSTER_PADDING * 2,
      radius: CLUSTER_PADDING,
      slots: [{ x: 0, y: 0 }],
    };
  }

  occupied.add(getCellKey(initialCell));
  addFrontierNeighbors(initialCell);

  while (cells.length < itemCount && frontier.size > 0) {
    const nextCell = [...frontier.values()].sort((left, right) => {
      const leftNeighbors = countOccupiedNeighbors(left, occupied);
      const rightNeighbors = countOccupiedNeighbors(right, occupied);
      if (leftNeighbors !== rightNeighbors) {
        return rightNeighbors - leftNeighbors;
      }

      const leftDistance = Math.hypot(left.q, left.r);
      const rightDistance = Math.hypot(right.q, right.r);
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      const leftNoise =
        (getStableHash(`${clusterSeed}:${left.q}:${left.r}`) % 1000) / 1000;
      const rightNoise =
        (getStableHash(`${clusterSeed}:${right.q}:${right.r}`) % 1000) / 1000;

      return leftNoise - rightNoise;
    })[0];

    if (!nextCell) {
      break;
    }

    frontier.delete(getCellKey(nextCell));
    occupied.add(getCellKey(nextCell));
    cells.push(nextCell);
    addFrontierNeighbors(nextCell);
  }

  const rawPoints = cells.map(axialToPoint);
  const centroid = rawPoints.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x / rawPoints.length,
      y: accumulator.y + point.y / rawPoints.length,
    }),
    { x: 0, y: 0 },
  );
  const slots = rawPoints
    .map((point) => ({
      x: (point.x - centroid.x) * CLUSTER_SLOT_SPACING,
      y: (point.y - centroid.y) * CLUSTER_SLOT_SPACING,
    }))
    .sort((left, right) => Math.hypot(left.x, left.y) - Math.hypot(right.x, right.y));
  const minX = Math.min(...slots.map((slot) => slot.x));
  const maxX = Math.max(...slots.map((slot) => slot.x));
  const minY = Math.min(...slots.map((slot) => slot.y));
  const maxY = Math.max(...slots.map((slot) => slot.y));
  const radius =
    Math.max(...slots.map((slot) => Math.hypot(slot.x, slot.y))) +
    CLUSTER_PADDING;

  return {
    width: maxX - minX + CLUSTER_PADDING * 2,
    height: maxY - minY + CLUSTER_PADDING * 2,
    radius,
    slots,
  };
}

function packCircles(
  items: {
    id: string;
    radius: number;
    width?: number;
    height?: number;
    slots?: Point[];
  }[],
  gap: number,
): PackedLayouts {
  const layouts = new Map<string, ClusterLayout>();
  if (items.length === 0) {
    return {
      layouts,
      radius: 0,
      bounds: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
      },
    };
  }

  if (items.length === 1) {
    const onlyItem = items[0];
    if (!onlyItem) {
      return {
        layouts,
        radius: 0,
        bounds: {
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0,
        },
      };
    }

    const halfWidth = (onlyItem.width ?? onlyItem.radius * 2) / 2;
    const halfHeight = (onlyItem.height ?? onlyItem.radius * 2) / 2;

    layouts.set(onlyItem.id, {
      center: { x: 0, y: 0 },
      radius: onlyItem.radius,
      width: halfWidth * 2,
      height: halfHeight * 2,
      slots: onlyItem.slots ?? [],
    });

    return {
      layouts,
      radius: Math.hypot(halfWidth, halfHeight),
      bounds: {
        minX: -halfWidth,
        maxX: halfWidth,
        minY: -halfHeight,
        maxY: halfHeight,
      },
    };
  }

  const packedItems = [...items]
    .sort(
      (a, b) =>
        b.radius - a.radius ||
        a.id.localeCompare(b.id, undefined, { sensitivity: 'base' }),
    )
    .map((item) => ({
      id: item.id,
      actualRadius: item.radius,
      actualWidth: item.width ?? item.radius * 2,
      actualHeight: item.height ?? item.radius * 2,
      actualSlots: item.slots ?? [],
      r: item.radius + gap / 2,
      x: 0,
      y: 0,
    }));

  d3.packSiblings(packedItems as any[]);
  const enclosure = d3.packEnclose(packedItems as any[]);
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let outerRadius = 0;

  packedItems.forEach((item) => {
    const center = {
      x: (item.x ?? 0) - enclosure.x,
      y: (item.y ?? 0) - enclosure.y,
    };
    const halfWidth = item.actualWidth / 2;
    const halfHeight = item.actualHeight / 2;

    layouts.set(item.id, {
      center,
      radius: item.actualRadius,
      width: item.actualWidth,
      height: item.actualHeight,
      slots: item.actualSlots,
    });
    minX = Math.min(minX, center.x - halfWidth);
    maxX = Math.max(maxX, center.x + halfWidth);
    minY = Math.min(minY, center.y - halfHeight);
    maxY = Math.max(maxY, center.y + halfHeight);
    outerRadius = Math.max(
      outerRadius,
      Math.hypot(center.x - halfWidth, center.y - halfHeight),
      Math.hypot(center.x - halfWidth, center.y + halfHeight),
      Math.hypot(center.x + halfWidth, center.y - halfHeight),
      Math.hypot(center.x + halfWidth, center.y + halfHeight),
    );
  });

  return {
    layouts,
    radius: outerRadius,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
    },
  };
}

function buildStrayZone(width: number, height: number): StrayZone {
  const zoneWidth = Math.max(200, Math.min(320, width * 0.28));

  return {
    x: width - zoneWidth + 28,
    y: 42,
    width: Math.max(140, zoneWidth - 56),
    height: Math.max(220, height - 84),
  };
}

function buildClusterCenters(
  categories: RelationGroup[],
  stray: RelationGroup | null,
  width: number,
  height: number,
) {
  const centers = new Map<string, Point>();
  const clusterLayouts = new Map<string, ClusterLayout>();
  const groupLayouts = new Map<string, GroupLayout>();
  const reservedStrayWidth = stray
    ? Math.max(200, Math.min(320, width * 0.28))
    : 0;
  const usableWidth = Math.max(240, width - reservedStrayWidth);
  const usableLeft = 48;
  const usableTop = 64;
  const availableWidth = Math.max(220, usableWidth - 96);
  const availableHeight = Math.max(220, height - 128);

  const categoryBlueprints = categories.map((group) => {
    const packedClusters = packCircles(
      group.clusters.map((cluster) => {
        const shape = buildOrganicClusterShape(cluster.id, cluster.items.length);

        return {
          id: cluster.id,
          radius: shape.radius,
          width: shape.width,
          height: shape.height,
          slots: shape.slots,
        };
      }),
      CLUSTER_GAP,
    );

    return {
      group,
      radius: packedClusters.radius * CATEGORY_RADIUS_SCALE + GROUP_PADDING,
      clusterLayouts: packedClusters.layouts,
    };
  });

  const packedGroups = packCircles(
    categoryBlueprints.map((blueprint) => ({
      id: blueprint.group.id,
      radius: blueprint.radius,
    })),
    GROUP_GAP,
  );

  const packedWidth = Math.max(
    1,
    packedGroups.bounds.maxX - packedGroups.bounds.minX,
  );
  const packedHeight = Math.max(
    1,
    packedGroups.bounds.maxY - packedGroups.bounds.minY,
  );
  const scale = Math.max(
    MIN_GRAPH_LAYOUT_SCALE,
    Math.min(1, availableWidth / packedWidth, availableHeight / packedHeight),
  );
  const translateX =
    usableLeft +
    (availableWidth - packedWidth * scale) / 2 -
    packedGroups.bounds.minX * scale;
  const translateY =
    usableTop +
    (availableHeight - packedHeight * scale) / 2 -
    packedGroups.bounds.minY * scale;

  categoryBlueprints.forEach((blueprint) => {
    const packedGroup = packedGroups.layouts.get(blueprint.group.id);
    if (!packedGroup) {
      return;
    }

    const groupCenter = {
      x: packedGroup.center.x * scale + translateX,
      y: packedGroup.center.y * scale + translateY,
    };
    const groupRadius = blueprint.radius * scale;

    groupLayouts.set(blueprint.group.id, {
      center: groupCenter,
      radius: groupRadius,
    });

    blueprint.clusterLayouts.forEach((clusterLayout, clusterId) => {
      const absoluteLayout = {
        center: {
          x: groupCenter.x + clusterLayout.center.x * scale,
          y: groupCenter.y + clusterLayout.center.y * scale,
        },
        radius: clusterLayout.radius * scale,
        width: clusterLayout.width * scale,
        height: clusterLayout.height * scale,
        slots: clusterLayout.slots.map((slot) => ({
          x: slot.x * scale,
          y: slot.y * scale,
        })),
      };
      centers.set(clusterId, absoluteLayout.center);
      clusterLayouts.set(clusterId, absoluteLayout);
    });
  });

  const strayZone = stray ? buildStrayZone(width, height) : null;
  if (stray && strayZone) {
    const packedStrayClusters = packCircles(
      stray.clusters.map((cluster) => {
        const shape = buildOrganicClusterShape(cluster.id, cluster.items.length);

        return {
          id: cluster.id,
          radius: shape.radius,
          width: shape.width,
          height: shape.height,
          slots: shape.slots,
        };
      }),
      CLUSTER_GAP,
    );
    const strayPackedWidth = Math.max(
      1,
      packedStrayClusters.bounds.maxX - packedStrayClusters.bounds.minX,
    );
    const strayPackedHeight = Math.max(
      1,
      packedStrayClusters.bounds.maxY - packedStrayClusters.bounds.minY,
    );
    const strayScale = Math.min(
      1,
      Math.max(0.55, (strayZone.width - 36) / strayPackedWidth),
      Math.max(0.55, (strayZone.height - 52) / strayPackedHeight),
    );
    const strayTranslateX =
      strayZone.x +
      (strayZone.width - strayPackedWidth * strayScale) / 2 -
      packedStrayClusters.bounds.minX * strayScale;
    const strayTranslateY =
      strayZone.y +
      (strayZone.height - strayPackedHeight * strayScale) / 2 -
      packedStrayClusters.bounds.minY * strayScale;

    packedStrayClusters.layouts.forEach((clusterLayout, clusterId) => {
      const absoluteLayout = {
        center: {
          x: clusterLayout.center.x * strayScale + strayTranslateX,
          y: clusterLayout.center.y * strayScale + strayTranslateY,
        },
        radius: clusterLayout.radius * strayScale,
        width: clusterLayout.width * strayScale,
        height: clusterLayout.height * strayScale,
        slots: clusterLayout.slots.map((slot) => ({
          x: slot.x * strayScale,
          y: slot.y * strayScale,
        })),
      };
      centers.set(clusterId, absoluteLayout.center);
      clusterLayouts.set(clusterId, absoluteLayout);
    });
  }

  return {
    centers,
    clusterLayouts,
    groupLayouts,
    strayZone,
  };
}

function placeNodesAroundClusterCenters(
  nodes: NodeType[],
  links: LinkType[],
  clusterLayouts: Map<string, ClusterLayout>,
) {
  const nodeDegrees = new Map<string, number>();
  nodes.forEach((node) => {
    nodeDegrees.set(node.id, 0);
  });

  links.forEach((graphLink) => {
    const sourceId = getNodeId(graphLink.source);
    const targetId = getNodeId(graphLink.target);
    nodeDegrees.set(sourceId, (nodeDegrees.get(sourceId) ?? 0) + 1);
    nodeDegrees.set(targetId, (nodeDegrees.get(targetId) ?? 0) + 1);
  });

  const nodesByCluster = new Map<string, NodeType[]>();
  nodes.forEach((node) => {
    const clusterNodes = nodesByCluster.get(node.clusterKey) ?? [];
    clusterNodes.push(node);
    nodesByCluster.set(node.clusterKey, clusterNodes);
  });

  nodesByCluster.forEach((clusterNodes, clusterKey) => {
    const clusterLayout = clusterLayouts.get(clusterKey);
    const center = clusterLayout?.center ?? { x: 0, y: 0 };
    const slotLayout = clusterLayout?.slots ?? [{ x: 0, y: 0 }];
    const sortedClusterNodes = [...clusterNodes].sort((a, b) => {
      const degreeDifference =
        (nodeDegrees.get(b.id) ?? 0) - (nodeDegrees.get(a.id) ?? 0);

      if (degreeDifference !== 0) {
        return degreeDifference;
      }

      return a.id.localeCompare(b.id, undefined, { sensitivity: 'base' });
    });

    sortedClusterNodes.forEach((node, index) => {
      const slot = slotLayout[index] ?? { x: 0, y: 0 };

      node.anchorX = center.x + slot.x;
      node.anchorY = center.y + slot.y;
      node.x = node.anchorX;
      node.y = node.anchorY;
    });
  });
}

function constrainNodesToGroupLayouts(
  nodes: NodeType[],
  groupLayouts: Map<string, GroupLayout>,
) {
  nodes.forEach((node) => {
    const groupLayout = groupLayouts.get(node.groupId);
    if (!groupLayout) {
      return;
    }

    const currentX = node.x ?? groupLayout.center.x;
    const currentY = node.y ?? groupLayout.center.y;
    const dx = currentX - groupLayout.center.x;
    const dy = currentY - groupLayout.center.y;
    const distance = Math.hypot(dx, dy);
    const maxDistance = Math.max(0, groupLayout.radius - 18);

    if (distance <= maxDistance) {
      return;
    }

    const ratio = maxDistance / (distance || 1);
    node.x = groupLayout.center.x + dx * ratio;
    node.y = groupLayout.center.y + dy * ratio;
  });
}

function recenterNodesWithinClusters(
  nodes: NodeType[],
  clusterLayouts: Map<string, ClusterLayout>,
) {
  const nodesByCluster = new Map<string, NodeType[]>();

  nodes.forEach((node) => {
    const clusterNodes = nodesByCluster.get(node.clusterKey) ?? [];
    clusterNodes.push(node);
    nodesByCluster.set(node.clusterKey, clusterNodes);
  });

  nodesByCluster.forEach((clusterNodes, clusterKey) => {
    const clusterLayout = clusterLayouts.get(clusterKey);
    if (!clusterLayout || clusterNodes.length === 0) {
      return;
    }

    const centroid = clusterNodes.reduce(
      (accumulator, node) => ({
        x: accumulator.x + (node.x ?? clusterLayout.center.x) / clusterNodes.length,
        y: accumulator.y + (node.y ?? clusterLayout.center.y) / clusterNodes.length,
      }),
      { x: 0, y: 0 },
    );
    const translateX = clusterLayout.center.x - centroid.x;
    const translateY = clusterLayout.center.y - centroid.y;

    clusterNodes.forEach((node) => {
      node.x = (node.x ?? clusterLayout.center.x) + translateX;
      node.y = (node.y ?? clusterLayout.center.y) + translateY;
    });
  });
}

function toRgba(color: string, opacity: number) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function RelationGraph({
  glossaryItems,
  onNodeClick,
  className = '',
  focusQuery = '',
  focusRequestKey = 0,
}: RelationGraphProps) {
  const graphData = useMemo(
    () => buildGroupedRelationGraph(glossaryItems),
    [glossaryItems],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomTransformRef = useRef(d3.zoomIdentity);
  const suppressTooltipDismissRef = useRef(false);
  const focusTimeoutRef = useRef<number | null>(null);
  const previousFocusQueryRef = useRef('');
  const focusedNodeIdRef = useRef<string | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const nodeByIdRef = useRef<Map<string, NodeType>>(new Map());
  const activeHighlightNodeIdsRef = useRef<Set<string>>(new Set());
  const applyNodeHighlightRef = useRef<
    ((nodeId: string, showTooltip?: boolean) => void) | null
  >(null);
  const clearNodeHighlightRef = useRef<(() => void) | null>(null);
  const viewportRef = useRef({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<{
    item: GlossaryItem | null;
    connections: string[];
    visible: boolean;
  }>({ item: null, connections: [], visible: false });

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const focusNode = (nodeId: string, scale = SEARCH_FOCUS_SCALE) => {
    const targetNode = nodeByIdRef.current.get(nodeId);
    const svg = svgSelectionRef.current;
    const zoom = zoomRef.current;

    if (
      !targetNode ||
      !svg ||
      !zoom ||
      targetNode.x === undefined ||
      targetNode.y === undefined
    ) {
      return;
    }

    const { width, height } = viewportRef.current;
    const nextTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-targetNode.x, -targetNode.y);

    if (focusTimeoutRef.current !== null) {
      window.clearTimeout(focusTimeoutRef.current);
    }
    focusedNodeIdRef.current = nodeId;
    suppressTooltipDismissRef.current = true;
    applyNodeHighlightRef.current?.(nodeId, true);

    svg
      .interrupt()
      .transition()
      .duration(SEARCH_FOCUS_DURATION_MS)
      .call(zoom.transform, nextTransform);

    focusTimeoutRef.current = window.setTimeout(() => {
      suppressTooltipDismissRef.current = false;
      focusTimeoutRef.current = null;
    }, SEARCH_FOCUS_DURATION_MS + 40);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const nextWidth = Math.max(1, Math.floor(container.clientWidth));
      const nextHeight = Math.max(1, Math.floor(container.clientHeight));
      setViewportSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    return () => {
      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }

    const width = viewportSize.width;
    const height = viewportSize.height;
    viewportRef.current = { width, height };

    const nodes: NodeType[] = graphData.nodes.map((node) => ({
      ...node,
      clusterKey: `${node.groupId}-${node.cluster}`,
    }));
    const links: LinkType[] = graphData.links.map((link) => ({
      ...link,
      source: link.source,
      target: link.target,
    }));
    const { clusterLayouts, groupLayouts, strayZone } =
      buildClusterCenters(graphData.categories, graphData.stray, width, height);
    placeNodesAroundClusterCenters(nodes, links, clusterLayouts);

    const nodeDegrees = new Map<string, number>();
    nodes.forEach((node) => {
      nodeDegrees.set(node.id, 0);
    });
    links.forEach((graphLink) => {
      const sourceId = getNodeId(graphLink.source);
      const targetId = getNodeId(graphLink.target);
      nodeDegrees.set(sourceId, (nodeDegrees.get(sourceId) ?? 0) + 1);
      nodeDegrees.set(targetId, (nodeDegrees.get(targetId) ?? 0) + 1);
    });

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);
    svgSelectionRef.current = svg;

    const g = svg.append('g');
    let emphasizedNodeIds = new Set<string>();
    let labels: d3.Selection<
      SVGTextElement,
      NodeType,
      SVGGElement,
      unknown
    > | null = null;

    const updateLabelVisibility = () => {
      if (!labels) {
        return;
      }

      const showAllLabels =
        zoomTransformRef.current.k >= LABEL_VISIBILITY_SCALE;
      labels
        .style('display', (node) =>
          showAllLabels || emphasizedNodeIds.has(node.id) ? null : 'none',
        )
        .style('opacity', (node) =>
          showAllLabels || emphasizedNodeIds.has(node.id) ? 0.95 : 0,
        );
    };

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        zoomTransformRef.current = event.transform;
        g.attr('transform', event.transform);
        emphasizedNodeIds = new Set(activeHighlightNodeIdsRef.current);
        updateLabelVisibility();
        if (
          !suppressTooltipDismissRef.current &&
          focusedNodeIdRef.current === null
        ) {
          hideTooltip();
        }
      });
    zoomRef.current = zoom;

    svg.call(zoom as any);
    svg.on('click', (event) => {
      const target = event.target as Element | null;
      if (target?.closest('.node')) {
        return;
      }
      focusedNodeIdRef.current = null;
      clearNodeHighlightRef.current?.();
      hideTooltip();
    });

    const backdropLayer = g.append('g').attr('class', 'group-backdrops');
    backdropLayer
      .selectAll<SVGCircleElement, RelationGroup>('circle')
      .data(graphData.categories)
      .join('circle')
      .attr('cx', (group) => groupLayouts.get(group.id)?.center.x ?? width / 2)
      .attr('cy', (group) => groupLayouts.get(group.id)?.center.y ?? height / 2)
      .attr('r', (group) => groupLayouts.get(group.id)?.radius ?? 96)
      .attr('fill', (group) => toRgba(group.color, 0.08))
      .attr('stroke', (group) => toRgba(group.color, 0.26))
      .attr('stroke-width', 1.6);

    backdropLayer
      .selectAll<SVGTextElement, RelationGroup>('text')
      .data(graphData.categories)
      .join('text')
      .text((group) => group.label)
      .attr('x', (group) => groupLayouts.get(group.id)?.center.x ?? width / 2)
      .attr(
        'y',
        (group) =>
          (groupLayouts.get(group.id)?.center.y ?? height / 2) -
          ((groupLayouts.get(group.id)?.radius ?? 96) + CATEGORY_HEADER_GAP),
      )
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .attr('font-size', '26px')
      .attr('font-weight', '700')
      .style('letter-spacing', '0.08em')
      .style('text-transform', 'uppercase')
      .style('pointer-events', 'none');

    if (strayZone && graphData.stray) {
      const strayLayer = g.append('g').attr('class', 'stray-zone');
      strayLayer
        .append('rect')
        .attr('x', strayZone.x)
        .attr('y', strayZone.y)
        .attr('width', strayZone.width)
        .attr('height', strayZone.height)
        .attr('rx', 28)
        .attr('fill', toRgba('#cbd5e1', 0.12))
        .attr('stroke', toRgba('#64748b', 0.24))
        .attr('stroke-dasharray', '8 10');
      strayLayer
        .append('text')
        .text(STRAY_TERMS_LABEL)
        .attr('x', strayZone.x + strayZone.width / 2)
        .attr('y', strayZone.y + 26)
        .attr('text-anchor', 'middle')
        .attr('fill', '#475569')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .style('letter-spacing', '0.08em')
        .style('text-transform', 'uppercase')
        .style('pointer-events', 'none');
    }

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, LinkType>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.52)
      .attr('stroke-width', 2.1)
      .attr('stroke-linecap', 'round');

    const nodeGroups = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, NodeType>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    nodeGroups
      .append('circle')
      .attr('r', (node) =>
        Math.max(
          4.2,
          Math.min(10.5, 4.2 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 1.25),
        ),
      )
      .attr('fill', (node) => node.color)
      .attr('fill-opacity', 0.98)
      .attr('stroke', (node) => toRgba(node.color, 0.3))
      .attr('stroke-width', 1.6);

    labels = nodeGroups
      .append('text')
      .text((node) => node.id)
      .attr('x', 0)
      .attr('y', (node) =>
        Math.max(
          13,
          Math.min(20, 11 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 1.25),
        ),
      )
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    updateLabelVisibility();

    const connections = new Map<string, Set<string>>();
    nodes.forEach((node) => {
      connections.set(node.id, new Set());
    });
    links.forEach((graphLink) => {
      const sourceId = getNodeId(graphLink.source);
      const targetId = getNodeId(graphLink.target);
      connections.get(sourceId)?.add(targetId);
      connections.get(targetId)?.add(sourceId);
    });

    const glossaryMap = new Map<string, GlossaryItem>();
    glossaryItems.forEach((item) => {
      glossaryMap.set(item.title, item);
    });
    nodeByIdRef.current = new Map(nodes.map((node) => [node.id, node]));

    const showNodeTooltip = (nodeId: string) => {
      const glossaryItem = glossaryMap.get(nodeId) ?? null;
      setTooltip({
        item: glossaryItem,
        connections: Array.from(connections.get(nodeId) ?? []).sort(),
        visible: glossaryItem !== null,
      });
    };

    const resetNodeStyles = () => {
      activeHighlightNodeIdsRef.current = new Set();
      emphasizedNodeIds = new Set();
      nodeGroups.style('opacity', 1);
      nodeGroups
        .select('circle')
        .attr('fill', (node) => node.color)
        .attr('stroke-width', 1.4);
      link
        .style('opacity', 0.52)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2.1);
      updateLabelVisibility();
    };

    const highlightNode = (nodeId: string, showTooltip = true) => {
      const selectedNode = nodeByIdRef.current.get(nodeId);
      const connected = connections.get(nodeId) ?? new Set();
      const activeNodes = new Set([nodeId, ...Array.from(connected)]);
      const highlightColor = selectedNode?.color ?? '#3b82f6';

      activeHighlightNodeIdsRef.current = activeNodes;
      emphasizedNodeIds = activeNodes;
      nodeGroups.style('opacity', 0.18);
      link.style('opacity', 0.05);

      nodeGroups
        .filter((node) => activeNodes.has(node.id))
        .style('opacity', 1)
        .select('circle')
        .attr('fill', (node) => {
          const baseColor = d3.color(node.color);
          return baseColor ? baseColor.brighter(0.4).formatHex() : node.color;
        })
        .attr('stroke-width', 2.2);

      link
        .filter(
          (graphLink) =>
            activeNodes.has(getNodeId(graphLink.source)) &&
            activeNodes.has(getNodeId(graphLink.target)),
        )
        .style('opacity', 0.85)
        .attr('stroke', highlightColor)
        .attr('stroke-width', 2.6);

      updateLabelVisibility();

      if (showTooltip) {
        showNodeTooltip(nodeId);
      }
    };

    applyNodeHighlightRef.current = highlightNode;
    clearNodeHighlightRef.current = () => {
      resetNodeStyles();
      hideTooltip();
    };

    nodeGroups.on('mouseenter', function (_event, d) {
      highlightNode(d.id, true);
    });

    nodeGroups.on('mouseleave', function () {
      if (focusedNodeIdRef.current) {
        highlightNode(focusedNodeIdRef.current, true);
        return;
      }

      resetNodeStyles();
      hideTooltip();
    });

    nodeGroups.on('click', function (_event, d) {
      const connected = Array.from(connections.get(d.id) ?? []);
      onNodeClickRef.current?.(d.id, connected);
      hideTooltip();
    });

    const simulation = d3
      .forceSimulation<NodeType, LinkType>(nodes)
      .force(
        'link',
        d3
          .forceLink<NodeType, LinkType>(links)
          .id((d) => d.id)
          .distance((graphLink) => {
            const baseDistance = graphLink.reciprocal ? 104 : 126;
            return Math.max(84, baseDistance - graphLink.strength * 2.2);
          })
          .strength((graphLink) =>
            Math.min(0.68, 0.14 + graphLink.strength * 0.05),
          ),
      )
      .force('charge', d3.forceManyBody().strength(-162))
      .force(
        'x',
        d3
          .forceX<NodeType>(
            (node) =>
              node.anchorX ??
              clusterLayouts.get(node.clusterKey)?.center.x ??
              width / 2,
          )
          .strength((node) => (node.area === 'stray' ? 0.4 : 0.34)),
      )
      .force(
        'y',
        d3
          .forceY<NodeType>(
            (node) =>
              node.anchorY ??
              clusterLayouts.get(node.clusterKey)?.center.y ??
              height / 2,
          )
          .strength((node) => (node.area === 'stray' ? 0.44 : 0.38)),
      )
      .force(
        'collision',
        d3
          .forceCollide<NodeType>()
          .radius(
            (node) => 17 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 2.9,
          ),
      );

    simulation.on('tick', () => {
      recenterNodesWithinClusters(nodes, clusterLayouts);
      constrainNodesToGroupLayouts(nodes, groupLayouts);

      link
        .attr('x1', (graphLink) => (graphLink.source as NodeType).x ?? 0)
        .attr('y1', (graphLink) => (graphLink.source as NodeType).y ?? 0)
        .attr('x2', (graphLink) => (graphLink.target as NodeType).x ?? 0)
        .attr('y2', (graphLink) => (graphLink.target as NodeType).y ?? 0);

      nodeGroups.attr(
        'transform',
        (node) => `translate(${node.x ?? 0},${node.y ?? 0})`,
      );
    });

    simulation.alpha(1).restart();
    const stopTimer = window.setTimeout(() => simulation.stop(), 3500);

    return () => {
      applyNodeHighlightRef.current = null;
      clearNodeHighlightRef.current = null;
      svg.on('.zoom', null);
      svg.on('click', null);
      window.clearTimeout(stopTimer);
      simulation.stop();
    };
  }, [glossaryItems, graphData, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    const query = focusQuery.trim().toLowerCase();
    const previousQuery = previousFocusQueryRef.current;
    previousFocusQueryRef.current = query;

    if (!query) {
      focusedNodeIdRef.current = null;
      clearNodeHighlightRef.current?.();
      hideTooltip();
      return;
    }

    const isDeleting =
      previousQuery.length > query.length && previousQuery.startsWith(query);
    if (isDeleting) {
      focusedNodeIdRef.current = null;
      clearNodeHighlightRef.current?.();
      hideTooltip();
      return;
    }

    const nodeById = nodeByIdRef.current;
    const matchedId =
      Array.from(nodeById.keys()).find((id) => id.toLowerCase() === query) ??
      Array.from(nodeById.keys()).find((id) =>
        id.toLowerCase().includes(query),
      );

    if (!matchedId) {
      focusedNodeIdRef.current = null;
      clearNodeHighlightRef.current?.();
      hideTooltip();
      return;
    }

    focusNode(matchedId);
  }, [focusQuery, focusRequestKey]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden', className)}
    >
      <svg
        ref={svgRef}
        className="block h-full w-full"
        style={{ cursor: 'grab' }}
      />
      {tooltip.visible && tooltip.item && (
        <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700/80 bg-slate-900/92 px-4 py-3 text-xs text-white shadow-xl backdrop-blur">
            <h3 className="mb-2 border-b border-slate-700 pb-1 text-sm font-semibold">
              {tooltip.item.title}
            </h3>
            {tooltip.item.description && (
              <p className="mb-2 text-slate-200">{tooltip.item.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
              <div>
                <span className="font-medium text-slate-400">Category: </span>
                <span className="text-slate-200">
                  {normalizeGlossaryCategory(tooltip.item.category) ||
                    STRAY_TERMS_LABEL}
                </span>
              </div>
              {tooltip.item.context && (
                <div>
                  <span className="font-medium text-slate-400">Context: </span>
                  <span className="text-slate-200">{tooltip.item.context}</span>
                </div>
              )}
              {tooltip.item.example && (
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-slate-400">Example: </span>
                  <span className="text-slate-300 italic">
                    {tooltip.item.example}
                  </span>
                </div>
              )}
            </div>
            {tooltip.connections.length > 0 && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <span className="font-medium text-slate-400">Related to: </span>
                <span className="text-slate-200">
                  {tooltip.connections.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
