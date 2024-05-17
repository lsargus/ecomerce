function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

function add_item_cart(produtoId, quantity) {
    let carrinhoId = localStorage.getItem('carrinhoId');  // Tenta recuperar o ID do carrinho do localStorage

    if (!carrinhoId || carrinhoId === "undefined") {
        carrinhoId = null; // Define como null para evitar que "undefined" seja enviado
    }

    const dataToSend = {
        bookId: produtoId,
        quantity: quantity,
        userId: 1,
        cartId: null
    };

    // Inclui o ID do carrinho no objeto apenas se ele existir
    if (carrinhoId) {
        dataToSend.cartId = carrinhoId;
    }

    fetch('http://localhost:5001/api/carts/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(dataToSend)
    })
        .then(response => response.json())
        .then(data => {
            if (!carrinhoId || carrinhoId === "undefined") {  // Se ainda não havia um ID de carrinho salvo, salva-o
                localStorage.setItem('carrinhoId', data.cartId);
            }
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    const comprarButtons = document.querySelectorAll('.comprar-btn');
    comprarButtons.forEach(button => {
        button.addEventListener('click', function () {
            const produtoId = this.getAttribute('data-id');
            add_item_cart(produtoId, 1);
        });
    });
});

function groupBooksById(books) {
    const groupedBooks = {};

    books.forEach(book => {
        if (!groupedBooks[book.bookId]) {
            groupedBooks[book.bookId] = {
                ...book,
                totalQuantity: 0
            };
        }
        groupedBooks[book.bookId].totalQuantity += book.quantity;
    });

    return Object.values(groupedBooks);
}

document.addEventListener('DOMContentLoaded', function () {
    const cartModal = document.getElementById('cartModal');
    cartModal.addEventListener('show.bs.modal', function () {
        let carrinhoId = localStorage.getItem('carrinhoId');  // Tenta recuperar o ID do carrinho do localStorage

        if (carrinhoId && carrinhoId !== "undefined") {
            fetch('http://localhost:5001/api/carts/' + carrinhoId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
                .then(response => response.json())
                .then(data => {
                    let books = groupBooksById(data.books)
                    displayBooks(books);
                    books.forEach(item => sendCartUpdate(item.bookId, item.totalQuantity))

                })
                .catch(error => console.error('Error:', error));
        }
    });

    function displayBooks(books) {

        const cartItemsContainer = document.getElementById('cartItems');
        cartItemsContainer.innerHTML = '';  // Limpa os itens existentes
        let total = 0;

        books.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.id = `book-${item.bookId}`;
            itemElement.innerHTML = `
            <div>
                ${item.title} - $${item.price} x <input type="number" class="quantity-input" data-book-id="${item.bookId}" data-book-price="${item.price}" value="${item.totalQuantity}" min="1">
            </div>
            `;

            cartItemsContainer.appendChild(itemElement);

            const quantityInput = itemElement.querySelector('.quantity-input');
            quantityInput.addEventListener('change', function () {
                const newQuantity = parseInt(quantityInput.value);
                const oldQuantity = item.totalQuantity;
                const quantityDifference = newQuantity - oldQuantity;
                add_item_cart(item.bookId, quantityDifference);
                item.totalQuantity = newQuantity;  // Update the totalQuantity to the new value
                sendCartUpdate(item.bookId, newQuantity)
                updateCartTotal()
            });
        });

        updateCartTotal()
    }
});

function updateCartTotal() {
    const cartItemsContainer = document.getElementById('cartItems');
    let total = 0;

    // Iterate over each item in the cart
    const items = cartItemsContainer.querySelectorAll('.quantity-input');
    items.forEach(item => {
        const quantity = parseInt(item.value);
        const price = parseFloat(item.getAttribute('data-book-price'));
        total += quantity * price;
    });

    // Update the total display
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}