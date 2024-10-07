import { create } from "zustand";
import { devtools } from "zustand/middleware";

type RQDevtoolsState = {
  show: boolean;
};

type RQDevtoolsActions = {
  toggleDevtools: () => void;
};

export const useRQDevtoolsInProd = create<RQDevtoolsState & RQDevtoolsActions>()(
  devtools((set, get) => ({
    show: false,
    toggleDevtools: () => set(() => ({ show: !get().show }), false, "toogle_devtools_in_prod"),
  })),
);
