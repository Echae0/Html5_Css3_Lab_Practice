const API_BASE_URL = "http://localhost:8080";
let editId = null;

const form = document.getElementById("bookForm");
const tableBody = document.getElementById("bookTableBody");
const cancelButton = form.querySelector(".cancel-btn");
const submitButton = form.querySelector('button[type="submit"]');
const formError = document.getElementById("formError");

document.addEventListener("DOMContentLoaded", loadBooks);

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);

    const book = {
        title: formData.get("title").trim(),
        author: formData.get("author").trim(),
        isbn: formData.get("isbn").trim(),
        publishedDate: formData.get("publishedDate") || null
    };

    if (!validate(book)) return;

    if (editId) {
        updateBook(editId, book);
    } else {
        createBook(book);
    }
});

cancelButton.addEventListener("click", resetForm);

function validate(book) {
    if (!book.title || !book.author || !book.isbn) {
        alert("제목, 저자, ISBN은 필수 항목입니다.");
        return false;
    }
    const isbnPattern = /^[0-9\-]+$/;
    if (!isbnPattern.test(book.isbn)) {
        alert("ISBN은 숫자 또는 하이픈만 포함할 수 있습니다.");
        return false;
    }
    return true;
}

function loadBooks() {
    fetch(`${API_BASE_URL}/api/books`)
        .then(res => res.ok ? res.json() : Promise.reject("도서 목록 로딩 실패"))
        .then(data => {
            renderTable(data);
        })
        .catch(err => {
            showError(err);
            tableBody.innerHTML = `
                <tr><td colspan="5" style="color:red;">도서 목록을 불러오는 데 실패했습니다.</td></tr>
            `;
        });
}

function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(book => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.publishedDate || "-"}</td>
            <td>
                <button class="edit-btn" onclick="editBook(${book.id})">수정</button>
                <button class="delete-btn" onclick="deleteBook(${book.id})">삭제</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function createBook(book) {
    fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book)
    })
    .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.message)))
    .then(() => {
        showSuccess("도서 등록 완료!");
        resetForm();
        loadBooks();
    })
    .catch(err => showError(err));
}

function editBook(id) {
    fetch(`${API_BASE_URL}/api/books/${id}`)
        .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.message)))
        .then(book => {
            form.title.value = book.title;
            form.author.value = book.author;
            form.isbn.value = book.isbn;
            form.publishedDate.value = book.publishedDate || "";

            editId = id;
            submitButton.textContent = "도서 수정";
            cancelButton.style.display = "inline-block";
        })
        .catch(err => showError(err));
}

function updateBook(id, book) {
    fetch(`${API_BASE_URL}/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book)
    })
    .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.message)))
    .then(() => {
        showSuccess("도서 수정 완료!");
        resetForm();
        loadBooks();
    })
    .catch(err => showError(err));
}

function deleteBook(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    fetch(`${API_BASE_URL}/api/books/${id}`, {
        method: "DELETE"
    })
    .then(res => res.ok ? res.text() : res.json().then(e => Promise.reject(e.message)))
    .then(() => {
        showSuccess("도서 삭제 완료!");
        loadBooks();
    })
    .catch(err => showError(err));
}

function resetForm() {
    form.reset();
    editId = null;
    submitButton.textContent = "도서 등록";
    cancelButton.style.display = "none";
    clearMessages();
}

function showSuccess(msg) {
    formError.textContent = msg;
    formError.style.color = "green";
    formError.style.display = "block";
}

function showError(msg) {
    formError.textContent = msg;
    formError.style.color = "red";
    formError.style.display = "block";
}

function clearMessages() {
    formError.style.display = "none";
}