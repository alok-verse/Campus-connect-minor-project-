
import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useUI } from "../../context/useUI";

export default function EditProfile() {
  const { student, updateStudent } = useAuth();
  const { toast } = useUI();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: student?.name || "",
    email: student?.email || "",
  });

  useEffect(() => {
    document.title = "Edit Profile | Campus Connect";
  }, []);

  useEffect(() => {
    setForm({
      name: student?.name || "",
      email: student?.email || "",
    });
  }, [student?.name, student?.email]);

  const change = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      toast("Please enter your full name.", "error");
      return;
    }

    if (!email) {
      toast("Please enter your email address.", "error");
      return;
    }

    setSaving(true);

    try {
      await updateStudent({
        name,
        email,
      });

      toast("Profile updated successfully!", "success");

    } catch (error) {
      toast(
        error.message || "Could not save your profile.",
        "error"
      );

    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  return (
    <section className="page-section">
      <p className="tagline">YOUR ACCOUNT</p>

      <h1 className="page-title">Edit Profile</h1>

      <p className="muted">
        Manage your personal information.
        Academic details are managed by the university.
      </p>

      <form className="profile-form" onSubmit={submit}>

        <label htmlFor="pf-id">
          College ID
        </label>

        <input
          id="pf-id"
          value={student.studentId || student.id || ""}
          readOnly
          disabled
        />

        <label htmlFor="pf-name">
          Full Name
        </label>

        <input
          id="pf-name"
          name="name"
          value={form.name}
          onChange={change}
          maxLength={60}
          required
          disabled={saving}
        />

        <label htmlFor="pf-email">
          Email Address
        </label>

        <input
          id="pf-email"
          name="email"
          type="email"
          value={form.email}
          onChange={change}
          maxLength={254}
          required
          disabled={saving}
        />

        <label htmlFor="pf-year">
          Academic Year
        </label>

        <input
          id="pf-year"
          value={student.year || ""}
          readOnly
          disabled
        />

        <label htmlFor="pf-semester">
          Semester
        </label>

        <input
          id="pf-semester"
          value={student.semester || ""}
          readOnly
          disabled
        />

        <label htmlFor="pf-course">
          Course / Department
        </label>

        <input
          id="pf-course"
          value={student.course || "Not assigned"}
          readOnly
          disabled
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "Saving Profile..." : "Save Profile"}
        </button>

      </form>
    </section>
  );
}
