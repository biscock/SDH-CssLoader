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
    <Modal title={data.display_name} closeModal={closeModal}>
      <ul>
        {data.dependencies.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </Modal>
  );
}
