'use client';
import React, { useState, useEffect } from 'react';

export default function ControlUsers() {
  const [fileName, setFileName] = useState('No file chosen');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
    confirmEmail: false,
    image: null,
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          setFetchError(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        setFetchError('Error fetching users: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setFormError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
      setFormError('Only JPEG or PNG images are allowed');
      setFileName('No file chosen');
    } else if (file) {
      setFormData({ ...formData, image: file });
      setFileName(file.name);
      setFormError(null);
    } else {
      setFileName('No file chosen');
    }
  };

  const validateForm = () => {
    const { name, email, password } = formData;
    if (!name.trim()) return 'Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Valid email is required';
    if (!editingUser && (!password || password.length < 6)) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsLoading(true);
    setFormError(null);

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'image' && formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const url = editingUser ? `/api/user/${editingUser._id}` : '/api/user';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        if (editingUser) {
          setUsers(users.map((user) => (user._id === editingUser._id ? data.data : user)));
        } else {
          setUsers([...users, data.data]);
        }
        resetForm();
        setIsModalOpen(false);
      } else {
        setFormError(data.message || 'Failed to save user');
      }
    } catch (error) {
      setFormError('Error submitting form: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      isAdmin: false,
      confirmEmail: false,
      image: null,
    });
    setFileName('No file chosen');
    setEditingUser(null);
    setFormError(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin,
      confirmEmail: user.confirmEmail,
      image: null,
    });
    setFileName('No file chosen');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/${id}`, {
          method: 'DELETE',
          credentials:'include'
        });
        const data = await response.json();
        if (data.success) {
          setUsers(users.filter((user) => user._id !== id));
        } else {
          setFormError(data.message || 'Failed to delete user');
        }
      } catch (error) {
        setFormError('Error deleting user: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6 dark:bg-gray-800 bg-white min-h-screen">
      <h1 className="text-2xl text-gray-500 font-bold mb-6 dark:text-white">Control Users</h1>

      <section className="mb-12">
        <h2 className="text-xl text-gray-500 font-semibold mb-4 dark:text-white">Add New User</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-gray-300 dark:bg-gray-700 p-6 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:text-white dark:bg-gray-800"
              disabled={isLoading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange ={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:text-white dark:bg-gray-800"
              disabled={isLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:text-white dark:bg-gray-800"
              disabled={isLoading}
            />
            <label className="flex items-center space-x-2 text-gray-500 dark:text-white">
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span>Is Admin</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-500 dark:text-white">
              <input
                type="checkbox"
                name="confirmEmail"
                checked={formData.confirmEmail}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span>Email Confirmed</span>
            </label>
            <div className="flex items-center">
              <label className="pr-2 text-gray-500 dark:text-white">Profile Pic:</label>
              <label className="px-4 py-2 bg-blue-500 text-white rounded-l-md hover:bg-blue-600 cursor-pointer">
                <span>Browse</span>
                <input
                  type="file"
                  id="fileInput1"
                  name="image"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isLoading}
                />
              </label>
              <label
                htmlFor="fileInput1"
                className="border border-gray-300 rounded-r-md px-4 py-2 bg-gray-50 text-gray-500 overflow-hidden text-ellipsis max-w-xs"
              >
                {fileName}
              </label>
            </div>
          </div>
          {formError && !editingUser && <p className="mt-2 text-red-500">{formError}</p>}
          <button
            type="submit"
            className={`mt-4 px-4 py-2 rounded text-white ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-400">Users List</h2>
        {isLoading && !users.length && (
          <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
        )}
        {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
        {users.length === 0 && !isLoading ? (
          <p className="text-gray-500 dark:text-gray-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full dark:bg-gray-900 dark:text-white text-gray-500 rounded bg-white">
              <thead>
                <tr>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 border-b">Email</th>
                  <th className="p-2 border-b">Admin</th>
                  <th className="p-2 border-b">Email Confirmed</th>
                  <th className="p-2 border-b">Profile Pic</th>
                  <th className="p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700 dark:hover:bg-gray-600">
                    <td className="p-2 border-b">{user.name}</td>
                    <td className="p-2 border-b">{user.email}</td>
                    <td className="p-2 border-b">{user.isAdmin ? 'Yes' : 'No'}</td>
                    <td className="p-2 border-b">{user.confirmEmail ? 'Yes' : 'No'}</td>
                    <td className="p-2 border-b">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt="Profile" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-2 border-b">
                      <button
                        onClick={() => handleEdit(user)}
                        className={`text-blue-500 mr-2 ${isLoading ? 'cursor-not-allowed' : 'hover:text-blue-400'}`}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className={`text-red-500 ${isLoading ? 'cursor-not-allowed' : 'hover:text-red-400'}`}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg w-full max-w-md bg-gray-300 dark:bg-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-500">Edit User</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="p-2 border rounded dark:text-white dark:bg-gray-800 text-gray-500"
                  disabled={isLoading}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="p-2 border rounded dark:text-white dark:bg-gray-800 text-gray-500"
                  disabled={isLoading}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="New Password (optional)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="p-2 border rounded dark:text-white dark:bg-gray-800 text-gray-500"
                  disabled={isLoading}
                />
                <label className="flex items-center space-x-2 text-gray-500 dark:text-white">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span>Is Admin</span>
                </label>
                <label className="flex items-center space-x-2 text-gray-500 dark:text-white">
                  <input
                    type="checkbox"
                    name="confirmEmail"
                    checked={formData.confirmEmail}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span>Email Confirmed</span>
                </label>
                <div className="flex items-center">
                  <label className="pr-2 text-gray-500 dark:text-white">Profile Pic:</label>
                  <label className="px-4 py-2 bg-blue-500 text-white rounded-l-md hover:bg-blue-600 cursor-pointer">
                    <span>Browse</span>
                    <input
                      type="file"
                      id="fileInput1"
                      name="image"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      disabled={isLoading}
                    />
                  </label>
                  <label
                    htmlFor="fileInput1"
                    className="border border-gray-300 rounded-r-md px-4 py-2 bg-gray-50 text-gray-500 overflow-hidden text-ellipsis max-w-xs"
                  >
                    {fileName}
                  </label>
                </div>
              </div>
              {formError && editingUser && <p className="mt-2 text-red-500">{formError}</p>}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className={`px-4 py-2 rounded text-white ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}