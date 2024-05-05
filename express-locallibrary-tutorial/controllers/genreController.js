const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render("genre_list", { title: "Genre List", genre_list: allGenres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  // Check if there are any books associated with this genre
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }).exec(),
  ]);

  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  // If books are still associated with the genre, do not allow deletion
  if (genreBooks.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: genre,
      genre_books: genreBooks,
    });
    return;
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre: genre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check again for any associated books to handle concurrent changes
  const genreBooks = await Book.find({ genre: id }).exec();

  if (genreBooks.length > 0) {
    // If books are associated, render the same deletion page with a warning
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: { _id: id },
      genre_books: genreBooks,
      error: "Genre has associated books and cannot be deleted.",
    });
    return;
  }

  // If no books are associated, proceed with deletion
  await Genre.findByIdAndDelete(id);
  res.redirect("/catalog/genres"); // Redirect to the list of genres
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
