"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
};

type SortOption = "none" | "price-asc" | "price-desc" | "name-asc";

const ITEMS_PER_PAGE = 8;

export default function AdvancedProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters / UI state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState<number | "">(0);
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sort, setSort] = useState<SortOption>("none");
  const [page, setPage] = useState(1);

  // Load products from FakeStore API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
        setProducts(data);

        // Init price filters from data
        const prices = data.map((p) => p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinPrice(min);
        setMaxPrice(max);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Category list (unique)
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...cats];
  }, [products]);

  // Derived filtered + sorted data
  const filteredAndSorted = useMemo(() => {
    let list = [...products];

    // SEARCH filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }

    // CATEGORY filter
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    // PRICE filter
    list = list.filter((p) => {
      const min = typeof minPrice === "number" ? minPrice : 0;
      const max =
        typeof maxPrice === "number" && !Number.isNaN(maxPrice)
          ? maxPrice
          : Infinity;
      return p.price >= min && p.price <= max;
    });

    // SORT
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "name-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [products, search, category, minPrice, maxPrice, sort]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE)
  );

  const currentPageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, end);
  }, [filteredAndSorted, page]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    if (products.length) {
      const prices = products.map((p) => p.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
    } else {
      setMinPrice(0);
      setMaxPrice("");
    }
    setSort("none");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  if (loading) return <p className="p-6">Loading products...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Products (Advanced Filters)</h2>
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 "
        >
          Clear Filters
        </button>
      </div>

      {/* Filters Panel */}
      <div className="grid gap-4 md:grid-cols-4 bg-gray-50 p-4 rounded-lg border text-gray-800">
        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Search</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        
        {/* Sort */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Sort</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentPageItems.map((product) => (
          <article
            key={product.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col"
          >
            <div className="flex-1">
              <Image
                src={product.image}
                alt={product.title}
                width={200}
                height={200}
                className="w-full h-40 object-contain mb-3"
              />
              <div className="">
                <h3 className="font-semibold text-gray-700 text-sm line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-700 mt-1">{product.category}</p>
                <p className="font-bold text-gray-800 text-lg mt-2">₹{product.price}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No products match current filters.
        </p>
      )}

      {/* Pagination */}
      {filteredAndSorted.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
