import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMemo } from "react";
import type { CanvasComponent, ComponentType } from "../types/component";

interface CanvasState {
  // Components
  components: CanvasComponent[];
  setComponents: (components: CanvasComponent[]) => void;
  updateComponent: (
    componentId: string,
    updater: (comp: CanvasComponent) => CanvasComponent,
  ) => void;
  addComponent: (component: CanvasComponent) => void;
  removeComponent: (componentId: string) => void;
  removeComponents: (componentIds: string[]) => void;

  // Selection
  selectedComponentIds: string[];
  setSelectedComponentIds: (ids: string[]) => void;
  addSelectedComponentId: (id: string) => void;
  removeSelectedComponentId: (id: string) => void;
  clearSelection: () => void;

  // Tools
  penColor: string;
  setPenColor: (color: string) => void;
  componentColor: string;
  setComponentColor: (color: string) => void;
  componentColorTimestamp: number;
  setComponentColorTimestamp: (timestamp: number) => void;
  canvasColor: string;
  setCanvasColor: (color: string) => void;
  penSize: number;
  setPenSize: (size: number) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  isEraser: boolean;
  setIsEraser: (eraser: boolean) => void;
  isMagicWand: boolean;
  setIsMagicWand: (wand: boolean) => void;
  isLasso: boolean;
  setIsLasso: (lasso: boolean) => void;
  isTextSelectMode: boolean;
  setIsTextSelectMode: (mode: boolean) => void;
  selectedComponentType: ComponentType | null;
  setSelectedComponentType: (type: ComponentType | null) => void;

  // Canvas settings
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  resizeMode: "relative" | "match";
  setResizeMode: (mode: "relative" | "match") => void;

  // Browser UI
  showTitleBar: boolean;
  setShowTitleBar: (show: boolean) => void;
  showUrlBar: boolean;
  setShowUrlBar: (show: boolean) => void;
  showBookmarkBar: boolean;
  setShowBookmarkBar: (show: boolean) => void;
  isBrowserUIEnabled: boolean;
  setIsBrowserUIEnabled: (enabled: boolean) => void;
  isMacOSStyle: boolean;
  setIsMacOSStyle: (style: boolean) => void;

  // Clipboard
  copiedComponents: CanvasComponent[];
  setCopiedComponents: (components: CanvasComponent[]) => void;

  // Canvas image data
  canvasImageData: string | null;
  setCanvasImageData: (data: string | null) => void;
  restoreCanvasImageData: string | null;
  setRestoreCanvasImageData: (data: string | null) => void;
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set) => ({
    // Components
    components: [],
    setComponents: (components) => set({ components }),
    updateComponent: (componentId, updater) =>
      set((state) => ({
        components: state.components.map((c) =>
          c.id === componentId ? updater(c) : c,
        ),
      })),
    addComponent: (component) =>
      set((state) => ({
        components: [...state.components, component],
      })),
    removeComponent: (componentId) =>
      set((state) => ({
        components: state.components.filter((c) => c.id !== componentId),
      })),
    removeComponents: (componentIds) =>
      set((state) => ({
        components: state.components.filter(
          (c) => !componentIds.includes(c.id),
        ),
      })),

    // Selection
    selectedComponentIds: [],
    setSelectedComponentIds: (ids) => set({ selectedComponentIds: ids }),
    addSelectedComponentId: (id) =>
      set((state) => ({
        selectedComponentIds: state.selectedComponentIds.includes(id)
          ? state.selectedComponentIds
          : [...state.selectedComponentIds, id],
      })),
    removeSelectedComponentId: (id) =>
      set((state) => ({
        selectedComponentIds: state.selectedComponentIds.filter(
          (selectedId) => selectedId !== id,
        ),
      })),
    clearSelection: () => set({ selectedComponentIds: [] }),

    // Tools
    penColor: "#1976d2",
    setPenColor: (color) => set({ penColor: color }),
    componentColor: "#1976d2",
    setComponentColor: (color) => set({ componentColor: color }),
    componentColorTimestamp: 0,
    setComponentColorTimestamp: (timestamp) =>
      set({ componentColorTimestamp: timestamp }),
    canvasColor: "#ffffff",
    setCanvasColor: (color) => set({ canvasColor: color }),
    penSize: 2,
    setPenSize: (size) => set({ penSize: size }),
    isDrawing: false,
    setIsDrawing: (drawing) => set({ isDrawing: drawing }),
    isEraser: false,
    setIsEraser: (eraser) => set({ isEraser: eraser }),
    isMagicWand: false,
    setIsMagicWand: (wand) => set({ isMagicWand: wand }),
    isLasso: false,
    setIsLasso: (lasso) => set({ isLasso: lasso }),
    isTextSelectMode: false,
    setIsTextSelectMode: (mode) => set({ isTextSelectMode: mode }),
    selectedComponentType: null,
    setSelectedComponentType: (type) => set({ selectedComponentType: type }),

    // Canvas settings
    snapToGrid: true,
    setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    resizeMode: "relative",
    setResizeMode: (mode) => set({ resizeMode: mode }),

    // Browser UI
    showTitleBar: true,
    setShowTitleBar: (show) => set({ showTitleBar: show }),
    showUrlBar: true,
    setShowUrlBar: (show) => set({ showUrlBar: show }),
    showBookmarkBar: true,
    setShowBookmarkBar: (show) => set({ showBookmarkBar: show }),
    isBrowserUIEnabled: false,
    setIsBrowserUIEnabled: (enabled) => set({ isBrowserUIEnabled: enabled }),
    isMacOSStyle: false,
    setIsMacOSStyle: (style) => set({ isMacOSStyle: style }),

    // Clipboard
    copiedComponents: [],
    setCopiedComponents: (components) => set({ copiedComponents: components }),

    // Canvas image data
    canvasImageData: null,
    setCanvasImageData: (data) => set({ canvasImageData: data }),
    restoreCanvasImageData: null,
    setRestoreCanvasImageData: (data) => set({ restoreCanvasImageData: data }),
  })),
);

// Selectors for optimized re-renders
// Use shallow comparison for object selectors to prevent infinite loops
export const useComponents = () => useCanvasStore((state) => state.components);
export const useSelectedComponentIds = () =>
  useCanvasStore((state) => state.selectedComponentIds);

export const usePenSizeValue = () => useCanvasStore((state) => state.penSize);
export const usePenSizeSetter = () => useCanvasStore((state) => state.setPenSize);

// Individual action selectors to avoid object recreation issues
export const useSetComponents = () =>
  useCanvasStore((state) => state.setComponents);
export const useUpdateComponent = () =>
  useCanvasStore((state) => state.updateComponent);
export const useSetSelectedComponentIds = () =>
  useCanvasStore((state) => state.setSelectedComponentIds);

// Object selectors with memoization to prevent infinite loops
// The returned objects are memoized so they only change when the underlying functions change
export const useComponentActions = () => {
  const setComponents = useSetComponents();
  const updateComponent = useUpdateComponent();
  const addComponent = useCanvasStore((state) => state.addComponent);
  const removeComponent = useCanvasStore((state) => state.removeComponent);
  const removeComponents = useCanvasStore((state) => state.removeComponents);
  
  return useMemo(
    () => ({
      setComponents,
      updateComponent,
      addComponent,
      removeComponent,
      removeComponents,
    }),
    [setComponents, updateComponent, addComponent, removeComponent, removeComponents],
  );
};

export const useSelectionActions = () => {
  const setSelectedComponentIds = useSetSelectedComponentIds();
  const addSelectedComponentId = useCanvasStore(
    (state) => state.addSelectedComponentId,
  );
  const removeSelectedComponentId = useCanvasStore(
    (state) => state.removeSelectedComponentId,
  );
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  
  return useMemo(
    () => ({
      setSelectedComponentIds,
      addSelectedComponentId,
      removeSelectedComponentId,
      clearSelection,
    }),
    [
      setSelectedComponentIds,
      addSelectedComponentId,
      removeSelectedComponentId,
      clearSelection,
    ],
  );
};

