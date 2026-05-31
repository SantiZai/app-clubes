import type { FC, SVGProps } from "react";
import LogoCC from "./LogoCC";
import LogoAV from "./LogoAV";
import LogoCM from "./LogoCM";

const LogoMap: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  CC: LogoCC,
  AV: LogoAV,
  CM: LogoCM,
};

export default LogoMap;
