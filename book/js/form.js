const API_BASE_URL = "http://localhost:8080";
const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");

document.addEventListener("DOMContentLoaded", function () {
  loadBooks();
});

bookForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const bookFormData = new FormData(bookForm);

  const bookData = {
    title: bookFormData.get("title").trim(),
    author: bookFormData.get("author").trim(),
    isbn: bookFormData.get("isbn").trim(),
    price: parseInt(bookFormData.get("price")),
    publishDate: bookFormData.get("publishDate")
  };

  fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bookData)
  })
  .then(response => {
    if (!response.ok) throw new Error("도서 등록 실패");
    return response.json();
  })
  .then(data => {
    loadBooks();
    bookForm.reset();
  })
  .catch(error => {
    console.error("에러 발생:", error);
  });
});

function loadBooks() {
  fetch(`${API_BASE_URL}/books`)
    .then(response => response.json())
    .then(data => {
      bookTableBody.innerHTML = "";
      data.forEach(book => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.isbn}</td>
          <td>${book.price}</td>
          <td>${book.publishDate}</td>
        `;
        bookTableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error("도서 목록 로드 실패:", error);
    });
}
