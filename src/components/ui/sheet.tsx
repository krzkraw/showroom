import { Dialog } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetClose = Dialog.Close;
const SheetTitle = Dialog.Title;
const SheetDescription = Dialog.Description;

function SheetContent({ className, ...props }: ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Content className={cn("sheet-content", className)} {...props} />
    </Dialog.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle };
