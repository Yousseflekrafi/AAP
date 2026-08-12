import { createSlice } from "@reduxjs/toolkit";

interface SidebarState {
  collapsed: boolean;
}

const initialState: SidebarState = { collapsed: false };

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.collapsed = !state.collapsed;
    },
    setSidebarCollapsed(state, action: { payload: boolean }) {
      state.collapsed = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;

export const selectSidebarCollapsed = (state: { sidebar: SidebarState }) => state.sidebar.collapsed;
