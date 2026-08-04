import ImageUploadFlow from '../components/ImageUploadFlow';

export default function CitizenReportPage() {
  return (
    <ImageUploadFlow
      title="Citizen manual reporting"
      subtitle="Upload a photo of road damage, add an optional note, and let YOLO verify before submission."
      showDescription
    />
  );
}
