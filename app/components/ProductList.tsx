"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <p className="p-6">Loading products...</p>;

  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold mb-6">All Products List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p)=> (
            <div key={p.id} className="border p-4 rounded-sm hover:shadow-lg transition ">
             <div className="w-full h-48 flex items-center justify-center bg-gray-300 rounded-md mb-4 ">
                <Image 
                src={p.image}
                alt={p.title}
                width={200}
                height={200}
                className='object-contain h-full'
                />
             </div>
             <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-gray-400 text-sm">{p.category}</p>
             <p className="text-xl font-bold">{p.price}</p>
             <div className="flex pl-4 gap-3 mt-4">
                <button className="px-4 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600">Edit</button>
                <button onClick={()=> handleDelete(p.id)} className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
             </div>

            </div>
        ))}
      </div>
      {/* No Products Left */}
      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No Product available</p>
      )}
    </section>
  );
}
