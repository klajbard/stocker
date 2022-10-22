import { css, CSSResult } from "lit";

export type ScreenType = "tablet" | "desktop";

const screenSizes = {
  tablet: 640,
  desktop: 1080,
};

export const respondTo = (screenType: ScreenType, style: CSSResult) => {
  return css`
    @media screen and (min-width: ${screenSizes[screenType]}px) {
      ${style}
    }
  `;
};
