import { Tag, TagRequest } from "../types/tag.types";
import { del, get, post, put } from "./api.service";

const TagService = {
  getAllTags: async () => {
    const response = await get<Tag[]>("/tags");
    return response.data;
  },

  getTagById: async (id: number) => {
    const response = await get<Tag>(`/tags/${id}`);
    return response.data;
  },

  createTag: async (tagData: TagRequest) => {
    const response = await post<Tag, TagRequest>("/tags", tagData);
    return response.data;
  },

  updateTag: async (id: number, tagData: TagRequest) => {
    const response = await put<Tag, TagRequest>(`/tags/${id}`, tagData);
    return response.data;
  },

  deleteTag: async (id: number) => {
    await del(`/tags/${id}`);
  },

  searchTags: async (keyword: string) => {
    const response = await get<Tag[]>("/tags/search", {
      params: { keyword },
    });
    return response.data;
  },
};

export default TagService;
