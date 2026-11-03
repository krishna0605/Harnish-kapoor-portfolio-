import { forwardRef } from "react";
import type { ProjectFile } from "@/content/site";
import { mediaUrl } from "@/lib/media";
import { COVER_BACKGROUND, CoverArt } from "./CoverArt";
import styles from "./Folder.module.css";

type Props = {
  project: ProjectFile;
  onOpenCase: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave?: () => void;
};

/** The file pulled out of the drawer: its cover in a frame, the clipped brief note, and "Open project". */
export const OpenFolder = forwardRef<HTMLElement, Props>(function OpenFolder({ project, onOpenCase, onPointerMove, onPointerLeave }, ref) {
  const meta = [project.years, project.context].filter(Boolean).join(" · ");
  return (
    <article
      ref={ref}
      className={styles.open}
      style={{ "--folder": project.color } as React.CSSProperties}
      aria-labelledby="open-folder-title"
      data-open-folder={project.id}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span className={styles.openTab}>
        {project.number} · {project.tab}
      </span>

      <figure className={styles.cover} data-cover>
        <div className={styles.picture} style={{ background: COVER_BACKGROUND[project.cover.art] }}>
          {project.cover.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- media may come from a CDN; sized by the frame
            <img src={mediaUrl(project.cover.src)} alt={project.cover.alt} className={styles.pictureImage} />
          ) : (
            <>
              <CoverArt art={project.cover.art} className={styles.pictureArt} />
              <span className="sr-only">{project.cover.alt}</span>
              <span className={styles.pictureChip} aria-hidden="true">
                [ {project.cover.caption} ]
              </span>
            </>
          )}
        </div>
        <span className={styles.coverTape} aria-hidden="true" data-tape />
      </figure>

      <div className={styles.note} data-note>
        <svg className={styles.clip} viewBox="0 0 30 74" aria-hidden="true" data-clip>
          <path d="M8 66 V14 a7 7 0 0 1 14 0 V58 a4 4 0 0 1 -8 0 V22" fill="none" stroke="#2A2733" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <div className={styles.noteMeta} data-note-part>
          <span>{meta}</span>
          <span>{project.format}</span>
        </div>
        <h3 id="open-folder-title" className={styles.noteTitle} tabIndex={-1} data-note-part>
          {project.title}
        </h3>
        <p className={styles.noteText} data-note-part>
          {project.summary}
        </p>
        <ul className={styles.noteTags} data-note-part aria-label="Tags">
          {project.tags.map((tag) => (
            <li key={tag} className={styles.noteTag}>
              {tag}
            </li>
          ))}
        </ul>
        <button type="button" className={styles.openCase} onClick={onOpenCase} data-open-case data-note-part>
          Open project
          <svg viewBox="0 0 30 20" aria-hidden="true">
            <path d="M2 10 H26 M18 3 L27 10 L18 17" fill="none" stroke="#2A2733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
});
