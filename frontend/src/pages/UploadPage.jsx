import ImageUploadFlow from '../components/ImageUploadFlow';

export default function UploadPage() {
  return (
    <ImageUploadFlow
      title="Camera / image upload"
      subtitle="Capture or upload a road image. VisionRoute runs YOLOv8 inference, overlays detections, and submits a geo-tagged report."
    />
  );
}
