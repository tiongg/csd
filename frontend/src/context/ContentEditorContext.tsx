import { generateColorFromString, type Course } from '@/lib/utils';
import { defaultMarkdownSerializer, schema } from 'prosemirror-markdown';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import type { TypedArray, TypedDoc, TypedMap } from 'yjs-types';
import { useAuth } from './AuthContext';

export type ContentType = 'markdown' | 'quiz';
export type SectionType = TypedMap<
  {
    title: Y.Text;
  } & (
    | {
        content: Y.XmlFragment;
        type: 'markdown';
      }
    | {
        content: Y.Map<any>;
        type: 'quiz';
      }
  )
>;
export type DocType = TypedDoc<
  any, // For typing maps
  {
    root: TypedArray<SectionType>;
  }
>;

export type ContentEditorContextType = {
  course: Course;

  doc: DocType;
  provider: WebsocketProvider;
  currentSection: number;
  setCurrentSection: Dispatch<SetStateAction<number>>;
  getDocAsJson: () => string;
  deleteSection: (index: number) => void;
  addSection: (type: ContentType) => void;
};

const ContentEditorContext = createContext<ContentEditorContextType | null>(
  null,
);

type ContentEditorProviderProps = PropsWithChildren<{
  roomName: string;
  course: Course;
}>;

function countBySectionType(sections: SectionType[], type: ContentType) {
  return sections.filter((section) => section.get('type') === type).length;
}

export function ContentEditorProvider({
  children,
  roomName,
  course,
}: ContentEditorProviderProps) {
  const { user } = useAuth();
  const [doc] = useState(() => new Y.Doc() as DocType);
  const [provider] = useState(
    () =>
      new WebsocketProvider(
        import.meta.env.VITE_WS_URL!,
        roomName,
        doc as Y.Doc,
        {
          connect: false,
        },
      ),
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
    const rootArray = doc.getArray('root');
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
      const rootArray = doc.getArray('root');
      rootArray.delete(index, 1);

      if (currentSection >= index) {
        setCurrentSection(currentSection - 1);
      }
    });
  }

  function addSection(type: ContentType) {
    doc.transact(() => {
      const rootArray = doc.getArray('root');
      const title = new Y.Text();
      const sections = Array.from(rootArray) as SectionType[];
      if (type === 'markdown') {
        title.insert(
          0,
          `Section ${countBySectionType(sections, 'markdown') + 1}`,
        );
      } else {
        title.insert(0, `Quiz ${countBySectionType(sections, 'quiz') + 1}`);
      }

      const section = new Y.Map() as SectionType;
      section.set('title', title);

      if (type === 'markdown') {
        section.set('type', 'markdown');
        section.set('content', new Y.XmlFragment());
      } else {
        section.set('type', 'quiz');
        section.set('content', new Y.Map());
      }
      rootArray.push([section]);
    });
  }

  return (
    <ContentEditorContext.Provider
      value={{
        course,
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
