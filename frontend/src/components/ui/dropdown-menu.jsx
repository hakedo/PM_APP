import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);

  return (
    <div ref={triggerRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, setOpen, triggerRef });
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
  ({ className, align = "start", children, ...props }, ref) => {
    // Extract internal props that shouldn't be passed to DOM
    const { open, setOpen, triggerRef, ...domProps } = props;
    
    const contentRef = React.useRef(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
      if (open && triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        let left = rect.left + scrollLeft;
        const top = rect.bottom + scrollTop + 8; // 8px offset
        
        // Adjust horizontal position based on align
        if (align === 'end') {
          left = rect.right + scrollLeft;
        } else if (align === 'center') {
          left = rect.left + scrollLeft + rect.width / 2;
        }
        
        setPosition({ top, left });
      }
    }, [open, triggerRef, align]);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target) &&
            triggerRef?.current && !triggerRef.current.contains(event.target)) {
          setOpen?.(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    const alignmentClasses = {
      start: "",
      end: "-translate-x-full",
      center: "-translate-x-1/2",
    };

    const content = (
      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999,
        }}
        className={cn(
          "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
          alignmentClasses[align],
          className
        )}
        {...domProps}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { setOpen });
          }
          return child;
        })}
      </div>
    );

    return createPortal(content, document.body);
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
