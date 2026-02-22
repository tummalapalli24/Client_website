import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface WishlistItem {
    id?: number;
    wishlist_id?: number;
    product_id: number;
    name: string;
    price: number;
    image: string;
    category?: string;
    in_stock?: number;
    is_visible?: number;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (item: WishlistItem) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const { user, token } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('boutique_wishlist');
        if (saved && !user) {
            try {
                setWishlistItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse local wishlist');
            }
        }
        setIsInitialized(true);
    }, []);

    // Sync when user changes (logs in)
    useEffect(() => {
        if (!isInitialized) return;

        if (user && token) {
            // User logged in, prepare to sync
            const syncAndFetch = async () => {
                const localWishlist = JSON.parse(localStorage.getItem('boutique_wishlist') || '[]');

                if (localWishlist.length > 0) {
                    try {
                        await fetch('http://localhost:5001/api/wishlist/sync', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ localWishlist })
                        });
                        localStorage.removeItem('boutique_wishlist');
                    } catch (e) {
                        console.error('Error syncing local wishlist to DB:', e);
                    }
                }

                // Fetch DB wishlist
                fetchDBWishlist();
            };
            syncAndFetch();
        } else {
            // User logged out
            setWishlistItems([]);
        }
    }, [user, token, isInitialized]);

    const fetchDBWishlist = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/wishlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.wishlist) {
                setWishlistItems(data.wishlist);
            }
        } catch (e) {
            console.error('Failed to fetch wishlist:', e);
        }
    };

    const addToWishlist = async (item: WishlistItem) => {
        // Prevent dupes
        if (wishlistItems.some(w => w.product_id === (item.product_id || item.id))) return;

        const newItem = { ...item, product_id: item.product_id || item.id! };
        setWishlistItems(prev => [...prev, newItem]);

        if (user && token) {
            try {
                await fetch('http://localhost:5001/api/wishlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ product_id: newItem.product_id })
                });
            } catch (e) {
                console.error('Failed to add to DB wishlist', e);
            }
        } else {
            const updated = [...wishlistItems, newItem];
            localStorage.setItem('boutique_wishlist', JSON.stringify(updated));
        }
    };

    const removeFromWishlist = async (productId: number) => {
        setWishlistItems(prev => prev.filter(w => w.product_id !== productId));

        if (user && token) {
            try {
                await fetch(`http://localhost:5001/api/wishlist/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                console.error('Failed to remove from DB wishlist', e);
            }
        } else {
            const updated = wishlistItems.filter(w => w.product_id !== productId);
            localStorage.setItem('boutique_wishlist', JSON.stringify(updated));
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlistItems.some(w => w.product_id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};
