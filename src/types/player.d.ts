export type PlayerUrl =
  | string
  | MediaStream
  | string[]
  | SourceProps[]
  | undefined;

type PlayerBody = {
  id: string;
  url: PlayerUrl;
  muted: boolean;
};

export type PlayerProps = {
  me?: PlayerBody | null;
  other?: PlayerBody | null;
};
