import { Focusable, ScrollPanelGroup } from "@decky/ui";
import { Selectable } from "../../../lib/primitives";
import { useExpandedViewActions, useExpandedViewValues } from "../context";

export function ExpandedViewImageContainer() {
  const {
    data,
    focusedImageId,
    imageAreaStyleKeys: {
      imageCarouselEntryWidth,
      imageCarouselEntryHeight,
      selectedImageHeight,
      selectedImageWidth,
    },
  } = useExpandedViewValues();

  const { setFocusedImage } = useExpandedViewActions();

  return (
    <Focusable className="cl_expandedview_imageareacontainer">
      {/* Image Carousel Container */}
      {data.images.length > 1 && (
        <ScrollPanelGroup
          // @ts-ignore
          focusable={false}
          className="cl_expandedview_imagecarouselcontainer"
        >
          {data.images.map((image) => (
            <Selectable
              onFocus={() => {
                setFocusedImage(image.id);
              }}
              className="cl_expandedview_imagecarouselentry"
            >
              <img
                width={imageCarouselEntryWidth}
                height={imageCarouselEntryHeight}
                style={{ objectFit: "contain" }}
                src={`https://api.deckthemes.com/blobs/${image.id}`}
              />
            </Selectable>
          ))}
        </ScrollPanelGroup>
      )}

      {/* Selected Image Display */}
      <Selectable className="cl_expandedview_selectedimage">
        <img
          width={selectedImageWidth}
          height={selectedImageHeight}
          style={{ objectFit: "contain" }}
          src={
            data.images.length > 0
              ? `https://api.deckthemes.com/blobs/${focusedImageId}`
              : `https://share.deckthemes.com/cssplaceholder.png`
          }
        />
        {data.images.length > 1 && (
          <div className="cl_expandedview_imagenumbercontainer">
            <span className="font-bold">
              {data.images.findIndex((blob) => blob.id === focusedImageId) + 1}/{data.images.length}
            </span>
          </div>
        )}
      </Selectable>
    </Focusable>
  );
}
