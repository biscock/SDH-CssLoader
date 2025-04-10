import { Theme } from "@/types";
import { Modal } from "../../../primitives";

export function ProfileDetailsModal({
  closeModal,
  data,
}: {
  closeModal?: () => void;
  data: Theme;
}) {
  return (
    <Modal closeModal={closeModal}>
      <span className="font-bold text-2xl">{data.display_name}</span>
      <ul>
        {data.dependencies.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      {data.dependencies.length === 0 && <span>This profile contains no themes</span>}
    </Modal>
  );
}
