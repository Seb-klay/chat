import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { IModelList, MODELS } from "../../utils/listModels"
import { useState } from 'react';
import { CpuChipIcon } from '@heroicons/react/24/outline';

interface ChooseAiModelProps {
  onModelSelect?: (model: IModelList) => void;
}

export default function ChooseAiModel({ onModelSelect }: ChooseAiModelProps) {
  const list_models: IModelList[] = Object.values(MODELS);
    const [selectedModel, setSelectedModel] = useState<IModelList>({
    id: 1,
    model_name: "llama3.2:3b",
  });
  
  // When user selects a model in the dropdown
  const handleModelSelect = (model: IModelList) => {
    setSelectedModel(model);
    
    // Send it back to parent via callback
    if (onModelSelect) {
      onModelSelect(model);
    }
  };

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-100 inset-ring-1 inset-ring-white/5 hover:bg-white/20">
        <CpuChipIcon className="w-5 h-5" />
        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mb-2 w-56 origin-bottom-right bottom-full rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {list_models.map((m) => {
            // Split model_name by colon to separate name and params
            const [modelName, params] = m.model_name.split(':');
            
            return (
              <MenuItem key={m.model_name}>
                <button
                  onClick={() => handleModelSelect(m)}
                  className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-300 data-[focus]:bg-gray-700 data-[focus]:text-gray-100"
                >
                  <div className="text-left">
                    <div className="font-medium">{modelName}</div>
                    {params && (
                      <div className="text-xs text-gray-400 mt-0.5">{params}</div>
                    )}
                  </div>
                  
                  {/* Show checkmark for selected model */}
                  {selectedModel?.model_name === m.model_name && (
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