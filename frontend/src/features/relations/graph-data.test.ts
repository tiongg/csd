import { describe, expect, it } from 'vitest';

import {
  buildGroupedRelationGraph,
  normalizeGlossaryCategory,
  STRAY_TERMS_LABEL,
} from './graph-data';

describe('buildGroupedRelationGraph', () => {
  it('keeps multiple disconnected clusters inside the same category', () => {
    const graph = buildGroupedRelationGraph([
      {
        title: 'Aura farming',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Vibes',
        relationships: ['Locked in'],
      },
      {
        title: 'Locked in',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Vibes',
        relationships: ['Aura farming'],
      },
      {
        title: 'Cooked',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Vibes',
        relationships: ['Delulu'],
      },
      {
        title: 'Delulu',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Vibes',
        relationships: ['Cooked'],
      },
    ]);

    expect(graph.categories).toHaveLength(1);
    expect(graph.categories[0]?.clusters).toHaveLength(2);
    expect(graph.links).toHaveLength(2);
    expect(graph.nodes.every((node) => node.groupId === 'Social Media')).toBe(
      true,
    );
  });

  it('keeps isolated categorized nodes visible as singleton clusters', () => {
    const graph = buildGroupedRelationGraph([
      {
        title: 'Side quest',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Lore',
        relationships: [],
      },
      {
        title: 'NPC energy',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Lore',
        relationships: [],
      },
    ]);

    expect(graph.categories[0]?.clusters).toHaveLength(2);
    expect(
      graph.categories[0]?.clusters.every((cluster) => cluster.items.length === 1),
    ).toBe(true);
  });

  it('places uncategorized linked and unlinked terms in the stray group', () => {
    const graph = buildGroupedRelationGraph([
      {
        title: 'Brainrot',
        description: 'desc',
        context: 'context',
        example: 'example',
        relationships: ['Skibidi'],
      },
      {
        title: 'Skibidi',
        description: 'desc',
        context: 'context',
        example: 'example',
        relationships: ['Brainrot'],
      },
      {
        title: 'Ohio core',
        description: 'desc',
        context: 'context',
        example: 'example',
        relationships: [],
      },
    ]);

    expect(graph.stray?.label).toBe(STRAY_TERMS_LABEL);
    expect(graph.stray?.clusters).toHaveLength(2);
    expect(graph.stray?.clusters[0]?.items).toHaveLength(2);
    expect(graph.stray?.clusters[1]?.items).toHaveLength(1);
  });

  it('does not render cross-category links', () => {
    const graph = buildGroupedRelationGraph([
      {
        title: 'Main character',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Persona',
        relationships: ['Aura farming', 'Sigma'],
      },
      {
        title: 'Aura farming',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Persona',
        relationships: ['Main character'],
      },
      {
        title: 'Sigma',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Mindset',
        relationships: ['Main character'],
      },
    ]);

    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]).toMatchObject({
      source: 'Aura farming',
      target: 'Main character',
    });
  });

  it('normalizes detailed labels into broader category buckets', () => {
    expect(normalizeGlossaryCategory('Meme Slang')).toBe('Social Media');
    expect(normalizeGlossaryCategory('Mindset & Study')).toBe('Education');
    expect(normalizeGlossaryCategory('Lore')).toBe('Entertainment');
  });

  it('folds tiny unmatched categories into General', () => {
    const graph = buildGroupedRelationGraph([
      {
        title: 'Hyperpop',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Niche Aesthetic',
        relationships: [],
      },
      {
        title: 'Corecore',
        description: 'desc',
        context: 'context',
        example: 'example',
        category: 'Internet Ephemera',
        relationships: [],
      },
    ]);

    expect(graph.categories).toHaveLength(1);
    expect(graph.categories[0]).toMatchObject({
      id: 'General',
      label: 'General',
    });
    expect(graph.categories[0]?.clusters).toHaveLength(2);
  });
});
