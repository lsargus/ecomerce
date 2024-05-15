from django.db import models

# Create your models here.
class Produto(models.Model):
    nome = models.CharField(max_length=255)
    imagem_url = models.CharField(max_length=1024)
    disponivel = models.BooleanField(default=True)