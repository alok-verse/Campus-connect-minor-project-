import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "../context/useAuth";
import { useUI } from "../context/useUI";
import { initialOf } from "../utils/student";

export default function ProfilePanel({ onClose }) {
  const { student, logoutStudent } = useAuth();
  const { confirm, toast } = useUI();
  const navigate = useNavigate();

  if (!student) return null;

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    const yes = await confirm({
      title: "Log out?",
      message: "You will need to log in again to register for events.",
      confirmText: "Log out",
    });
    if (!yes) return;
    onClose();
    logoutStudent();
    navigate("/");
    toast("You have been logged out.", "info");
  };

  const rows = [
    ["College ID", student.id],
    ["Year", student.year],
    student.course && ["Course", student.course],
    ["Email Address", student.email],
  ].filter(Boolean);

  return (
    <Modal onClose={onClose} labelledBy="profile-title" className="profile-panel" align="right">
      <div className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{initialOf(student.name)}</div>
        <h2 id="profile-title">{student.name}</h2>
        <p>Student Account</p>
      </div>

      <div className="profile-details">
        {rows.map(([label, value]) => (
          <div className="profile-info" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={() => go("/my-events")}>
        My Registrations
      </button>
      <button type="button" className="btn btn-outline btn-block" onClick={() => go("/profile")}>
        Edit Profile
      </button>
      <button type="button" className="btn btn-ghost btn-block" onClick={handleLogout}>
        Logout
      </button>
    </Modal>
  );
}
