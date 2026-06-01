"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IModelList, MODELS } from "../../utils/listModels";
import { getUserSettings, updateUserSettings } from "@/app/service";

interface ModelContextType {
  defaultModel: IModelList;
  setDefaultModel: (model: IModelList) => void;
  allModels: IModelList[];
  updateModel: (model: IModelList) => void;
  isLoading: boolean;
}

const defaultSelectedModel: ModelContextType = {
  defaultModel: MODELS[1],
  setDefaultModel: () => {},
  allModels: Object.values(MODELS),
  updateModel: () => {},
  isLoading: true,
};

const ModelContext = createContext<ModelContextType>(defaultSelectedModel);

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  // By default, always first model in the list
  const [defaultModel, setDefaultModel] = useState<IModelList>(MODELS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const allModels = Object.values(MODELS);

  const updateModel = async (newModel: IModelList) => {
    setDefaultModel(newModel); // Update UI immediately (Optimistic)

    // Update DB in the background
    await updateUserSettings(null, newModel);
  };

  useEffect(() => {
    async function fetchDefaultModel() {
      try {
        const response = await getUserSettings();
        if (!response?.ok) throw new Error("User settings could not be loaded.");
        const { defaultmodel } = await response.json();
        const model = JSON.parse(defaultmodel);
        // match the ID from DB with local MODELS
        const modelOfUser = MODELS[model.id];

        if (modelOfUser) {
          setDefaultModel(modelOfUser);
        }
      } catch (error) {
        setDefaultModel(MODELS[1]);
        // throw new Error("Failed to fetch settings: " + error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDefaultModel();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        defaultModel,
        setDefaultModel,
        allModels,
        updateModel,
        isLoading,
      }}
    >
      {/* Prevent rendering children until model is loaded to avoid UI jumps */}
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => useContext(ModelContext);
