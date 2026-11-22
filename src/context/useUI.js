import { useContext } from "react";
import { UIContext } from "./ui-context";

/** toast(message, "success" | "error" | "info")  and  confirm({ title, message, ... }) -> Promise<boolean> */
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
