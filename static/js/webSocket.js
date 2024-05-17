let stompClient = null;

function connectWebSocket() {
    const socket = new SockJS('http://localhost:5001/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/cartUpdate', function (cartStatus) {
            updateCartUI(JSON.parse(cartStatus.body));
        });
    });
}

function updateCartUI(cartData) {
    const cartItemsContainer = document.getElementById('cartItems');
    let total = 0;

    const bookElement = cartItemsContainer.querySelector(`#book-${cartData.productId}`);

    if (bookElement) {
        // Adicionar a mensagem recebida do servidor
        const statusMessage = document.createElement('div');
        statusMessage.textContent = `Mensagem: ${cartData.message}`;
        statusMessage.style.color = cartData.status === 'unavailable' || cartData.status === 'partially unavailable' ||  cartData.status === 'low stock' ? 'red' : 'green';

        // Remove mensagens anteriores, se houver
        const previousMessages = bookElement.querySelectorAll('.status-message');
        previousMessages.forEach(msg => bookElement.removeChild(msg));

        statusMessage.classList.add('status-message');
        bookElement.appendChild(statusMessage);
    } else {
        console.log(`Livro com ID ${cartData.productId} não encontrado no carrinho.`);
    }

    // Atualiza o total do carrinho
    const savedBooks = Array.from(cartItemsContainer.children).map(item => {
        return {
            price: parseFloat(item.getAttribute('data-book-price')),
            quantity: parseInt(item.getAttribute('data-book-quantity'))
        };
    });

    updateCartTotal()

}

document.addEventListener('DOMContentLoaded', function () {
    const cartModal = document.getElementById('cartModal');
    cartModal.addEventListener('show.bs.modal', function (e) {
        connectWebSocket();
    });

    cartModal.addEventListener('hidden.bs.modal', function (e) {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    });
});
function sendCartUpdate(productId, quantity) {
    if (!stompClient) {
        connectWebSocket();
    }

    // Espera a conexão ser estabelecida antes de enviar a mensagem
    const checkConnectionAndSend = () => {
        if (stompClient && stompClient.connected) {
            const message = JSON.stringify({ productId: productId, quantity: quantity });
            stompClient.send("/app/updateCart", {}, message);
        } else {
            console.log("WebSocket is not connected. Retrying...");
            setTimeout(checkConnectionAndSend, 500); // Tenta novamente após 500ms
        }
    };

    checkConnectionAndSend();
}
