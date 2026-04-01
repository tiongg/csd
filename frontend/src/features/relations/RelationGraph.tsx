import { useApiQuery } from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

type NodeType = SimulationNodeDatum & { id: string; x?: number; y?: number };
type LinkType = SimulationLinkDatum<NodeType> & {
  source: NodeType | string;
  target: NodeType | string;
};

type RelationGraphProps = {
  onNodeClick?: (nodeId: string, connections: string[]) => void;
  className?: string;
};

// Convert relations data to D3-compatible format
function buildGraph(glossaryItems: GlossaryItem[]): {
  nodes: NodeType[];
  links: LinkType[];
} {
  const nodes = new Map<string, NodeType>();
  const links: LinkType[] = [];
  const addedLinks = new Set<string>();

  for (const item of glossaryItems) {
    const source = item.title;

    if (!nodes.has(source)) {
      nodes.set(source, { id: source });
    }

    for (const target of item.relationships ?? []) {
      if (!nodes.has(target)) {
        nodes.set(target, { id: target });
      }

      // Create link (avoid duplicates)
      const linkKey =
        source < target ? `${source}-${target}` : `${target}-${source}`;
      if (!addedLinks.has(linkKey)) {
        addedLinks.add(linkKey);
        links.push({ source, target });
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    links,
  };
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
    if (!glossaryItems) return;

    const { nodes, links } = buildGraph(glossaryItems);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current?.clientWidth ?? 800;
    const height = svgRef.current?.clientHeight ?? 600;

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Setup zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Calculate node degrees for sizing
    const nodeDegrees = new Map<string, number>();
    for (const node of nodes) {
      nodeDegrees.set(
        node.id,
        links.filter((l) => l.source === node.id || l.target === node.id)
          .length,
      );
    }

    // Create force simulation for initial layout
    const simulation = d3
      .forceSimulation<NodeType, LinkType>(nodes)
      .force(
        'link',
        d3.forceLink<NodeType, LinkType>(links).id((d) => d.id),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(15));

    // Create links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, LinkType>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1);

    // Create node groups (circle + label)
    const nodeGroups = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, NodeType>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Add circles to node groups
    nodeGroups
      .append('circle')
      .attr('r', (d) => 4 + nodeDegrees.get(d.id)! * 0.5)
      .attr('fill', '#3b82f6');

    // Add labels below nodes
    nodeGroups
      .append('text')
      .text((d) => d.id)
      .attr('x', 0)
      .attr('y', (d) => 12 + nodeDegrees.get(d.id)! * 0.5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .style('cursor', 'pointer');

    // Store connected nodes for each node and create glossary lookup
    const connections = new Map<string, Set<string>>();
    const glossaryMap = new Map<string, GlossaryItem>();
    for (const item of glossaryItems) {
      glossaryMap.set(item.title, item);
      const source = item.title;
      if (!connections.has(source)) {
        connections.set(source, new Set());
      }
      for (const target of item.relationships ?? []) {
        connections.get(source)!.add(target);
        if (!connections.has(target)) {
          connections.set(target, new Set());
        }
        connections.get(target)!.add(source);
      }
    }

    // Hover effects
    nodeGroups.on('mouseenter', function (event, d) {
      const connected = connections.get(d.id) ?? new Set();

      // Dim all nodes and links first
      nodeGroups.style('opacity', 0.2);
      link.style('opacity', 0.1);

      // Highlight connected nodes and links
      nodeGroups
        .filter((n) => n.id === d.id || connected.has(n.id))
        .style('opacity', 1)
        .select('circle')
        .attr('fill', '#2563eb');

      // Highlight links to/from this node
      link
        .filter(
          (l) =>
            (l.source as NodeType).id === d.id ||
            (l.target as NodeType).id === d.id,
        )
        .style('opacity', 0.8)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2);

      // Show tooltip
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
      // Reset all styles
      nodeGroups.style('opacity', 1).select('circle').attr('fill', '#3b82f6');
      link
        .style('opacity', 0.4)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1);
      setTooltip((prev) => ({ ...prev, visible: false }));
    });

    // Click handler
    nodeGroups.on('click', function (_e, d) {
      const connected = Array.from(connections.get(d.id) ?? []);
      onNodeClick?.(d.id, connected);
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as NodeType).x ?? 0)
        .attr('y1', (d) => (d.source as NodeType).y ?? 0)
        .attr('x2', (d) => (d.target as NodeType).x ?? 0)
        .attr('y2', (d) => (d.target as NodeType).y ?? 0);

      nodeGroups.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Stop simulation after initial layout to save resources
    simulation.alpha(1).restart();
    setTimeout(() => simulation.stop(), 2000);

    // Cleanup
    return () => {
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
