import { About } from "@/components/chapters/About/About";
import { Contact } from "@/components/chapters/Contact/Contact";
import { Home } from "@/components/chapters/Home/Home";
import { Projects } from "@/components/chapters/Projects/Projects";
import { Spine } from "@/components/Spine/Spine";
import { SiteShell } from "@/components/Track/SiteShell";

// "03 Experience" in the nav points at the storyboard inside About (see About.tsx)
export default function Page() {
  return (
    <SiteShell>
      <Home />
      <Spine index={1} />
      <About />
      <Spine index={3} />
      <Projects />
      <Spine index={4} />
      <Contact />
    </SiteShell>
  );
}
