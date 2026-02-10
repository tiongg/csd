import { generateColorFromString } from '@/lib/utils';
import { defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { useAuth } from './AuthContext';

export type SectionType = Y.Map<unknown>;
export type ContentType = 'markdown' | 'quiz';

export type ContentEditorContextType = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  currentSection: number;
  setCurrentSection: Dispatch<SetStateAction<number>>;
  getDocAsJson: () => string;
  deleteSection: (index: number) => void;
  addSection: () => void;
};

const ContentEditorContext = createContext<ContentEditorContextType | null>(
  null,
);

type ContentEditorProviderProps = PropsWithChildren<{
  roomName: string;
}>;

export function ContentEditorProvider({
  children,
  roomName,
}: ContentEditorProviderProps) {
  const { user } = useAuth();
  const [doc] = useState(() => new Y.Doc());
  const [provider] = useState(
    () =>
      new WebsocketProvider(import.meta.env.VITE_WS_URL!, roomName, doc, {
        connect: false,
      }),
  );

  const [currentSection, setCurrentSection] = useState(-1);

  useEffect(() => {
    provider.awareness.setLocalStateField('user', {
      name: user?.username ?? 'Anonymous',
      color: generateColorFromString(user?.username ?? 'Anonymous'),
    });
    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [provider, user]);

  function getDocAsJson() {
    const rootArray = doc.getArray<SectionType>('root');
    let res = '';

    for (const node of rootArray) {
      if ((node.get('type') as ContentType) !== 'markdown') {
        continue;
      }
      const pmNode = yXmlFragmentToProseMirrorRootNode(
        node.get('content') as Y.XmlFragment,
        schema,
      );
      const markdownOutput = defaultMarkdownSerializer.serialize(pmNode);
      res += markdownOutput + '\n\n';
    }

    return res;
  }

  function deleteSection(index: number) {
    doc.transact(() => {
      const rootArray = doc.getArray<SectionType>('root');
      rootArray.delete(index, 1);

      if (currentSection >= index) {
        setCurrentSection(currentSection - 1);
      }
    });
  }

  function addSection() {
    doc.transact(() => {
      const rootArray = doc.getArray<SectionType>('root');
      const title = new Y.Text();
      title.insert(0, `Section ${rootArray.length + 1}`);

      const section = new Y.Map<unknown>();
      section.set('title', title);
      section.set('content', new Y.XmlFragment());
      section.set('type', 'markdown' as ContentType);

      rootArray.push([section]);
    });
  }

  return (
    <ContentEditorContext.Provider
      value={{
        doc,
        provider,
        currentSection,
        setCurrentSection,
        getDocAsJson,
        deleteSection,
        addSection,
      }}
    >
      {children}
    </ContentEditorContext.Provider>
  );
}

export function useContentEditor(): ContentEditorContextType {
  const context = useContext(ContentEditorContext);
  if (!context) {
    throw new Error('ContentEditor context missing!');
  }
  return context;
}
