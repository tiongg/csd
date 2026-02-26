import useCrepeEditor from '@/hooks/useCrepeEditor';
import { schemaCtx, serializerCtx } from '@milkdown/kit/core';
import { type Schema } from '@milkdown/prose/model';
import { Milkdown, MilkdownProvider } from '@milkdown/react';
import { type Serializer } from '@milkdown/transformer';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
  type RefObject,
} from 'react';

export type EditorSchemaContextType = {
  schema: RefObject<Schema | null>;
  serializer: RefObject<Serializer | null>;
};

const EditorSchemaContext = createContext<EditorSchemaContextType | null>(null);

/**
 * Creates a one-time editor instance to extract the schema and serializer.
 * This schema is shared across all editor instances to ensure consistency
 * for serialization/deserialization of Yjs fragments.
 */
function SchemaExtractor({
  onReady,
}: {
  onReady: (schema: any, serializer: Serializer) => void;
}) {
  const { get: getEditor } = useCrepeEditor();

  useEffect(() => {
    const editorInstance = getEditor();
    if (!editorInstance) return;

    editorInstance.action((ctx) => {
      try {
        const schema = ctx.get(schemaCtx);
        const serializer = ctx.get(serializerCtx);
        onReady(schema, serializer);
      } catch {}
    });
  }, [getEditor, onReady]);

  // Render off-screen - Milkdown needs a container
  return (
    <div className="absolute left-[-9999px] hidden h-0 w-0 overflow-hidden">
      <Milkdown />
    </div>
  );
}

export function EditorSchemaProvider({ children }: PropsWithChildren) {
  const schemaRef = useRef<Schema | null>(null);
  const serializerRef = useRef<Serializer | null>(null);

  return (
    <EditorSchemaContext.Provider
      value={{ schema: schemaRef, serializer: serializerRef }}
    >
      <MilkdownProvider>
        <SchemaExtractor
          onReady={(schema, serializer) => {
            schemaRef.current = schema;
            serializerRef.current = serializer;
          }}
        />
      </MilkdownProvider>
      {children}
    </EditorSchemaContext.Provider>
  );
}

export function useEditorSchema() {
  const context = useContext(EditorSchemaContext);
  if (!context) {
    throw new Error('EditorSchema context missing!');
  }
  return context;
}
