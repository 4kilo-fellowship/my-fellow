export type Rect = { x: number; y: number; width: number; height: number };

export type PreviewPayload = {
  uri: string;             // high-res photo URL
  placeholderUri?: string; // the small, already-cached avatar
  rect: Rect;              // avatar's on-screen rect (measured with measureInWindow)
  label?: string;          // accessibility label, e.g. "Sara's profile photo"
};

type Api = {
  open: (p: PreviewPayload) => void;
  close: () => void;
};

let api: Api | null = null;

export const registerAvatarPreview = (a: Api | null) => {
  api = a;
};

export const openAvatarPreview = (p: PreviewPayload) => {
  api?.open(p);
};

export const closeAvatarPreview = () => {
  api?.close();
};
