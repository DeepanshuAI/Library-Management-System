import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Book from './models/Book.js';
import connectDB from './config/db.js';

dotenv.config();

const students = Array.from({ length: 50 }, (_, i) => ({
  name: `Student ${i + 1}`,
  email: `student${i + 1}@example.com`,
  password: 'student123',
  role: 'user',
  studentId: `STU${1000 + i}`,
  phone: `98765${(10000 + i).toString().slice(1)}`
}));

const books = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic', quantity: 5, imageUrl: 'https://images.unsplash.com/photo-1543005128-d39eef402383?q=80&w=200' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Classic', quantity: 3, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200' },
  { title: '1984', author: 'George Orwell', genre: 'Dystopian', quantity: 4, imageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=200' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', genre: 'Classic', quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', quantity: 6, imageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=200' },
  { title: 'Brave New World', author: 'Aldous Huxley', genre: 'Dystopian', quantity: 3, imageUrl: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=200' },
  { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', quantity: 8, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Classic', quantity: 4, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200' },
  { title: 'The Book Thief', author: 'Markus Zusak', genre: 'Historical Fiction', quantity: 3, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200' },
  { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', genre: 'Fantasy', quantity: 10, imageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=200' },
];

// Fill up to 75 books with variations
const extraBooks = Array.from({ length: 65 }, (_, i) => ({
  title: `Library Book Vol. ${i + 1}`,
  author: i % 2 === 0 ? 'Various Authors' : 'Collection Series',
  genre: ['Science', 'History', 'Technology', 'Art', 'Biography'][i % 5],
  quantity: Math.floor(Math.random() * 5) + 1,
  imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200'
}));

const allBooks = [...books, ...extraBooks];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data (but keep admin if you want, or just re-seed everything)
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Book.deleteMany();

    await User.insertMany(students);
    await Book.insertMany(allBooks);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Book.deleteMany();
    await User.deleteMany({ role: { $ne: 'admin' } });

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
