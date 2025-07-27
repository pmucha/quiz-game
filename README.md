# Quiz Multiplayer - Game for Two

Multiplayer quiz game for two players built with Deno, TypeScript, WebSockets, and Deno KV.

## ✨ Features

- **Real-time multiplayer** - WebSocket communication
- **Turn-based system** - fair gameplay with equal chances for both players
- **Rounds** - game lasts up to 3 rounds
- **Scoring** - first player to score 3 points wins (but only if the second player had equal chances)
- **Tie-breaker** - in case of a tie, the game continues until resolved
- **Responsive design** - styled like old, yellowed books
- **Automatic room management** - cleanup of old games

## 🎮 How to play

1. **Create game** - enter your name and click "Create new game"
2. **Share code** - pass the 4-digit code to the second player
3. **Join game** - second player enters the code and their name
4. **Ask questions** - during your turn, create a multiple choice question
5. **Answer** - when the opponent asks a question, choose the answer
6. **Win** - first to score 3 points wins!

## 🏆 Turn System

- Each player has equal chances to ask questions and answer
- Game proceeds in rounds - each player must have a chance to answer in a round
- If a player reaches 3 points but the opponent hasn't had equal chances yet, the game continues
- In case of a tie after 3 rounds, the game goes into tie-breaker mode

## 🚀 Local Development

### Requirements
- [Deno](https://deno.land/) v2.4+

### Installation and running

```bash
# Clone the repository
git clone <repository-url>
cd quiz-game

# Run development server
deno task dev
```

The application will be available at `http://localhost:8000`

## 📦 Deployment to Deno Deploy

1. **Prepare the project**:
   ```bash
   # Make sure all files are ready
   deno task check
   ```

2. **Deploy via GitHub**:
   - Push code to GitHub
   - Connect repository with [Deno Deploy](https://dash.deno.com/)
   - Set entry point to `main.ts`
   - Deployment will be executed automatically

3. **Deploy via CLI**:
   ```bash
   # Install Deno Deploy CLI
   deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

   # Deploy project
   deployctl deploy --project=your-project-name main.ts
   ```

## 🛠 Technologies

- **Backend**: Deno + TypeScript
- **Database**: Deno KV (built-in key-value database)
- **WebSockets**: Native Deno WebSocket API
- **Frontend**: Vue 3 + Tailwind CSS
- **Hosting**: Deno Deploy

## 📁 Project Structure

```
quiz-game/
├── main.ts                # Main server
├── deno.json              # Deno configuration
├── public/
│   └── index.html         # Frontend application
├── src/
│   ├── types/
│   │   └── game.ts        # TypeScript type definitions
│   └── server/
│       └── gameManager.ts # Game logic and room management
└── README.md
```

## 🎨 Design

The application was designed in the style of old, yellowed books with:
- Parchment and ink color scheme
- Serif fonts (Crimson Text, Libre Baskerville)
- Shadows and textures resembling old pages
- Responsive layout

## 🔧 Configuration

### Environment variables
- `PORT` - server port (default 8000)

### Deno permissions
The application requires the following permissions:
- `--allow-net` - network communication
- `--allow-read` - reading static files
- `--allow-write` - writing to Deno KV
- `--allow-env` - access to environment variables
- `--unstable-kv` - access to Deno KV

## 📝 License

MIT License

---

# Quiz Multiplayer - Gra dla Dwóch

Multiplayer quiz game dla dwóch graczy zbudowana z Deno, TypeScript, WebSockets i Deno KV.

## ✨ Funkcje

- **Multiplayer w czasie rzeczywistym** - WebSocket komunikacja
- **System tur** - sprawiedliwa rozgrywka z równymi szansami dla obu graczy
- **Rundy** - gra toczy się przez maksymalnie 3 rundy
- **Punktacja** - pierwszy gracz do 3 punktów wygrywa (ale tylko jeśli drugi miał równe szanse)
- **Dogrywka** - w przypadku remisu gra się dalej do rozstrzygnięcia
- **Responsywny design** - stylizowany na stare, pożółkłe książki
- **Automatyczne zarządzanie pokojami** - czyszczenie starych gier

## 🎮 Jak grać

1. **Stwórz grę** - wpisz swoją nazwę i kliknij "Stwórz nową grę"
2. **Podziel się kodem** - przekaż 4-cyfrowy kod drugiemu graczowi
3. **Dołącz do gry** - drugi gracz wpisuje kod i swoją nazwę
4. **Zadawaj pytania** - w swojej turze stwórz pytanie wielokrotnego wyboru
5. **Odpowiadaj** - gdy przeciwnik zada pytanie, wybierz odpowiedź
6. **Wygraj** - pierwszy do 3 punktów wygrywa!

## 🏆 System tur

- Każdy gracz ma równe szanse na zadawanie pytań i odpowiadanie
- Gra toczy się przez rundy - każdy gracz musi mieć szansę odpowiedzieć w rundzie
- Jeśli gracz osiągnie 3 punkty, ale przeciwnik nie miał jeszcze równych szans, gra trwa dalej
- W przypadku remisu po 3 rundach, gra przechodzi w tryb dogrywki

## 🚀 Uruchomienie lokalnie

### Wymagania
- [Deno](https://deno.land/) v2.4+

### Instalacja i uruchomienie

```bash
# Sklonuj repozytorium
git clone <repository-url>
cd quiz-game

# Uruchom serwer deweloperski
deno task dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:8000`

## 📦 Deployment na Deno Deploy

1. **Przygotuj projekt**:
   ```bash
   # Upewnij się, że wszystkie pliki są gotowe
   deno task check
   ```

2. **Deploy przez GitHub**:
   - Wypchnij kod na GitHub
   - Połącz repozytorium z [Deno Deploy](https://dash.deno.com/)
   - Ustaw entry point na `main.ts`
   - Deploy zostanie wykonany automatycznie

3. **Deploy przez CLI**:
   ```bash
   # Zainstaluj Deno Deploy CLI
   deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

   # Deploy projektu
   deployctl deploy --project=your-project-name main.ts
   ```

## 🛠 Technologie

- **Backend**: Deno + TypeScript
- **Database**: Deno KV (wbudowana baza klucz-wartość)
- **WebSockets**: Natywne WebSocket API Deno
- **Frontend**: Vue 3 + Tailwind CSS
- **Hosting**: Deno Deploy

## 📁 Struktura projektu

```
quiz-game/
├── main.ts                 # Główny serwer
├── deno.json              # Konfiguracja Deno
├── public/
│   └── index.html         # Frontend aplikacji
├── src/
│   ├── types/
│   │   └── game.ts        # Definicje typów TypeScript
│   └── server/
│       └── gameManager.ts # Logika gry i zarządzanie pokojami
└── README.md
```

## 🎨 Design

Aplikacja została zaprojektowana w stylu starych, pożółkłych książek z:
- Kolorystyką pergaminu i atramentu
- Czcionkami serif (Crimson Text, Libre Baskerville)
- Cieniami i teksturami przypominającymi stare strony
- Responsywnym layoutem

## 🔧 Konfiguracja

### Zmienne środowiskowe
- `PORT` - port serwera (domyślnie 8000)

### Deno permissions
Aplikacja wymaga następujących uprawnień:
- `--allow-net` - komunikacja sieciowa
- `--allow-read` - odczyt plików statycznych
- `--allow-write` - zapis do Deno KV
- `--allow-env` - dostęp do zmiennych środowiskowych
- `--unstable-kv` - dostęp do Deno KV

## 📝 Licencja

MIT License