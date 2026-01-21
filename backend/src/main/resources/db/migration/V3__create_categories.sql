-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_system BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system categories
INSERT INTO categories (name, type, icon, color, is_system) VALUES
-- Expense categories
('Food & Dining', 'EXPENSE', 'restaurant', '#FF6B6B', TRUE),
('Transportation', 'EXPENSE', 'directions_car', '#4ECDC4', TRUE),
('Shopping', 'EXPENSE', 'shopping_bag', '#45B7D1', TRUE),
('Entertainment', 'EXPENSE', 'movie', '#96CEB4', TRUE),
('Bills & Utilities', 'EXPENSE', 'receipt', '#FFEAA7', TRUE),
('Healthcare', 'EXPENSE', 'local_hospital', '#DDA0DD', TRUE),
('Education', 'EXPENSE', 'school', '#98D8C8', TRUE),
('Travel', 'EXPENSE', 'flight', '#F7DC6F', TRUE),
('Personal Care', 'EXPENSE', 'spa', '#BB8FCE', TRUE),
('Other Expense', 'EXPENSE', 'more_horiz', '#BDC3C7', TRUE),
-- Income categories
('Salary', 'INCOME', 'work', '#2ECC71', TRUE),
('Freelance', 'INCOME', 'laptop', '#3498DB', TRUE),
('Investments', 'INCOME', 'trending_up', '#9B59B6', TRUE),
('Gifts', 'INCOME', 'card_giftcard', '#E74C3C', TRUE),
('Other Income', 'INCOME', 'attach_money', '#1ABC9C', TRUE);

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_user_id ON categories(user_id);
