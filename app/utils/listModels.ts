export interface IModelList {
  id: number,
  model_name: string;
  simple_name: string;
  nb_params: string;
}

export const MODELS: Record<number, IModelList> = {
  1: {
    id: 1,
    model_name: "Qwen/Qwen3.5-4B",
    simple_name: "Qwen3.5",
    nb_params: "4b",
  }
};
