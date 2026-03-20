# 📚 Guia Rápido de Git e GitHub

Este guia explica como configurar e utilizar o Git para publicar e gerenciar o código deste projeto.

---

## 1. Preparando o Terreno (Configuração Única)
Se você nunca usou o Git nesta máquina, precisa se identificar para que o GitHub saiba quem está enviando o código.

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

---

## 2. Criando um Novo Repositório
Existem dois caminhos: começar do zero no seu PC ou baixar algo que já existe.

### Do zero no seu computador:
1. Abra a pasta do seu projeto no terminal.
2. `git init` (Transforma a pasta comum em um repositório Git).

### Criando no GitHub e enviando:
Após criar o repositório no site do GitHub, você precisa "conectar" sua pasta local com o servidor remoto:
```bash
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
```

---

## 3. O Fluxo de Publicação (O "Cotidiano")
Sempre que você fizer alterações e quiser "publicar", seguirá estes três passos:

| Comando | O que ele faz? |
| :--- | :--- |
| `git add .` | **Prepara**: Seleciona todos os arquivos alterados para o envio. |
| `git commit -m "Mensagem"` | **Carimba**: Cria um ponto na história com uma descrição. |
| `git push origin main` | **Envia**: Sobe seus arquivos carimbados para o GitHub. |

---

## 4. Comandos de "Sobrevivência"
- `git status`: O comando mais importante. Ele te diz o que está acontecendo agora (quais arquivos mudaram, o que foi adicionado).
- `git log`: Mostra o histórico de todos os seus commits (as versões anteriores).
- `git pull`: O inverso do push. Traz as novidades do GitHub para o seu computador.

---

## 💡 Dica de Ouro: Erro de Autenticação
Hoje em dia, o GitHub não aceita mais sua senha comum no terminal. Você precisará de um **Personal Access Token (PAT)** ou configurar uma **Chave SSH**. Se o terminal pedir senha e der erro, lembre-se que ele está esperando o Token, não a senha do site!
