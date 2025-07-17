/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { pb } from "@/lib/pocketbase-client";
import { AuthRecord, BaseAuthStore } from "pocketbase";
import { useEffect, useState } from "react";

// Custom Hook to provide the entire authStore object
function useAuthStore() {
  const [authStore, setAuthStore] = useState<BaseAuthStore>(pb.authStore);

  useEffect(() => {
    // Callback function to update authStore
    const handleAuthChange = (token: string, record: AuthRecord) => {
      setAuthStore({
        ...authStore,
        token,
        record,
      } as BaseAuthStore);
    };

    // Register the callback and get the cleanup function
    const unsubscribe = pb.authStore.onChange(handleAuthChange);

    // Cleanup function to remove the listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return authStore;
}

export default useAuthStore;
