import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Shop.css';

const CATEGORIES = ['All', 'Dresses', 'Tops', 'Bottoms', 'Accessories'];
const GENDERS = ['All', 'Women', 'Men', 'Unisex'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const COLORS = ['Black', 'White', 'Beige', 'Red', 'Blue'];

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();

    // UI State
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
    const [activeGender, setActiveGender] = useState(searchParams.get('gender') || 'All');
    const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
    const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [sort, setSort] = useState(searchParams.get('sort') || '');
    const search = searchParams.get('search') || '';

    // Data State
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Products with active filters
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Build Query Params
            const queryParams = new URLSearchParams();
            if (activeCategory !== 'All') queryParams.append('category', activeCategory);
            if (activeGender !== 'All') queryParams.append('gender', activeGender);
            if (selectedSize) queryParams.append('size', selectedSize);
            if (selectedColor) queryParams.append('color', selectedColor);
            if (minPrice) queryParams.append('minPrice', minPrice);
            if (maxPrice) queryParams.append('maxPrice', maxPrice);
            if (inStock) queryParams.append('inStock', 'true');
            if (sort) queryParams.append('sort', sort);
            if (search) queryParams.append('search', search);

            // Update URL silently
            setSearchParams(queryParams, { replace: true });

            const response = await fetch(`http://localhost:5001/api/products?${queryParams.toString()}`);
            const result = await response.json();
            setProducts(result.data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, activeGender, selectedSize, selectedColor, minPrice, maxPrice, inStock, sort, search, setSearchParams]);

    // Initial and dependency fetch
    useEffect(() => {
        // Debounce fetching if needed, but for now simple fetch
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300); // 300ms debounce for sliders/inputs

        return () => clearTimeout(delayDebounceFn);
    }, [fetchProducts]);


    return (
        <div className="shop-page container animate-fade-in">
            <header className="shop-header">
                {search ? (
                    <h1>Search Results for "{search}"</h1>
                ) : (
                    <h1>The Collection</h1>
                )}
                <p>Explore our thoughtfully curated selection of luxury pieces designed for the modern individual.</p>
            </header>

            <div className="shop-layout">
                {/* Sidebar Filters */}
                <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>

                    <div className="filter-group">
                        <h3>Availability</h3>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                            />
                            In Stock Only
                        </label>
                    </div>

                    <div className="filter-group">
                        <h3>Gender</h3>
                        <ul className="category-list">
                            {GENDERS.map(g => (
                                <li key={g}>
                                    <button
                                        className={`category-btn ${activeGender === g ? 'active' : ''}`}
                                        onClick={() => setActiveGender(g)}
                                    >
                                        {g}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-group">
                        <h3>Categories</h3>
                        <ul className="category-list">
                            {CATEGORIES.map(cat => (
                                <li key={cat}>
                                    <button
                                        className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-group">
                        <h3>Size</h3>
                        <div className="size-grid">
                            {SIZES.map(size => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>Price Range</h3>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min $"
                                className="price-input"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max $"
                                className="price-input"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>Color</h3>
                        <div className="color-grid">
                            {COLORS.map(color => (
                                <label key={color} className="color-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedColor === color}
                                        onChange={() => setSelectedColor(color === selectedColor ? '' : color)}
                                    />
                                    {color}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        className="clear-filters-btn"
                        onClick={() => {
                            setActiveCategory('All');
                            setActiveGender('All');
                            setSelectedSize('');
                            setSelectedColor('');
                            setMinPrice('');
                            setMaxPrice('');
                            setInStock(false);
                            setSort('');
                        }}
                    >
                        Clear All Filters
                    </button>
                </aside>

                {/* Main Content */}
                <div className="shop-main">
                    <div className="shop-toolbar">
                        <button
                            className="mobile-filter-btn"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} /> Filters
                        </button>

                        <div className="sort-dropdown">
                            <span>Sort by: </span>
                            <select
                                className="sort-select"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="">Featured</option>
                                <option value="newest">New Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>

                        <div className="results-count">
                            {loading ? <Loader size={16} className="spinning" /> : `${products.length} Results`}
                        </div>
                    </div>

                    {!loading && products.length === 0 ? (
                        <div className="no-results">
                            <h2>No products match your criteria.</h2>
                            <p>Try adjusting your filters or search term.</p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {products.map(product => (
                                <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                                    <div className="product-image-container">
                                        <img src={product.image} alt={product.name} className="product-image" />

                                        {!product.in_stock && (
                                            <div className="out-of-stock-badge">Sold Out</div>
                                        )}

                                        <div className="product-action" onClick={(e) => {
                                            e.preventDefault();
                                            if (product.in_stock) {
                                                addToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.price,
                                                    image: product.image,
                                                    category: product.category,
                                                    size: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : '',
                                                    color: Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : '',
                                                    quantity: 1
                                                });
                                            }
                                        }}>
                                            <button className="add-to-cart-btn" disabled={!product.in_stock}>
                                                {product.in_stock ? 'Quick Add' : 'Sold Out'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <h3>
                                            {/* Highlight search term if it exists */}
                                            {search ? (
                                                <span dangerouslySetInnerHTML={{
                                                    __html: product.name.replace(new RegExp(search, 'gi'), (match: string) => `<mark class="highlight">${match}</mark>`)
                                                }} />
                                            ) : product.name}
                                        </h3>
                                        <p className="product-price">${product.price.toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
