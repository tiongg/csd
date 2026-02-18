import * as awarenessProtocol from 'y-protocols/awareness.js';

export type TextAreaBindingOptions = {
  awareness: awarenessProtocol.Awareness;
  clientName?: string;
  color?: {
    r: number;
    g: number;
    b: number;
  };
};
