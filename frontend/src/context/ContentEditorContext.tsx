import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export type ContentEditorContextType = {
  doc: Y.Doc;
  provider: WebsocketProvider;
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
  const [doc] = useState(() => new Y.Doc());
  const [provider] = useState(
    new WebsocketProvider(import.meta.env.VITE_WS_URL!, roomName, doc, {
      connect: false,
    }),
  );

  useEffect(() => {
    provider.awareness.setLocalStateField('user', {
      name: 'Anonymous',
      color: '#ffa500',
    });
    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [roomName, doc]);

  return (
    <ContentEditorContext.Provider
      value={{
        doc,
        provider,
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
