import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, useEffect } from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";
import type { RegularToast } from "~/utils/toast-validation";

export const toastVariants = cva(
  "flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:w-[--width]",
  {
    variants: {
      variant: {
        message: "text-slate-600 dark:text-slate-400",
        success: "text-lime-600 dark:text-lime-500",
        error: "text-pink-600 dark:text-pink-500",
      },
    },
    defaultVariants: {
      variant: "message",
    },
  },
);

export type ToastVariants = VariantProps<typeof toastVariants>;

export interface ToastProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "title">,
    ToastVariants {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the "description" content. **Required** */
  description: RegularToast["description"];
  /** Binds the "close" button `click` event handler. **Required** */
  onClickClose: () => void;
  /** Sets the "title" content. */
  title?: RegularToast["title"];
}

export const Toast = forwardRef<React.ElementRef<"div">, ToastProps>(
  (
    { className, description, onClickClose, title, variant, ...props },
    forwardedRef,
  ) => {
    return (
      <div
        {...props}
        className={cn(toastVariants({ className, variant }))}
        ref={forwardedRef}
      >
        <button
          type="button"
          className="order-last ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-black/5"
          onClick={onClickClose}
        >
          <Icon type="x" />
          <span className="sr-only">Close toast</span>
        </button>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon
            className=""
            type={
              variant === "error"
                ? "alert-triangle"
                : variant === "success"
                ? "check"
                : "info"
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-tight">
          {title ? <div className="font-semibold">{title}</div> : null}
          <div className="">{description}</div>
        </div>
      </div>
    );
  },
);

Toast.displayName = "Toast";

function ShowToast({ toast }: { toast: RegularToast }) {
  const { id, type, title, description } = toast;

  useEffect(() => {
    setTimeout(() => {
      sonnerToast.custom(
        (idOrIndex) => (
          <Toast
            title={title}
            description={description}
            onClickClose={() => sonnerToast.dismiss(idOrIndex)}
            variant={type}
          />
        ),
        { id },
      );
    }, 0);
  }, [id, type, title, description]);

  return null;
}

export function Toaster({ toast }: { toast?: RegularToast | null }) {
  return (
    <>
      <SonnerToaster position="bottom-center" />
      {toast ? <ShowToast toast={toast} /> : null}
    </>
  );
}