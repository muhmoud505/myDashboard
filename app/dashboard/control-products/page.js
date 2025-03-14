'use client';
import { useState, useEffect } from 'react';

export default function ControlProducts() {
  const generateSlug = (name) => {
    return name ? name.toLowerCase().replace(/\s+/g, '-') + '-uniCode' : '';
  };

  // State for products list
  const [products, setProducts] = useState([]);
  // State for form data (add or edit)
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    brand: '',
    category: '',
    description: '',
    price: '',
    countInStock: '',
  });
  // State for editing product and modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch('/api/product');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        } else {
          setFetchError(data.message || 'Failed to fetch products');
        }
      } catch (error) {
        setFetchError('Error fetching products: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError(null); // Clear error on input change
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
      setFormError('Only JPEG or PNG images are allowed');
    } else {
      setFormData({ ...formData, image: file });
      setFormError(null);
    }
  };

  // Validate form data
  const validateForm = () => {
    const { name, brand, category, description, price, countInStock, image } = formData;
    if (!name.trim()) return 'Product name is required';
    if (!brand.trim()) return 'Brand is required';
    if (!category.trim()) return 'Category is required';
    if (!description.trim()) return 'Description is required';
    if (!price || isNaN(price) || Number(price) < 0) return 'Price must be a positive number';
    if (!countInStock || isNaN(countInStock) || Number(countInStock) < 0)
      return 'Stock must be a non-negative number';
    if (!editingProduct && !image) return 'Image is required for new products';
    return null;
  };

  // Handle form submission (add or update)
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
    formDataToSend.append('slug', generateSlug(formData.name));
    if (editingProduct) {
      formDataToSend.append('_id', editingProduct._id);
    }

    try {
      const url = editingProduct ? `/api/product/${editingProduct._id}` : '/api/product';
      const method = editingProduct ? 'PUT' : 'POST';

      console.log('Form data entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'image' ? 'File object' : pair[1]));
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        if (editingProduct) {
          setProducts(
            products.map((product) =>
              product._id === editingProduct._id ? data.data : product
            )
          );
        } else {
          setProducts([...products, data.data]);
        }
        resetForm();
        setIsModalOpen(false);
      } else {
        setFormError(data.message || 'Failed to save product');
      }
    } catch (error) {
      setFormError('Error submitting form: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      name: '',
      image: null,
      brand: '',
      category: '',
      description: '',
      price: '',
      countInStock: '',
    });
    setEditingProduct(null);
    setFormError(null);
  };

  // Handle edit button click (open modal)
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      image: null,
      brand: product.brand,
      category: product.category,
      description: product.description,
      price: product.price,
      countInStock: product.countInStock,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/product/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setProducts(products.filter((product) => product._id !== id));
        } else {
          setFormError(data.message || 'Failed to delete product');
        }
      } catch (error) {
        setFormError('Error deleting product: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 min-h-screen">
      <h1 className="text-2xl text-gray-500 font-bold mb-6 dark:text-white">Control Products</h1>

      {/* Add Product Form */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-500">Add New Product</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data"className="bg-gray-300 dark:bg-gray-700 p-6 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              disabled={isLoading}
            />
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              accept="image/*"
              disabled={isLoading}
            />
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              disabled={isLoading}
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              disabled={isLoading}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              disabled={isLoading}
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
            <input
              type="number"
              name="countInStock"
              placeholder="Stock"
              value={formData.countInStock}
              onChange={handleInputChange}
              className="p-2 border rounded bg-gray-100 text-gray-500 dark:{text-white,bg-white}"
              min="0"
              disabled={isLoading}
            />
          </div>
          {formError && !editingProduct && (
            <p className="mt-2 text-red-500">{formError}</p>
          )}
          <button
            type="submit"
            className={`mt-4 px-4 py-2 rounded text-white ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </section>

      {/* Products List */}
      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Product List</h2>
        {isLoading && !products.length && (
          <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
        )}
        {fetchError && (
          <p className="text-red-500 mb-4">{fetchError}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 && !isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">No products found.</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="border p-4 rounded shadow dark:bg-gray-800 bg-gray-300 text-gray-500 ">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover mb-4"
                />
                <h2 className="text-xl font-semibold dark:text-white">{product.name}</h2>
                <p className="text-gray-400">Brand: {product.brand}</p>
                <p className="text-gray-400">Category: {product.category}</p>
                <p className="text-gray-400">Price: ${product.price}</p>
                <p className="text-gray-400">Stock: {product.countInStock}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className={`text-blue-500 ${
                      isLoading ? 'cursor-not-allowed' : 'hover:text-blue-400'
                    }`}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className={`text-red-500 ${
                      isLoading ? 'cursor-not-allowed' : 'hover:text-red-400'
                    }`}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Edit Product</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  disabled={isLoading}
                />
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  accept="image/*"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="brand"
                  placeholder="Brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  disabled={isLoading}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  disabled={isLoading}
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                <input
                  type="number"
                  name="countInStock"
                  placeholder="Stock"
                  value={formData.countInStock}
                  onChange={handleInputChange}
                  className="p-2 border rounded bg-gray-700 dark:{text-white} text-gray-500"
                  min="0"
                  disabled={isLoading}
                />
              </div>
              {formError && editingProduct && (
                <p className="mt-2 text-red-500">{formError}</p>
              )}
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
                  {isLoading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}