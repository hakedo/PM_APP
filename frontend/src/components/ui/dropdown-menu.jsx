import * as React from "react";
import { cn } from "../../lib/utils";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left z-50">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className, children, asChild, open, setOpen, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    
    const handleClick = (e) => {
      e.stopPropagation();
      setOpen?.(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: handleClick,
      });
    }

    return (
      <Comp
        ref={ref}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "start", children, open, setOpen, ...props }, ref) => {
    const contentRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target)) {
          setOpen?.(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [open, setOpen]);

    if (!open) return null;

    const alignmentClasses = {
      start: "left-0",
      end: "right-0",
      center: "left-1/2 -translate-x-1/2",
    };

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-[100] mt-2 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
          alignmentClasses[align],
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { setOpen });
          }
          return child;
        })}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(
  ({ className, setOpen, onClick, ...props }, ref) => {
    const handleClick = (e) => {
      onClick?.(e);
      setOpen?.(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
