import { IModelList } from '../../utils/chatUtils';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { listModels } from '../../utils/listModels.json';
import { Dispatch, SetStateAction } from 'react';

interface ChooseAiModelProps {
  model: IModelList;
  setModel: Dispatch<SetStateAction<IModelList>>;
}

export default function ChooseAiModel({ model, setModel }: ChooseAiModelProps) {
    const list_models:IModelList[] = listModels;

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
        Options
        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mb-2 w-56 origin-bottom-right bottom-full rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
            {list_models.map((m) => (
            <MenuItem key={m.model_name}>
                <button
                onClick={() => setModel(m)}
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-300 data-[focus]:bg-gray-700 data-[focus]:text-white"
                >
                    { m.model_name }
                </button>
            </MenuItem>
            ))}
        </div>
      </MenuItems>
    </Menu>
  )
}