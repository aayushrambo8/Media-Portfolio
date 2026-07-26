import { Home } from "../components/Home";
import galleryData from "../data/gallery.json";
import timelineData from "../data/timeline.json";

export default function Page() {
  return <Home timelineEvents={timelineData} showcaseImages={galleryData} />;
}
