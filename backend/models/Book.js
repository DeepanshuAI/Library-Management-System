import mongoose from 'mongoose';

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200', // Default generic book cover
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    checkedOutBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        issueDate: {
          type: Date,
          default: Date.now,
        },
        dueDate: {
          type: Date,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
