import { useExpandedViewValues } from "../context";

export function ExpandedViewCssVariables() {
  const { imageAreaStyleKeys: imageDimensionKeys } = useExpandedViewValues();

  return (
    <style>
      {`
        :root {
          --cl-ev-image-area-width: ${imageDimensionKeys.imageAreaWidth}px;
          --cl-ev-image-area-padding: ${imageDimensionKeys.imageAreaPadding}px;
          --cl-ev-gap-between-carousel-and-image: ${imageDimensionKeys.gapBetweenCarouselAndImage}px;
          --cl-ev-selected-image-width: ${imageDimensionKeys.selectedImageWidth}px;
          --cl-ev-selected-image-height: ${imageDimensionKeys.selectedImageHeight}px;
          --cl-ev-image-carousel-entry-width: ${imageDimensionKeys.imageCarouselEntryWidth}px;
          --cl-ev-image-carousel-entry-height: ${imageDimensionKeys.imageCarouselEntryHeight}px;
        }
      `}
    </style>
  );
}
