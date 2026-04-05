'use client'
import { FC, MouseEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";

type CustomDocument = Document & {
  mozCancelFullScreen?: () => void;
};
const FullScreenToggle: FC = () => {
  const toggleFullScreen: MouseEventHandler<HTMLButtonElement> = () => {
    const doc = document;
    const docEl = doc.documentElement;

    const requestFullScreen =
      docEl.requestFullscreen ||
      docEl.requestFullscreen ||
      docEl.requestFullscreen ||
      docEl.requestFullscreen;
    const cancelFullScreen =
      doc.exitFullscreen ||
      (doc as CustomDocument).mozCancelFullScreen ||
      doc.exitFullscreen ||
      doc.exitFullscreen;

    if (
      !doc.fullscreenElement &&
      !doc.fullscreenElement &&
      !doc.fullscreenElement &&
      !doc.fullscreenElement
    ) {
      requestFullScreen?.call(docEl);
    } else {
      cancelFullScreen?.call(doc);
    }
  };

  return (
    <Button
      onClick={toggleFullScreen}
      variant="outline"
      color="secondary"
      className="border-default-600 "
      fullWidth
    >
      Fullscreen Mode
      <Maximize className="ms-2 h-4 w-4" />
    </Button>
  );
};

export default FullScreenToggle;