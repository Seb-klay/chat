export interface IModelList {
  id: number,
  model_name: string;
}

export const MODELS: Record<number, IModelList> = {
  1: {
    id: 1,
    model_name: "llama3.1:8b",
  },
  2: {
    id: 2,
    model_name: "mistral-small:24b",
  },
  3: {
    id: 3,
    model_name: "qwen2.5:32b",
  }
};
