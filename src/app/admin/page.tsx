'use client'
import { useState, useEffect } from "react";
import { addUser, getUsers, updateUser, deleteUser } from "./action";
import { users } from "@/lib/db/schema";
import Attendance from "@/components/Attendance";

type User = typeof users.$inferSelect;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    const allUsers = await getUsers();
    setUsers(allUsers);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Wrong password");
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser({ name });
      alert("User added successfully");
      setName("");
      fetchUsers();
    } catch (error) {
      alert("Error adding user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        alert("User deleted successfully");
        fetchUsers();
      } catch (error) {
        alert("Error deleting user");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, { name: editingUser.name });
      alert("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert("Error updating user");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="border p-2"
          />
          <button type="submit" className="bg-blue-500 text-white p-2">
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      <div className="flex mb-4 border-b">
        <button
          className={`py-2 px-4 ${activeTab === "users" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "attendance" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
      </div>

      {activeTab === "users" && (
        <div>
          <form onSubmit={handleAddUserSubmit} className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
              className="border p-2"
            />
            <button type="submit" className="bg-green-500 text-white p-2">
              Add User
            </button>
          </form>

          <h2 className="text-xl font-bold mb-2">User List</h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between border p-2">
                {editingUser && editingUser.id === user.id ? (
                  <form onSubmit={handleUpdateUser} className="flex items-center">
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="border p-1"
                    />
                    <button type="submit" className="bg-blue-500 text-white p-1 ml-2">
                      Save
                    </button>
                    <button onClick={() => setEditingUser(null)} className="bg-gray-500 text-white p-1 ml-2">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <span>{user.name}</span>
                    <div>
                      <button onClick={() => handleEditUser(user)} className="bg-yellow-500 text-white p-1 mr-2">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white p-1">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "attendance" && <Attendance />}
    </div>
  );
}