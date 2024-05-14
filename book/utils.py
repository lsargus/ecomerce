import requests

BASE_URL = 'http://localhost:5001/'


def get_books():
    response = requests.get(BASE_URL + 'api/books')
    if response.status_code == 200:
        return response.json()
    else:
        return []

def get_book_by_id(book_id):
    response = requests.get(f"{BASE_URL}api/books/{book_id}")
    if response.status_code == 200:
        return response.json()
    else:
        return None


def post_dado(title, author, isbn, price, stock):
    url = BASE_URL + 'api/books'
    data = {
        'title': title,
        'author': author,
        'isbn': isbn,
        'price': float(price),
        'stock': stock
    }
    response = requests.post(url, json=data)
    return response.status_code


def edit_data(book_id, title, author, isbn, price, stock):
    url = f"{BASE_URL}api/books/{book_id}"  # A URL inclui o ID do livro para identificação
    data = {
        'title': title,
        'author': author,
        'isbn': isbn,
        'price': float(price),
        'stock': stock
    }
    try:
        response = requests.put(url, json=data)
        return response.status_code  # Retorna o status code para verificação de sucesso
    except requests.RequestException as e:
        print(f"Erro ao editar o livro: {e}")
        return None  # Retorna None indicando que a edição falhou


def delete_book(book_id):
    url = f"{BASE_URL}api/books/{book_id}"
    response = requests.delete(url)
    return response.status_code
