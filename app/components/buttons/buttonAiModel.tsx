import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { IModelList } from "../../utils/listModels";
import { useState } from "react";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import { useModel } from "../contexts/model-provider";
import { useTheme } from "../contexts/theme-provider";

interface ChooseAiModelProps {
  onModelSelect?: (model: IModelList) => void;
}

export default function ChooseAiModel({ onModelSelect }: ChooseAiModelProps) {
  const { selectedModel, allModels } = useModel();
  const [choosenModel, setChoosenModel] = useState<IModelList>(selectedModel);
  const { theme } = useTheme();

  // When user selects a model in the dropdown
  const handleModelSelect = (model: IModelList) => {
    setChoosenModel(model);

    // Send it back to parent via callback
    if (onModelSelect) {
      onModelSelect(model);
    }
  };

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton 
      style={{ backgroundColor: theme.colors.background_second, color: theme.colors.primary}} 
      className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold inset-ring-1 inset-ring-white/5 hover:bg-white/20">
        <CpuChipIcon className="w-5 h-5" />
        <ChevronDownIcon
          aria-hidden="true"
          className="-mr-1 size-5"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mb-2 w-56 origin-bottom-right bottom-full rounded-md outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        style={{ backgroundColor: theme.colors.background_second, color: theme.colors.primary}}
      >
        <div className="py-1">
          {allModels.map((m) => {
            // Split model_name by colon to separate name and params
            const [modelName, params] = m.model_name.split(":");

            return (
              <MenuItem key={m.model_name}>
                <button
                  onClick={() => handleModelSelect(m)}
                  className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm data-focus:bg-gray-700 data-focus:text-gray-100"
                >
                  <div className="text-left">
                    <div className="font-medium">{modelName}</div>
                    {params && (
                      <div style={{ color: theme.colors.secondary}} className="text-xs mt-0.5">
                        {params}
                      </div>
                    )}
                  </div>

                  {/* Show checkmark for selected model */}
                  {choosenModel?.model_name === m.model_name && (
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              </MenuItem>
            );
          })}
        </div>
      </MenuItems>
    </Menu>
  );
}
