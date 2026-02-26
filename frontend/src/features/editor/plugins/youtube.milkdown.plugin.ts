// Modified from:
// https://milkdown.dev/docs/plugin/example-iframe-plugin

import type { MilkdownPlugin } from '@milkdown/kit/ctx';
import { InputRule } from '@milkdown/kit/prose/inputrules';
import { Node } from '@milkdown/kit/prose/model';
import { $inputRule, $node, $remark } from '@milkdown/kit/utils';
import directive from 'remark-directive';

const remarkDirective = $remark('remarkDirective', () => directive);

const iframeInputRule = $inputRule(
  (ctx) =>
    new InputRule(
      /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=(?<id>[^&]+)/,
      (state, match, start, end) => {
        const [full, id = ''] = match;
        const { tr } = state;
        if (full) {
          tr.replaceWith(
            start - 1,
            end,
            iframeNode
              .type(ctx)
              .create({ src: `https://www.youtube.com/embed/${id}` }),
          );
        }
        return tr;
      },
    ),
);

const iframeNode = $node('iframe', () => ({
  group: 'block', // Block-level node
  atom: true, // Cannot be split
  isolating: true, // Cannot be merged with adjacent nodes
  marks: '', // No marks allowed
  attrs: {
    src: { default: null }, // URL attribute
  },
  parseDOM: [
    {
      tag: 'iframe',
      getAttrs: (dom) => {
        const src = (dom as HTMLElement).getAttribute('src');
        if (!src) return false;
        try {
          const url = new URL(src, 'https://www.youtube.com');
          const isHttpOrHttps =
            url.protocol === 'https:' || url.protocol === 'http:';
          const isYouTubeHost =
            url.hostname === 'www.youtube.com' ||
            url.hostname === 'youtube.com';
          const isEmbedPath = url.pathname.startsWith('/embed/');
          if (isHttpOrHttps && isYouTubeHost && isEmbedPath) {
            return { src: url.toString() };
          }
        } catch {
          return false;
        }
        return false;
      },
    },
  ],
  toDOM: (node: Node) => [
    'iframe',
    {
      ...node.attrs,
      contenteditable: false, // Prevent editing iframe content
      class: 'aspect-video h-98',
      referrerpolicy: 'strict-origin-when-cross-origin',
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    },
    0,
  ],
  parseMarkdown: {
    match: (node) => node.type === 'leafDirective' && node.name === 'iframe',
    runner: (state, node, type) => {
      const src = (node.attributes as { src?: string }).src;
      if (typeof src !== 'string') return;
      if (!/^https?:\/\/(?:www\.)?youtube\.com\/embed\/[^&]+/.test(src)) return;

      state.addNode(type, { src });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'iframe',
    runner: (state, node) => {
      state.addNode('leafDirective', undefined, undefined, {
        name: 'iframe',
        attributes: { src: node.attrs.src },
      });
    },
  },
}));

export const youtubeIframePlugin: MilkdownPlugin[] = [
  remarkDirective as any,
  iframeNode,
  iframeInputRule,
];
