import { create } from "zustand";
import { toast } from "sonner"; 

export const useAdminStore = create((set) => ({
  providers: [],
  expandedRow: null,
  editRow: null,
  searchQuery: "",
  activeTab: "providers",
  loading: false,
  error: null,

  setProviders: (newProviders) => {
    set({ providers: newProviders });
    localStorage.setItem("serviceProviders", JSON.stringify(newProviders));
  },
  setExpandedRow: (id) => set((state) => ({
    expandedRow: state.expandedRow === id ? null : id
  })),
  setEditRow: (id) => set((state) => ({
    editRow: state.editRow === id ? null : id
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadProviders: async () => {
    try {
      const { apiService } = await import("@/lib/api");
      const response = await apiService.getServiceProviders({ per_page: 50 });
      set({ providers: response.data || [] });
    } catch (err) {
      console.error("Failed to load service providers", err);
      set({ error: "Failed to load service providers" });
    }
  },
  
  handleApprove: async (id) => {
    try {
      const { apiService } = await import("@/lib/api");
      await apiService.acceptServiceProvider(id);
      
      set((state) => {
        const updated = state.providers.map((p) =>
          p.id === id ? { ...p, registration_status: "accepted" } : p
        );
        toast.success("Provider approved!");
        return { providers: updated };
      });
    } catch (error) {
      console.error("Error approving provider:", error);
      toast.error("Failed to approve provider");
    }
  },
  handleSuspend: async (id) => {
    try {
      const { apiService } = await import("@/lib/api");
      await apiService.suspendServiceProvider(id, "Policy violation");
      
      set((state) => {
        const updated = state.providers.map((p) =>
          p.id === id ? { ...p, is_suspended: true } : p
        );
        toast.success("Provider suspended!");
        return { providers: updated };
      });
    } catch (error) {
      console.error("Error suspending provider:", error);
      toast.error("Failed to suspend provider");
    }
  },
  handleRemove: async (id) => {
    try {
      const { apiService } = await import("@/lib/api");
      await apiService.rejectServiceProvider(id);
      
      set((state) => {
        const updated = state.providers.filter((p) => p.id !== id);
        toast.success("Provider rejected!");
        return { providers: updated };
      });
    } catch (error) {
      console.error("Error rejecting provider:", error);
      toast.error("Failed to reject provider");
    }
  },
}));