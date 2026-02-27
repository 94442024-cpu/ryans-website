import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, storage, theme } from '../utils';
import '../styles/App.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState('');
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [artistName, setArtistName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const auth = storage.getAuth();
    if (!auth || auth.user?.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const loadProducts = async () => {
    if (!adminKey.trim()) {
      setStatus('Enter admin key first to load products.');
      return;
    }
    try {
      const result = await api.loadAdminProducts(adminKey);
      if (result.error) {
        setStatus('Error: ' + (result.error || 'Failed to load products'));
        setProducts([]);
        return;
      }
      setProducts(Array.isArray(result) ? result : []);
      setStatus('✓ Products loaded successfully');
    } catch (error) {
      setStatus('Error: Could not load products.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setStatus('Error: Enter admin key first.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('artistName', artistName);
    formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);
    if (imageUrl) formData.append('imageUrl', imageUrl);

    setStatus('Publishing product...');
    try {
      const result = await api.publishAdminProduct(formData, adminKey);
      if (result.error) {
        setStatus('Error: ' + (result.error || 'Failed to publish'));
        return;
      }
      setStatus('✓ Product published successfully!');
      setTitle('');
      setPrice('');
      setArtistName('');
      setDescription('');
      setImageFile(null);
      setImageUrl('');
      setShowForm(false);
      await loadProducts();
    } catch (error) {
      setStatus('Error: Publish request failed.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const result = await api.deleteAdminProduct(productId, adminKey);
      if (result.error) {
        setStatus('Error: ' + (result.error || 'Failed to delete'));
        return;
      }
      setStatus('✓ Product deleted successfully.');
      await loadProducts();
    } catch (error) {
      setStatus('Error: Delete request failed.');
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <h1 style={{ color: theme.colors.dark, marginBottom: '20px' }}>🔒 Admin Panel</h1>

      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: theme.colors.light,
        borderRadius: '8px',
        border: `2px solid ${theme.colors.primary}`
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '1em',
              flex: 1,
              minWidth: '200px'
            }}
          />
          <button
            onClick={loadProducts}
            style={{
              padding: '10px 20px',
              background: theme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📂 Load Products
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              background: theme.colors.success,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showForm ? '✕ Cancel' : '+ New Product'}
          </button>
        </div>
      </div>

      {status && (
        <div style={{
          padding: '12px 15px',
          borderRadius: '4px',
          color: status.includes('Error') ? '#c62828' : '#2e7d32',
          background: status.includes('Error') ? '#ffcdd2' : '#c8e6c9',
          border: `1px solid ${status.includes('Error') ? '#ef5350' : '#81c784'}`,
          marginBottom: '20px'
        }}>
          {status}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          marginBottom: '30px',
          border: `2px solid ${theme.colors.primary}`,
          padding: '20px',
          borderRadius: '8px',
          background: theme.colors.light
        }}>
          <h2 style={{ color: theme.colors.dark, marginTop: '0' }}>📝 Add New Product</h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: theme.colors.dark }}>Product Title</label>
            <input
              type="text"
              placeholder="e.g., Handmade Ceramic Vase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`,
                boxSizing: 'border-box',
                fontSize: '1em'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: theme.colors.dark }}>Price (USD)</label>
              <input
                type="number"
                placeholder="99.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.colors.border}`,
                  boxSizing: 'border-box',
                  fontSize: '1em'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: theme.colors.dark }}>Artist Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.colors.border}`,
                  boxSizing: 'border-box',
                  fontSize: '1em'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: theme.colors.dark }}>Description</label>
            <textarea
              placeholder="Describe your product details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`,
                boxSizing: 'border-box',
                fontSize: '1em',
                height: '100px',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: theme.colors.dark }}>📸 Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0])}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.colors.border}`,
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: theme.colors.dark }}>Or Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.colors.border}`,
                  boxSizing: 'border-box',
                  fontSize: '1em'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: theme.colors.success,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em'
            }}
          >
            ✓ Publish Product
          </button>
        </form>
      )}

      <h2 style={{ color: theme.colors.dark, marginBottom: '15px' }}>📦 Your Products ({products.length})</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {products.length > 0 ? (
          products.map((product) => (
            <article
              key={product.id}
              style={{
                border: `1px solid ${theme.colors.border}`,
                padding: '15px',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                alignItems: 'center',
                background: '#fafafa',
                gap: '15px'
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              )}
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: theme.colors.dark }}>{product.title}</h3>
                <p style={{ fontSize: '0.9em', color: theme.colors.textMuted, margin: '0 0 5px 0' }}>
                  {product.description.substring(0, 80)}...
                </p>
                <p style={{ fontSize: '0.85em', color: theme.colors.textMuted, margin: '0' }}>
                  by <strong>{product.artistName}</strong>
                </p>
              </div>
              <span style={{ fontWeight: 'bold', color: theme.colors.primary, fontSize: '1.1em' }}>
                ${Number(product.price).toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(product.id)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background: theme.colors.danger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Delete
              </button>
            </article>
          ))
        ) : (
          <p style={{ color: theme.colors.textMuted, fontStyle: 'italic', padding: '20px', textAlign: 'center', background: theme.colors.light, borderRadius: '8px' }}>
            No products posted yet. Load or create one!
          </p>
        )}
      </div>
    </div>
  );
}
