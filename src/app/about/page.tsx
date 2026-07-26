import { About } from "../../components/About";
import milestonesData from "../../data/milestones.json";

export default function Page() {
  return <About milestones={milestonesData} />;
}
