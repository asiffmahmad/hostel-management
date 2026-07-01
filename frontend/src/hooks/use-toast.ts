export function useToast() {
  return {
    toast: ({ title, variant }: { title: string, variant?: string }) => {
      console.log(`[TOAST ${variant || 'default'}]`, title);
      alert(title);
    }
  };
}
