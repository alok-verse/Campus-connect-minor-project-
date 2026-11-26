
import { useCallback, useEffect, useMemo } from "react";
import { AuthContext } from "./auth-context";
import { useStored } from "../utils/storage";
import { YEARS } from "../config";

import {
  loginUser,
  getCurrentUser,
  updateStudentProfile,
} from "../services/authApi";

// Convert database user into frontend student format
function mapStudent(user) {
  if (!user) return null;

  const semester = Number(user.semester);
  const year = Math.min(
    4,
    Math.max(1, Math.ceil((semester || 1) / 2))
  );

  return {
    ...user,
    mongoId: user._id || user.id,
    id: user.studentId,
    studentId: user.studentId,
    name: user.name || "",
    email: user.email || "",
    year: YEARS[year - 1],
    course: user.department || "",
    semester: semester || 1,
  };
}

export default function AuthProvider({ children }) {
  const [studentSession, setStudentSession] = useStored(
    "campus_student_auth_v1",
    null
  );

  const [adminSession, setAdminSession] = useStored(
    "campus_admin_auth_v1",
    null
  );

  const studentToken = studentSession?.token ?? null;
  const adminToken = adminSession?.token ?? null;

  const student = useMemo(
    () => mapStudent(studentSession?.user),
    [studentSession]
  );

  const isAdmin = Boolean(
    adminToken &&
    adminSession?.user?.role === "admin"
  );

  // Fetch latest student profile from MongoDB
  useEffect(() => {
    if (!studentToken) return;

    let active = true;

    async function loadProfile() {
      try {
        const user = await getCurrentUser(studentToken);

        if (!active) return;

        setStudentSession((current) => {
          if (current?.token !== studentToken) {
            return current;
          }

          return {
            ...current,
            user,
          };
        });

      } catch (error) {
        console.error(
          "Could not refresh student profile:",
          error.message
        );
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [studentToken, setStudentSession]);

  // Student login
  const loginStudent = useCallback(
    async (id, password) => {
      const data = await loginUser({
        studentId: id,
        password,
        role: "student",
      });

      setStudentSession({
        token: data.token,
        user: data.user,
      });

      return data;
    },
    [setStudentSession]
  );

  // Admin login
  const loginAdmin = useCallback(
    async (email, password) => {
      const data = await loginUser({
        email,
        password,
        role: "admin",
      });

      setAdminSession({
        token: data.token,
        user: data.user,
      });

      return data;
    },
    [setAdminSession]
  );

  // Update student profile in MongoDB
  const updateStudent = useCallback(
    async (patch) => {
      if (!studentToken) {
        throw new Error("Please log in again.");
      }

      const user = await updateStudentProfile(
        {
          name: patch.name,
          email: patch.email,
        },
        studentToken
      );

      setStudentSession((current) => {
        if (current?.token !== studentToken) {
          return current;
        }

        return {
          ...current,
          user,
        };
      });

      return true;
    },
    [studentToken, setStudentSession]
  );

  // Student logout
  const logoutStudent = useCallback(
    () => setStudentSession(null),
    [setStudentSession]
  );

  // Admin logout
  const logoutAdmin = useCallback(
    () => setAdminSession(null),
    [setAdminSession]
  );

  const value = useMemo(
    () => ({
      student,
      isAdmin,
      admin: adminSession?.user ?? null,
      studentToken,
      adminToken,
      loginStudent,
      loginAdmin,
      updateStudent,
      logoutStudent,
      logoutAdmin,
    }),
    [
      student,
      isAdmin,
      adminSession,
      studentToken,
      adminToken,
      loginStudent,
      loginAdmin,
      updateStudent,
      logoutStudent,
      logoutAdmin,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
