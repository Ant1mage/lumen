import React from 'react';

interface StockCardProps {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
}

const StockCard: React.FC<StockCardProps> = ({ 
  symbol, 
  name = '加载中...', 
  price = 0, 
  change = 0 
}) => {
  const isPositive = change >= 0;
  
  return (
    <div className="stock-card">
      <div className="stock-header">
        <h3 className="stock-symbol">{symbol}</h3>
        <span className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
      <p className="stock-name">{name}</p>
      <p className="stock-price">${price.toFixed(2)}</p>
    </div>
  );
};

export default StockCard;
