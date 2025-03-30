export interface Tag {
  id: number;
  name: string;
}

export interface TagRequest {
  name: string;
}

export interface TagListState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

export interface TagDetailState {
  tag: Tag | null;
  loading: boolean;
  error: string | null;
}
