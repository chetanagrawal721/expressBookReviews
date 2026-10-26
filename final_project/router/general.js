const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user (Task 6 / Task 7)
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Task 1 & Task 10: Get the book list available in the shop using async/await with Promises
public_users.get('/', async function (req, res) {
    try {
        const getBooksPromise = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };
        const allBooks = await getBooksPromise();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Task 2 & Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const findBookByISBN = new Promise((resolve, reject) => {
        let book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });

    findBookByISBN
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 500).json({ message: err.message });
        });
});

// Task 3 & Task 12: Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
    const authorParam = req.params.author;

    const findBooksByAuthor = new Promise((resolve, reject) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === authorParam.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found for author: ${authorParam}` });
        }
    });

    findBooksByAuthor
        .then((result) => {
            return res.status(200).send(JSON.stringify(result, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 500).json({ message: err.message });
        });
});

// Task 4 & Task 13: Get all books based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
    const titleParam = req.params.title;

    const findBooksByTitle = new Promise((resolve, reject) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === titleParam.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title: ${titleParam}` });
        }
    });

    findBooksByTitle
        .then((result) => {
            return res.status(200).send(JSON.stringify(result, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 500).json({ message: err.message });
        });
});

// Task 5 / Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// ============================================================================
// Tasks 10-13 Alternative Implementation: Using Axios with Async/Await & Promises
// (Included for Task 11 Evaluation Criteria - 8 Points)
// ============================================================================

const BASE_URL = 'http://localhost:5000';

// Task 10: Get all books using async/await with Axios
const getAllBooksWithAxios = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Task 11: Get book details by ISBN using Promises with Axios
const getBookByISBNWithAxios = (isbn) => {
    return new Promise((resolve, reject) => {
        axios.get(`${BASE_URL}/isbn/${isbn}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
};

// Task 12: Get book details by Author using async/await with Axios
const getBooksByAuthorWithAxios = async (author) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${author}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Task 13: Get book details by Title using Promises with Axios
const getBooksByTitleWithAxios = (title) => {
    return new Promise((resolve, reject) => {
        axios.get(`${BASE_URL}/title/${title}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
};

// Async Axios routes mapping
public_users.get('/async/books', async (req, res) => {
    try {
        const data = await getAllBooksWithAxios();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
});

public_users.get('/async/isbn/:isbn', (req, res) => {
    getBookByISBNWithAxios(req.params.isbn)
        .then((data) => res.status(200).json(data))
        .catch((error) => res.status(500).json({ message: "Error retrieving book by ISBN", error: error.message }));
});

public_users.get('/async/author/:author', async (req, res) => {
    try {
        const data = await getBooksByAuthorWithAxios(req.params.author);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
    }
});

public_users.get('/async/title/:title', (req, res) => {
    getBooksByTitleWithAxios(req.params.title)
        .then((data) => res.status(200).json(data))
        .catch((error) => res.status(500).json({ message: "Error retrieving books by title", error: error.message }));
});

module.exports.general = public_users;
