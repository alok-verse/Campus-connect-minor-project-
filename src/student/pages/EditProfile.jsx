import { useEffect, useState } from "react";
import { YEARS } from "../../config";
import { useAuth } from "../../context/useAuth";
import { useUI } from "../../context/useUI";

export default function EditProfile() {
  const { student, updateStudent } = useAuth();
  const { toast } = useUI();
  const [form, setForm] = useState({
    name: student.name,
    email: student.email,
    year: student.year,
    course: student.course || "",
  });

  useEffect(() => {
    document.title = "Edit Profile | Campus Connect";
  }, []);

  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast("Please enter your full name.", "error");
      return;
    }
    const saved = updateStudent({
      name,
      email: form.email.trim(),
      year: form.year,
      course: form.course.trim(),
    });
    toast(saved ? "Profile updated successfully!" : "Could not save your profile.", saved ? "success" : "error");
  };

  return (
    <section className="page-section">
      <p className="tagline">YOUR ACCOUNT</p>
      <h1 className="page-title">Edit Profile</h1>
      <p className="muted">Keep your details up to date. Your year decides which batch events you can join.</p>

      <form className="profile-form" onSubmit={submit}>
        <label htmlFor="pf-id">College ID</label>
        <input id="pf-id" value={student.id} readOnly disabled />

        <label htmlFor="pf-name">Full Name</label>
        <input id="pf-name" name="name" value={form.name} onChange={change} maxLength={60} required />

        <label htmlFor="pf-email">Email Address</label>
        <input id="pf-email" name="email" type="email" value={form.email} onChange={change} required />

        <label htmlFor="pf-year">Year</label>
        <select id="pf-year" name="year" value={form.year} onChange={change}>
          {YEARS.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>

        <label htmlFor="pf-course">Course (optional)</label>
        <input id="pf-course" name="course" value={form.course} onChange={change} placeholder="e.g. BCA" maxLength={40} />

        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
    </section>
  );
}
