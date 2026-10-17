import React from "react";

export const Skeleton = ({
  width,
  height,
  boxHeight,
  show = true,
  pill = false,
  rounded = false,
  squared = false,
  animated = true,
  children,
  className = ""
}) => {
  const classes = [
    "block rounded-[5px]",
    !children && show ? "bg-skeleton-gradient bg-[length:400%_100%]" : "",
    children && show && !width && !height ? "relative after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 after:rounded after:bg-skeleton-gradient after:bg-[length:400%_100%]" : "",
    pill ? "rounded-full after:rounded-full" : "",
    rounded ? "rounded-[50%] after:rounded-[50%]" : "",
    squared ? "rounded-none after:rounded-none" : "",
    animated && !children && show ? "animate-skeleton-loading" : "",
    animated && children && show ? "after:animate-skeleton-loading" : "",
    className
  ].filter(Boolean).join(" ");

  const minH = height || 24;
  const mb = boxHeight 
    ? `calc(${typeof boxHeight === 'number' ? boxHeight + 'px' : boxHeight} - ${typeof height === 'number' ? height + 'px' : (height || '0px')})`
    : undefined;

  return (
    <span
      className={classes}
      style={{
        minHeight: minH,
        width: children ? "fit-content" : (typeof width === 'number' ? `${width}px` : width),
        height: typeof height === 'number' ? `${height}px` : height,
        ...(mb ? { marginBottom: mb } : {})
      }}
    >
      {children}
    </span>
  );
};

export default Skeleton;
