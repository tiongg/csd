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

export type SectionType = Y.Map<any>;

export type ContentEditorContextType = {
  doc: Y.Doc;
  provider: WebsocketProvider;

  currentSection: number;
  setCurrentSection: Dispatch<SetStateAction<number>>;

  getDocAsJson: () => any;
  deleteSection: (index: number) => void;
  addSection: () => void;
};

const ContentEditorContext = createContext<ContentEditorContextType | null>(
  null,
);

type ContentEditorProviderProps = PropsWithChildren<{
  roomName: string;
}>;

function generateColorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color =
    '#' +
    ((hash >> 24) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 16) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 8) & 0xff).toString(16).padStart(2, '0');
  return color;
}

export function ContentEditorProvider({
  children,
  roomName,
}: ContentEditorProviderProps) {
  const { user } = useAuth();
  const [doc] = useState(new Y.Doc());
  const [provider] = useState(
    new WebsocketProvider(import.meta.env.VITE_WS_URL!, roomName, doc, {
      connect: false,
    }),
  );

  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    provider.awareness.setLocalStateField('user', {
      name: user?.username ?? 'Anonymous',
      color: generateColorFromString(user?.username ?? 'Anonymous'),
    });
    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [roomName, doc]);

  function getDocAsJson() {
    let res = '';
    const rootArray = doc.getArray<SectionType>('root');
    for (const node of rootArray) {
      const pmNode = yXmlFragmentToProseMirrorRootNode(
        node.get('content'),
        schema,
      );
      const markdownOutput = defaultMarkdownSerializer.serialize(pmNode);
      res += markdownOutput + '\n\n';
    }

    return res;
  }

  function deleteSection(index: number) {
    doc.transact(() => {
      const rootArray = doc.getArray<any>('root');
      rootArray.delete(index, 1);
      // Adjust currentSection if necessary
      if (currentSection >= index && currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    });
  }

  function addSection() {
    doc.transact(() => {
      const rootArray = doc.getArray<SectionType>('root');
      const title = new Y.Text();
      title.insert(0, `Section ${rootArray.length + 1}`);

      const section = new Y.Map();

      section.set('title', title);
      section.set('content', new Y.XmlFragment());

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

export function useContentEditor() {
  const context = useContext(ContentEditorContext);
  if (!context) {
    throw new Error('ContentEditor context missing!');
  }
  return context;
}
