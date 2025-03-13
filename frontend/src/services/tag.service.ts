import { Tag, TagRequest, TagResponse } from "../types";
import { del, get, post, put } from "./api.service";

const TagService = {
  getAllTags: async (): Promise<Tag[]> => {
    const response = await get<TagResponse[]>("/tags");
    return response.data as Tag[];
  },

  getTagById: async (id: number): Promise<Tag> => {
    const response = await get<TagResponse>(`/tags/${id}`);
    return response.data as Tag;
  },

  createTag: async (tagData: TagRequest): Promise<Tag> => {
    const response = await post<TagResponse, TagRequest>("/tags", tagData);
    return response.data as Tag;
  },

  updateTag: async (id: number, tagData: TagRequest): Promise<Tag> => {
    const response = await put<TagResponse, TagRequest>(`/tags/${id}`, tagData);
    return response.data as Tag;
  },

  deleteTag: async (id: number): Promise<void> => {
    await del(`/tags/${id}`);
  },

  searchTags: async (keyword: string): Promise<Tag[]> => {
    const response = await get<TagResponse[]>("/tags/search", {
      params: { keyword },
    });
    return response.data as Tag[];
  },
};

export default TagService;
