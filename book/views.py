from django.shortcuts import render, redirect
from .forms import BookForm
from .utils import get_books, post_dado, edit_data, delete_book, get_book_by_id


def index(request):
    books = get_books()
    return render(request, 'book/index.html', {'books': books})


def add_book(request):
    if request.method == 'POST':
        form = BookForm(request.POST)
        if form.is_valid():
            post_dado(
                title=form.cleaned_data['title'],
                author=form.cleaned_data['author'],
                isbn=form.cleaned_data['isbn'],
                price=form.cleaned_data['price'],
                stock=form.cleaned_data['stock']
            )
            return redirect('index')  # Redireciona para a view principal após o cadastro
    else:
        form = BookForm()
    return render(request, 'book/add_book.html', {'form': form})

def edit_book(request, book_id):
    book_data = get_book_by_id(book_id)
    if request.method == 'POST':
        form = BookForm(request.POST)
        if form.is_valid() and request.POST.get('_method') == 'PUT':
            edit_data(
                book_id=book_id,
                title=form.cleaned_data['title'],
                author=form.cleaned_data['author'],
                isbn=form.cleaned_data['isbn'],
                price=form.cleaned_data['price'],
                stock=form.cleaned_data['stock']
            )
            return redirect('index')  # Redireciona para a view principal após a edição
    else:
        if book_data:
            form = BookForm(initial={
                'title': book_data.get('title'),
                'author': book_data.get('author'),
                'isbn': book_data.get('isbn'),
                'price': book_data.get('price'),
                'stock': book_data.get('stock'),
            })
        else:
            form = BookForm()
    return render(request, 'book/edit_book.html', {'form': form, 'book_id': book_id})


def delete_book_view(request, book_id):
    result = delete_book(book_id)
    if result == 204:  # 204 No Content é um status comum para uma resposta DELETE bem-sucedida
        return redirect('index')  # Redireciona para a página de índice após a exclusão
    else:
        return render(request, 'error.html', {'message': 'Failed to delete the book.'})  # Uma página de erro genérica

