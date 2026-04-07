import { useApiQuery } from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

const MAX_LINKS_PER_NODE = 3;
const MAX_COMPONENT_SIZE = 18;
const SEARCH_FOCUS_SCALE = 2.75;
const SEARCH_FOCUS_DURATION_MS = 500;
const LABEL_VISIBILITY_SCALE = 0.98;
export const RELATION_CLUSTER_COLORS = d3.schemeTableau10;

type NodeType = SimulationNodeDatum & {
  id: string;
  cluster?: number;
  x?: number;
  y?: number;
};
type LinkType = SimulationLinkDatum<NodeType> & {
  source: NodeType | string;
  target: NodeType | string;
  strength: number;
  reciprocal: boolean;
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

type RelationGraphProps = {
  onNodeClick?: (nodeId: string, connections: string[]) => void;
  className?: string;
  focusQuery?: string;
  focusRequestKey?: number;
};

export function buildGraph(glossaryItems: GlossaryItem[]): {
  nodes: NodeType[];
  links: LinkType[];
} {
  const nodesById = new Map<string, NodeType>();
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
      if (target === source) {
        return;
      }
      if (!nodesById.has(target)) {
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
    const unionNeighborCount = new Set([
      ...sourceContext,
      ...targetContext,
    ]).size;
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
      ((selectedBySource && selectedByTarget) &&
        (hasLocalSupport || touchesLeaf))
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
    if (!strongest) {
      return;
    }

    if (!keptEdges.has(strongest.key)) {
      keptEdges.set(strongest.key, strongest);
      degreeByNode.set(strongest.source, (degreeByNode.get(strongest.source) ?? 0) + 1);
      degreeByNode.set(strongest.target, (degreeByNode.get(strongest.target) ?? 0) + 1);
    }
  });

  const buildComponentsFromEdges = (edges: EdgeCandidate[]) => {
    const adjacency = new Map<string, Set<string>>();
    nodesById.forEach((_, id) => {
      adjacency.set(id, new Set());
    });

    edges.forEach((edge) => {
      adjacency.get(edge.source)?.add(edge.target);
      adjacency.get(edge.target)?.add(edge.source);
    });

    const visited = new Set<string>();
    const components: string[][] = [];

    nodesById.forEach((_, id) => {
      if (visited.has(id)) {
        return;
      }

      const queue = [id];
      const component: string[] = [];
      visited.add(id);

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) {
          continue;
        }

        component.push(current);
        adjacency.get(current)?.forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      components.push(component);
    });

    return components;
  };

  const getEdgeRetentionScore = (edge: EdgeCandidate) =>
    edge.sharedNeighborCount * 18 +
    edge.jaccardScore * 24 +
    (edge.reciprocal ? 8 : 0) +
    edge.strength * 4 -
    Math.min(edge.sourceDegree, edge.targetDegree) * 2;

  while (true) {
    const components = buildComponentsFromEdges(Array.from(keptEdges.values()));
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

export function getNodeId(value: NodeType | string) {
  return typeof value === 'string' ? value : value.id;
}

export function buildComponentLookup(nodes: NodeType[], links: LinkType[]) {
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((node) => {
    adjacency.set(node.id, new Set());
  });
  links.forEach((link) => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    adjacency.get(sourceId)?.add(targetId);
    adjacency.get(targetId)?.add(sourceId);
  });

  const componentByNode = new Map<string, number>();
  let componentCount = 0;

  nodes.forEach((node) => {
    if (componentByNode.has(node.id)) {
      return;
    }

    const queue: string[] = [node.id];
    componentByNode.set(node.id, componentCount);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      adjacency.get(current)?.forEach((neighbor) => {
        if (!componentByNode.has(neighbor)) {
          componentByNode.set(neighbor, componentCount);
          queue.push(neighbor);
        }
      });
    }

    componentCount += 1;
  });

  return {
    componentByNode,
    componentCount,
  };
}

function buildComponentCenters(componentCount: number, width: number, height: number) {
  const centers = new Map<number, { x: number; y: number }>();
  const centerX = width / 2;
  const centerY = height / 2;

  if (componentCount <= 1) {
    centers.set(0, { x: centerX, y: centerY });
    return centers;
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const radialStep = Math.max(46, Math.min(width, height) * 0.058);

  for (let i = 0; i < componentCount; i += 1) {
    const radius = i === 0 ? 0 : radialStep * Math.sqrt(i);
    const angle = i * goldenAngle;

    centers.set(i, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  return centers;
}

export default function RelationGraph({
  onNodeClick,
  className = '',
  focusQuery = '',
  focusRequestKey = 0,
}: RelationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const zoomTransformRef = useRef(d3.zoomIdentity);
  const suppressTooltipDismissRef = useRef(false);
  const focusTimeoutRef = useRef<number | null>(null);
  const previousFocusQueryRef = useRef('');
  const focusedNodeIdRef = useRef<string | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const nodeByIdRef = useRef<Map<string, NodeType>>(new Map());
  const glossaryByIdRef = useRef<Map<string, GlossaryItem>>(new Map());
  const connectionsRef = useRef<Map<string, Set<string>>>(new Map());
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
  const { data: glossaryItems } = useApiQuery('get', '/api/glossary/');

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
    if (
      !glossaryItems ||
      !svgRef.current ||
      viewportSize.width <= 0 ||
      viewportSize.height <= 0
    ) {
      return;
    }

    const { nodes, links } = buildGraph(glossaryItems);
    const { componentByNode, componentCount } = buildComponentLookup(nodes, links);
    const width = viewportSize.width;
    const height = viewportSize.height;
    const componentCenters = buildComponentCenters(
      componentCount,
      width,
      height,
    );
    viewportRef.current = { width, height };

    nodes.forEach((node) => {
      node.cluster = componentByNode.get(node.id) ?? 0;
    });

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

    const nodesByCluster = new Map<number, NodeType[]>();
    nodes.forEach((node) => {
      const clusterId = node.cluster ?? 0;
      const clusterNodes = nodesByCluster.get(clusterId) ?? [];
      clusterNodes.push(node);
      nodesByCluster.set(clusterId, clusterNodes);
    });

    nodesByCluster.forEach((clusterNodes, clusterId) => {
      const center = componentCenters.get(clusterId) ?? { x: width / 2, y: height / 2 };
      const sortedClusterNodes = [...clusterNodes].sort((a, b) => {
        const degreeDifference =
          (nodeDegrees.get(b.id) ?? 0) - (nodeDegrees.get(a.id) ?? 0);

        if (degreeDifference !== 0) {
          return degreeDifference;
        }

        return a.id.localeCompare(b.id);
      });

      let placedCount = 0;
      let ringIndex = 0;

      while (placedCount < sortedClusterNodes.length) {
        const ringNodeCount =
          ringIndex === 0
            ? 1
            : Math.min(sortedClusterNodes.length - placedCount, Math.max(6, ringIndex * 8));
        const radius = ringIndex === 0 ? 0 : ringIndex * 28;
        const angleOffset = clusterId * 0.45 + (ringIndex % 2 === 0 ? 0 : Math.PI / 10);

        for (let i = 0; i < ringNodeCount; i += 1) {
          const node = sortedClusterNodes[placedCount + i];
          if (!node) {
            continue;
          }

          if (ringIndex === 0) {
            node.x = center.x;
            node.y = center.y;
            continue;
          }

          const angle = angleOffset + (i / ringNodeCount) * Math.PI * 2;
          node.x = center.x + Math.cos(angle) * radius;
          node.y = center.y + Math.sin(angle) * radius * 0.8;
        }

        placedCount += ringNodeCount;
        ringIndex += 1;
      }
    });

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);
    svgSelectionRef.current = svg;

    const g = svg.append('g');
    let emphasizedNodeIds = new Set<string>();
    let labels:
      | d3.Selection<SVGTextElement, NodeType, SVGGElement, unknown>
      | null = null;
    const updateLabelVisibility = () => {
      if (!labels) {
        return;
      }

      const showAllLabels = zoomTransformRef.current.k >= LABEL_VISIBILITY_SCALE;
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
        if (!suppressTooltipDismissRef.current && focusedNodeIdRef.current === null) {
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

    const clusterColor = d3
      .scaleOrdinal<number, string>(RELATION_CLUSTER_COLORS)
      .domain(d3.range(Math.max(1, componentCount)));

    const linkForce = d3
      .forceLink<NodeType, LinkType>(links)
      .id((d) => d.id)
      .distance((graphLink) => {
        const baseDistance = graphLink.reciprocal ? 96 : 118;
        return Math.max(76, baseDistance - graphLink.strength * 3);
      })
      .strength((graphLink) => Math.min(0.85, 0.2 + graphLink.strength * 0.1));

    const simulation = d3
      .forceSimulation<NodeType, LinkType>(nodes)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(-165))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'x',
        d3
          .forceX<NodeType>((node) => componentCenters.get(node.cluster ?? 0)?.x ?? width / 2)
          .strength(0.11),
      )
      .force(
        'y',
        d3
          .forceY<NodeType>((node) => componentCenters.get(node.cluster ?? 0)?.y ?? height / 2)
          .strength(0.22),
      )
      .force(
        'collision',
        d3
          .forceCollide<NodeType>()
          .radius((node) => 14 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 2.8),
      );

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, LinkType>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.55)
      .attr('stroke-width', 2.2)
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
        Math.max(4.2, Math.min(10.5, 4.2 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 1.25)),
      )
      .attr('fill', (node) => clusterColor(node.cluster ?? 0))
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.4);

    labels = nodeGroups
      .append('text')
      .text((node) => node.id)
      .attr('x', 0)
      .attr('y', (node) =>
        Math.max(13, Math.min(20, 11 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 1.25)),
      )
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .attr('font-size', '10.5px')
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
    for (const item of glossaryItems) {
      glossaryMap.set(item.title, item);
    }
    glossaryByIdRef.current = glossaryMap;
    connectionsRef.current = connections;
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
        .attr('fill', (node) => clusterColor(node.cluster ?? 0))
        .attr('stroke-width', 1.4);
      link
        .style('opacity', 0.55)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2.2);
      updateLabelVisibility();
    };

    const highlightNode = (nodeId: string, showTooltip = true) => {
      const connected = connections.get(nodeId) ?? new Set();
      const activeNodes = new Set([nodeId, ...Array.from(connected)]);

      activeHighlightNodeIdsRef.current = activeNodes;
      emphasizedNodeIds = activeNodes;
      nodeGroups.style('opacity', 0.2);
      link.style('opacity', 0.06);

      nodeGroups
        .filter((node) => activeNodes.has(node.id))
        .style('opacity', 1)
        .select('circle')
        .attr('fill', (node) => {
          const baseColor = d3.color(clusterColor(node.cluster ?? 0));
          return baseColor ? baseColor.brighter(0.35).formatHex() : '#3b82f6';
        })
        .attr('stroke-width', 2.2);

      link
        .filter(
          (graphLink) =>
            activeNodes.has(getNodeId(graphLink.source)) &&
            activeNodes.has(getNodeId(graphLink.target)),
        )
        .style('opacity', 0.85)
        .attr('stroke', '#3b82f6')
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

    nodeGroups.on('click', function (_e, d) {
      const connected = Array.from(connections.get(d.id) ?? []);
      onNodeClickRef.current?.(d.id, connected);
      hideTooltip();
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (graphLink) => (graphLink.source as NodeType).x ?? 0)
        .attr('y1', (graphLink) => (graphLink.source as NodeType).y ?? 0)
        .attr('x2', (graphLink) => (graphLink.target as NodeType).x ?? 0)
        .attr('y2', (graphLink) => (graphLink.target as NodeType).y ?? 0);

      nodeGroups.attr('transform', (node) => `translate(${node.x ?? 0},${node.y ?? 0})`);
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
  }, [glossaryItems, viewportSize.height, viewportSize.width]);

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
      Array.from(nodeById.keys()).find((id) => id.toLowerCase().includes(query));

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
      className={cn(
        'absolute inset-0 overflow-hidden',
        className,
      )}
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
