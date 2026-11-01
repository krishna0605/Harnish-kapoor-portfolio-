import { About } from "@/components/chapters/About/About";
import { Contact } from "@/components/chapters/Contact/Contact";
import { Experience } from "@/components/chapters/Experience/Experience";
import { Home } from "@/components/chapters/Home/Home";
import { Projects } from "@/components/chapters/Projects/Projects";
import { Spine } from "@/components/Spine/Spine";
import { SiteShell } from "@/components/Track/SiteShell";

export default function Page() {
  return (
    <SiteShell>
      <Home />
      <Spine index={1} />
      <About />
      <Spine index={2} />
      <Experience />
      <Spine index={3} />
      <Projects />
      <Spine index={4} />
      <Contact />
    </SiteShell>
  );
}
