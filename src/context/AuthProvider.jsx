import { useCallback, useMemo } from "react";
import { AuthContext } from "./auth-context";
import { KEYS } from "../config";
import { EMPTY_OBJECT, useStored } from "../utils/storage";
import { createStudent } from "../utils/student";

/*
  Demo authentication (no backend): the student and admin sessions are kept in
  localStorage independently, so you can be logged in as both in different tabs.
*/

export default function AuthProvider({ children }) {
  const [studentId, setStudentId] = useStored(KEYS.studentSession, null);
  const [isAdmin, setIsAdmin] = useStored(KEYS.adminSession, false);
  const [profiles, setProfiles] = useStored(KEYS.students, EMPTY_OBJECT);

  const student = studentId ? profiles[studentId] ?? null : null;

  const loginStudent = useCallback(
    (id) => {
      // Keep an existing profile (edited name, year...) when the student logs in again.
      setProfiles((current) => ({ ...current, [id]: current[id] ?? createStudent(id) }));
      setStudentId(id);
    },
    [setProfiles, setStudentId]
  );

  const updateStudent = useCallback(
    (patch) => {
      if (!studentId) return false;
      return setProfiles((current) => ({
        ...current,
        [studentId]: { ...current[studentId], ...patch },
      }));
    },
    [studentId, setProfiles]
  );

  const logoutStudent = useCallback(() => setStudentId(null), [setStudentId]);
  const loginAdmin = useCallback(() => setIsAdmin(true), [setIsAdmin]);
  const logoutAdmin = useCallback(() => setIsAdmin(false), [setIsAdmin]);

  const value = useMemo(
    () => ({
      student,
      isAdmin: Boolean(isAdmin),
      loginStudent,
      updateStudent,
      logoutStudent,
      loginAdmin,
      logoutAdmin,
    }),
    [student, isAdmin, loginStudent, updateStudent, logoutStudent, loginAdmin, logoutAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
