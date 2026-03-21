export type GlossaryCategory =
  | 'Meme Slang'
  | 'Social & Dating'
  | 'Creator Formats'
  | 'Style & Culture'
  | 'Gaming & Internet'
  | 'Mindset & Study';

export type GlossaryItem = {
  term: string;
  meaning: string;
  context: string;
  example: string;
  category: GlossaryCategory;
};
