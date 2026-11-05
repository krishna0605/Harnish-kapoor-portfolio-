import type { ProjectFile } from "@/content/site";
import styles from "./Folder.module.css";

/** Height and top of each drawer slot at 1920×1080: the slot keeps its height whichever file sits in it. */
export const SLOTS = [
  { top: 236, height: 724 },
  { top: 204, height: 756 },
  { top: 228, height: 732 },
  { top: 150, height: 810 },
  { top: 214, height: 746 },
  { top: 190, height: 770 },
  { top: 222, height: 738 },
];

type Props = {
  project: ProjectFile;
  slot: number;
  /** horizontal step between folders in design px (96 for seven folders, tighter if there are more) */
  step: number;
  /** filtered out: sunk into the drawer, can't be opened */
  sunk: boolean;
  /** lifted by a first tap on a touch screen; the next tap opens it */
  armed: boolean;
  onOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
};

/** One upright folder standing in the drawer: tab, number, vertical title and type, years. */
export function FolderTab({ project, slot, step, sunk, armed, onOpen, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur }: Props) {
  const geometry = SLOTS[slot % SLOTS.length];
  return (
    <li
      className={styles.slot}
      style={
        {
          "--i": slot,
          "--step": step,
          "--top": geometry.top,
          "--h": geometry.height,
          "--folder": project.color,
        } as React.CSSProperties
      }
      data-flip-id={project.id}
      data-slot={slot}
    >
      <button
        type="button"
        className={styles.folder}
        aria-label={`Open project ${project.number}: ${project.title}`}
        aria-hidden={sunk || undefined}
        tabIndex={sunk ? -1 : undefined}
        disabled={sunk}
        data-folder={project.id}
        data-sunk={sunk || undefined}
        data-armed={armed || undefined}
        onClick={onOpen}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className={styles.folderTab} aria-hidden="true" />
        <span className={styles.folderNumber}>{project.number}</span>
        <span className={styles.folderDot} aria-hidden="true" />
        <span className={styles.folderTitle} data-folder-title>
          {project.title}
        </span>
        <span className={styles.folderType} data-folder-type>
          {project.type}
        </span>
        <span className={styles.folderFoot}>{project.years || project.context}</span>
      </button>
    </li>
  );
}
