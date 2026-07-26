import { Gallery } from "../../components/Gallery";
import galleryData from "../../data/gallery.json";
import tagsData from "../../data/tags.json";

export default function Page() {
  return <Gallery initialImages={galleryData} initialTags={tagsData} />;
}
