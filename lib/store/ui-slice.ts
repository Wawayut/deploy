import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Density = 'comfortable' | 'compact'

interface UiState {
  sidebarCollapsed: boolean
  density: Density
}

const initialState: UiState = { sidebarCollapsed: false, density: 'comfortable' }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    sidebarToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    densityChanged(state, action: PayloadAction<Density>) {
      state.density = action.payload
    },
  },
})

export const { sidebarToggled, densityChanged } = uiSlice.actions
export default uiSlice.reducer
