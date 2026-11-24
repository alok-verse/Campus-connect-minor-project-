
import { useCallback, useMemo } from "react";
import { AuthContext } from "./auth-context";
import { KEYS } from "../config";
import { EMPTY_OBJECT, useStored } from "../utils/storage";
import { createStudent } from "../utils/student";
import { loginUser } from "../services/authApi";

export default function AuthProvider({ children }) {
  const [studentSession, setStudentSession] = useStored(
    "campus_student_auth_v1", null
  );

  const [adminSession, setAdminSession] = useStored(
    "campus_admin_auth_v1", null
  );

  const [profiles, setProfiles] = useStored(
    KEYS.students, EMPTY_OBJECT
  );

  const studentId = studentSession?.user?.studentId;

  const student = studentId
    ? profiles[studentId] ?? studentSession.user
    : null;

  const isAdmin = Boolean(
    adminSession?.token &&
    adminSession?.user?.role === "admin"
  );

  // Real student authentication
  const loginStudent = useCallback(
    async (id, password) => {
      const data = await loginUser({
        studentId: id,
        password,
        role: "student"
      });

      setProfiles((current) => ({
        ...current,
        [id]: {
          ...createStudent(id),
          ...current[id],
          ...data.user
        }
      }));

      setStudentSession({
        token: data.token,
        user: data.user
      });

      return data;
    },
    [setProfiles, setStudentSession]
  );

  // Real admin authentication
  const loginAdmin = useCallback(
    async (email, password) => {
      const data = await loginUser({
        email,
        password,
        role: "admin"
      });

      setAdminSession({
        token: data.token,
        user: data.user
      });

      return data;
    },
    [setAdminSession]
  );

  const updateStudent = useCallback(
    (patch) => {
      if (!studentId) return false;

      return setProfiles((current) => ({
        ...current,
        [studentId]: {
          ...current[studentId],
          ...patch
        }
      }));
    },
    [studentId, setProfiles]
  );

  const logoutStudent = useCallback(
    () => setStudentSession(null),
    [setStudentSession]
  );

  const logoutAdmin = useCallback(
    () => setAdminSession(null),
    [setAdminSession]
  );

  const value = useMemo(
    () => ({
      student,
      isAdmin,
      admin: adminSession?.user ?? null,
      studentToken: studentSession?.token ?? null,
      adminToken: adminSession?.token ?? null,
      loginStudent,
      loginAdmin,
      updateStudent,
      logoutStudent,
      logoutAdmin
    }),
    [
      student,
      isAdmin,
      studentSession,
      adminSession,
      loginStudent,
      loginAdmin,
      updateStudent,
      logoutStudent,
      logoutAdmin
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
