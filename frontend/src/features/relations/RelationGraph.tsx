import { useApiQuery } from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

const MAX_LINKS_PER_NODE = 3;

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
  sharedNeighborCount: number;
  strength: number;
  reciprocal: boolean;
};

type RelationGraphProps = {
  onNodeClick?: (nodeId: string, connections: string[]) => void;
  className?: string;
};

function buildGraph(glossaryItems: GlossaryItem[]): {
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
          sharedNeighborCount: 0,
          strength: 1,
          reciprocal: false,
        });
      }
    });
  });

  const candidates = Array.from(edgeCandidates.values()).map((candidate) => {
    const sourceNeighbors = outgoing.get(candidate.source) ?? new Set<string>();
    const targetNeighbors = outgoing.get(candidate.target) ?? new Set<string>();

    let sharedNeighborCount = 0;
    sourceNeighbors.forEach((neighbor) => {
      if (neighbor !== candidate.target && targetNeighbors.has(neighbor)) {
        sharedNeighborCount += 1;
      }
    });

    const reciprocal = candidate.directedCount > 1;
    const strength =
      candidate.directedCount * 2 + Math.min(sharedNeighborCount, 2);

    return {
      ...candidate,
      sharedNeighborCount,
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
      if (a.reciprocal !== b.reciprocal) {
        return a.reciprocal ? -1 : 1;
      }
      if (a.strength !== b.strength) {
        return b.strength - a.strength;
      }
      return b.sharedNeighborCount - a.sharedNeighborCount;
    });

    selectedByNode.set(
      nodeId,
      new Set(ranked.slice(0, MAX_LINKS_PER_NODE).map((edge) => edge.key)),
    );
  });

  const keptEdges = new Map<string, EdgeCandidate>();
  candidates.forEach((candidate) => {
    const selectedBySource =
      selectedByNode.get(candidate.source)?.has(candidate.key) ?? false;
    const selectedByTarget =
      selectedByNode.get(candidate.target)?.has(candidate.key) ?? false;

    if (candidate.reciprocal || (selectedBySource && selectedByTarget)) {
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

function getNodeId(value: NodeType | string) {
  return typeof value === 'string' ? value : value.id;
}

function buildComponentLookup(nodes: NodeType[], links: LinkType[]) {
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

  const radius = Math.max(
    90,
    Math.min(width, height) * 0.24,
  );

  for (let i = 0; i < componentCount; i += 1) {
    const angle = (i / componentCount) * Math.PI * 2;
    centers.set(i, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return centers;
}

export default function RelationGraph({
  onNodeClick,
  className = '',
}: RelationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: GlossaryItem | null;
    connections: string[];
    visible: boolean;
  }>({ x: 0, y: 0, item: null, connections: [], visible: false });
  const { data: glossaryItems } = useApiQuery('get', '/api/glossary/');

  useEffect(() => {
    if (!glossaryItems || !svgRef.current) return;

    const { nodes, links } = buildGraph(glossaryItems);
    const { componentByNode, componentCount } = buildComponentLookup(nodes, links);
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    const componentCenters = buildComponentCenters(componentCount, width, height);

    nodes.forEach((node) => {
      node.cluster = componentByNode.get(node.id) ?? 0;
    });

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);

    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

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

    const clusterColor = d3
      .scaleOrdinal<number, string>(d3.schemeTableau10)
      .domain(d3.range(Math.max(1, componentCount)));

    const linkForce = d3
      .forceLink<NodeType, LinkType>(links)
      .id((d) => d.id)
      .distance((graphLink) => {
        const baseDistance = graphLink.reciprocal ? 58 : 78;
        return Math.max(42, baseDistance - graphLink.strength * 4);
      })
      .strength((graphLink) => Math.min(0.95, 0.22 + graphLink.strength * 0.12));

    const simulation = d3
      .forceSimulation<NodeType, LinkType>(nodes)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(-130))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'x',
        d3
          .forceX<NodeType>((node) => componentCenters.get(node.cluster ?? 0)?.x ?? width / 2)
          .strength(0.12),
      )
      .force(
        'y',
        d3
          .forceY<NodeType>((node) => componentCenters.get(node.cluster ?? 0)?.y ?? height / 2)
          .strength(0.12),
      )
      .force(
        'collision',
        d3
          .forceCollide<NodeType>()
          .radius((node) => 8 + Math.sqrt(nodeDegrees.get(node.id) ?? 0) * 2.2),
      );

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, LinkType>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.32)
      .attr('stroke-width', 1.2);

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

    nodeGroups
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
      .style('user-select', 'none')
      .style('opacity', 0.95);

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

    nodeGroups.on('mouseenter', function (event, d) {
      const connected = connections.get(d.id) ?? new Set();
      const activeNodes = new Set([d.id, ...Array.from(connected)]);

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

      nodeGroups
        .filter((node) => activeNodes.has(node.id))
        .select('text')
        .style('opacity', 1);

      link
        .filter(
          (graphLink) =>
            activeNodes.has(getNodeId(graphLink.source)) &&
            activeNodes.has(getNodeId(graphLink.target)),
        )
        .style('opacity', 0.85)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1.2);

      setTooltip({
        x: event.clientX + 10,
        y: event.clientY - 10,
        item: glossaryMap.get(d.id) ?? null,
        connections: Array.from(connected).sort(),
        visible: true,
      });
    });

    nodeGroups.on('mousemove', function (event) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX + 10,
        y: event.clientY - 10,
      }));
    });

    nodeGroups.on('mouseleave', function () {
      nodeGroups.style('opacity', 1);
      nodeGroups
        .select('circle')
        .attr('fill', (node) => clusterColor(node.cluster ?? 0))
        .attr('stroke-width', 1.4);
      nodeGroups.select('text').style('opacity', 0.95);
      link
        .style('opacity', 0.32)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.2);
      setTooltip((prev) => ({ ...prev, visible: false }));
    });

    nodeGroups.on('click', function (_e, d) {
      const connected = Array.from(connections.get(d.id) ?? []);
      onNodeClick?.(d.id, connected);
      setTooltip((prev) => ({ ...prev, visible: false }));
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
      window.clearTimeout(stopTimer);
      simulation.stop();
    };
  }, [onNodeClick, glossaryItems]);

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden',
        className,
      )}
    >
      <svg
        ref={svgRef}
        className="h-full w-full flex-1"
        style={{ cursor: 'grab' }}
      />
      {tooltip.visible && tooltip.item && (
        <div
          className="pointer-events-none fixed z-50 w-72 rounded-md bg-slate-900 px-4 py-3 text-xs text-white shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <h3 className="mb-2 border-b border-slate-700 pb-1 text-sm font-semibold">
            {tooltip.item.title}
          </h3>
          {tooltip.item.description && (
            <p className="mb-2 text-slate-200">{tooltip.item.description}</p>
          )}
          {tooltip.item.context && (
            <div className="mb-2">
              <span className="font-medium text-slate-400">Context: </span>
              <span className="text-slate-200">{tooltip.item.context}</span>
            </div>
          )}
          {tooltip.item.example && (
            <div className="mb-2">
              <span className="font-medium text-slate-400">Example: </span>
              <span className="text-slate-300 italic">
                {tooltip.item.example}
              </span>
            </div>
          )}
          {tooltip.connections.length > 0 && (
            <div className="mt-2 border-t border-slate-700 pt-2">
              <span className="font-medium text-slate-400">Related to: </span>
              <span className="text-slate-200">
                {tooltip.connections.join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
