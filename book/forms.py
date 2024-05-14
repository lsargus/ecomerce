from django import forms

class BookForm(forms.Form):
    title = forms.CharField(label='Title', max_length=100)
    author = forms.CharField(label='Author', max_length=100)
    isbn = forms.CharField(label='isbn', max_length=20)
    price = forms.DecimalField(label='Price', max_digits=6, decimal_places=2)
    stock = forms.IntegerField(label='Stock')
