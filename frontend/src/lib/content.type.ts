import * as Y from 'yjs';
import type { TypedArray, TypedDoc, TypedMap } from 'yjs-types';

type EditableField<T> = T extends string[]
  ? Y.Array<Y.Text>
  : T extends (infer U)[]
    ? Y.Array<U>
    : T extends string
      ? Y.Text
      : T;

type EditableInteractionFields<T> = {
  [K in keyof T]: EditableField<T[K]>;
};

export type QuizContent = {
  question: string;
  options: string[];
  // Bit flags for correct options
  // For example, if options 0 and 2 are correct, answer would be 0b101 = 5
  answer: number;
};

export type SectionType = {
  title: string;
} & (
  | {
      content: string;
      type: 'markdown';
    }
  | {
      content: QuizContent;
      type: 'quiz';
    }
);

export type EditableQuizContent = TypedMap<
  EditableInteractionFields<QuizContent>
>;
export type ContentType = SectionType['type'];

// Manually typed - content cannot reflect XmlFragment
export type EditableSectionType = TypedMap<
  {
    title: Y.Text;
  } & (
    | {
        content: Y.XmlFragment;
        type: 'markdown';
      }
    | {
        content: EditableQuizContent;
        type: 'quiz';
      }
  )
>;
export type DocType = TypedDoc<
  any, // For typing maps
  {
    root: TypedArray<EditableSectionType>;
  }
>;
