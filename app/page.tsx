import React from 'react'
import ProductList from './components/ProductList'
import AdvancedProductList from './components/AdvancedProductList'
const HomePage = () => {
  return (
    <div>
      <ProductList />
      <AdvancedProductList />
    </div>
  )
}

export default HomePage