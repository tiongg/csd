import { useEditorSchema } from '@/features/editor/EditorSchemaContext';
import type {
  ContentType,
  DocType,
  EditableQuizContent,
  EditableSectionType,
  SectionType,
} from '@/lib/content.type';
import { generateColorFromString, type Course } from '@/lib/utils';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { useAuth } from './AuthContext';

export type ContentEditorContextType = {
  course: Course;

  doc: DocType;
  provider: WebsocketProvider;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  getDocAsJson: () => Promise<SectionType[]>;
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

function countBySectionType(
  sections: EditableSectionType[],
  type: ContentType,
) {
  return sections.filter((section) => section.get('type') === type).length;
}

function getDefaultQuizContent() {
  const content = new Y.Map() as EditableQuizContent;
  const question = new Y.Text();
  question.insert(0, 'New Question');
  content.set('question', question);
  content.set('options', new Y.Array<Y.Text>());
  content.set('answer', 0);
  return content;
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
  const { schema, serializer } = useEditorSchema();
  const navigate = useNavigate({
    from: '/contributor/editor/$courseId',
  });
  const currentSection = useSearch({
    from: '/contributor/editor/$courseId',
    select: (search) => search.section ?? -1,
  });
  function setCurrentSection(section: number) {
    console.log('Setting current section to', section);
    navigate({
      search: (prev) => ({
        ...prev,
        section: section === -1 ? undefined : section,
      }),
    });
  }

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

  async function getDocAsJson() {
    const rootArray = Array.from<EditableSectionType>(doc.getArray('root'));
    const res = new Array<SectionType>();

    if (!schema.current || !serializer.current) {
      throw new Error('Editor schema or serializer not ready');
    }

    for (const node of rootArray) {
      const type = node.get('type');
      const title = node.get('title')!.toString();

      if (type == 'markdown') {
        const pmNode = yXmlFragmentToProseMirrorRootNode(
          node.get('content') as Y.XmlFragment,
          schema.current,
        );
        const markdownOutput = serializer.current(pmNode);
        res.push({
          title,
          type,
          content: markdownOutput,
        });
      }

      if (type === 'quiz') {
        const content = node.get('content') as EditableQuizContent;
        res.push({
          title,
          type,
          content: {
            question: content.get('question')!.toString(),
            options: Array.from(content.get('options')!).map((option) =>
              option.toString(),
            ),
            answer: content.get('answer')!,
          },
        });
      }
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
      const sections = Array.from(rootArray) as EditableSectionType[];
      if (type === 'markdown') {
        title.insert(
          0,
          `Section ${countBySectionType(sections, 'markdown') + 1}`,
        );
      } else {
        title.insert(0, `Quiz ${countBySectionType(sections, 'quiz') + 1}`);
      }

      const section = new Y.Map() as EditableSectionType;
      section.set('title', title);

      if (type === 'markdown') {
        section.set('type', 'markdown');
        section.set('content', new Y.XmlFragment());
      } else {
        section.set('type', 'quiz');
        section.set('content', getDefaultQuizContent());
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
